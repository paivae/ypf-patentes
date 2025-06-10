
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIzGkjLqVA3gk5iYHZeNqxI9_PR0i-EdibAbPmqbg6ivGOSEzuXWG4fklbookcrxjL/exec';
const STORAGE_KEYS = {
    PATENTES: 'ypf_patentes',
    PATENTES_VALIDADAS: 'ypf_patentes_validadas',
    DISPOSITIVO_ID: 'ypf_dispositivo_id',
    OFFLINE_QUEUE: 'ypf_offline_queue'
};
let patentes = [];
let patentesValidadas = new Set();
let dispositivoId = '';
let isOnline = navigator.onLine;
let patenteSeleccionada = '';
function generarDispositivoId() {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}
function obtenerDispositivoId() {
    let id = localStorage.getItem(STORAGE_KEYS.DISPOSITIVO_ID);
    if (!id) {
        id = generarDispositivoId();
        localStorage.setItem(STORAGE_KEYS.DISPOSITIVO_ID, id);
    }
    return id;
}
function verificarConexion() {
    const wasOnline = isOnline;
    isOnline = navigator.onLine;
    
    const estadoConexion = document.getElementById('estadoConexion');
    
    if (isOnline) {
        estadoConexion.classList.add('d-none');
        if (!wasOnline) {
            sincronizarDatosOffline();
        }
    } else {
        estadoConexion.classList.remove('d-none');
    }
}
window.addEventListener('online', verificarConexion);
window.addEventListener('offline', verificarConexion);
function guardarPatentesLocal() {
    try {
        localStorage.setItem(STORAGE_KEYS.PATENTES, JSON.stringify(patentes));
    } catch (error) {
        console.error('Error guardando patentes:', error);
    }
}
function cargarPatentesLocal() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PATENTES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error cargando patentes:', error);
        return [];
    }
}
function guardarPatentesValidadas() {
    try {
        localStorage.setItem(STORAGE_KEYS.PATENTES_VALIDADAS, JSON.stringify([...patentesValidadas]));
    } catch (error) {
        console.error('Error guardando validaciones:', error);
    }
}
function cargarPatentesValidadas() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PATENTES_VALIDADAS);
        return data ? new Set(JSON.parse(data)) : new Set();
    } catch (error) {
        console.error('Error cargando validaciones:', error);
        return new Set();
    }
}
function guardarPatentesVistas() {
    try {
        const vistas = patentes.filter(p => p.vista).map(p => p.patente);
        localStorage.setItem('ypf_patentes_vistas', JSON.stringify(vistas));
    } catch (error) {
        console.error('Error guardando vistas:', error);
    }
}
function cargarPatentesVistas() {
    try {
        const vistas = localStorage.getItem('ypf_patentes_vistas');
        if (vistas) {
            return new Set(JSON.parse(vistas));
        }
    } catch (error) {
        console.error('Error cargando vistas:', error);
    }
    return new Set();
}
async function cargarPatentesDesdeSheets() {
    if (!isOnline) {
        patentes = cargarPatentesLocal();
        renderizarPatentes();
        actualizarEstadisticas();
        return;
    }

    try {
        mostrarIndicadorCarga(true);
        const url = `${GOOGLE_SCRIPT_URL}?accion=obtenerPatentes&t=${Date.now()}`;
        const response = await fetch(url, {
            method: 'GET'
        });

        const result = await response.json();
        
        if (result.success) {
            patentes = result.data.patentes || [];
            guardarPatentesLocal();
            renderizarPatentes();
            actualizarEstadisticas();
            console.log('✅ Patentes cargadas desde Google Sheets:', patentes.length);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Error cargando patentes:', error);
        mostrarNotificacion('Error conectando con servidor. Usando datos locales.', 'warning');
        patentes = cargarPatentesLocal();
        renderizarPatentes();
        actualizarEstadisticas();
    } finally {
        mostrarIndicadorCarga(false);
    }
}
async function sincronizarDatosOffline() {
    if (!isOnline) return;

    try {
        const colaOffline = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
        
        if (colaOffline.length === 0) return;

        mostrarIndicadorCarga(true);
        
        for (const accion of colaOffline) {
            await ejecutarAccionEnServidor(accion);
        }
        
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
        await cargarPatentesDesdeSheets();
        
        mostrarNotificacion('Datos sincronizados exitosamente', 'success');
    } catch (error) {
        console.error('Error sincronizando datos offline:', error);
        mostrarNotificación('Error sincronizando datos', 'danger');
    } finally {
        mostrarIndicadorCarga(false);
    }
}
async function ejecutarAccionEnServidor(accion) {
    try {
        if (accion.accion === 'obtenerPatentes' || 
            accion.accion === 'validarPatente' || 
            accion.accion === 'marcarInexistente') {
            
            let url = `${GOOGLE_SCRIPT_URL}?accion=${accion.accion}&t=${Date.now()}`;
            
            if (accion.patente) {
                url += `&patente=${encodeURIComponent(accion.patente)}`;
            }
            if (accion.dispositivo) {
                url += `&dispositivo=${encodeURIComponent(accion.dispositivo)}`;
            }
            
            const response = await fetch(url, { method: 'GET' });
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        }
        else {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(accion)
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        }
    } catch (error) {
        console.error('Error en ejecutarAccionEnServidor:', error);
        throw error;
    }
}
function agregarAColaOffline(accion) {
    try {
        const cola = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
        cola.push(accion);
        localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(cola));
    } catch (error) {
        console.error('Error agregando a cola offline:', error);
    }
}


async function agregarPatente() {
    const form = document.getElementById('formNuevaPatente');
    const patenteTexto = document.getElementById('patente').value.toUpperCase().trim();
    const esDorado = document.getElementById('esDorado').checked;


    if (!patenteTexto) {
        mostrarNotificacion('Por favor ingrese una patente', 'warning');
        return;
    }

    const patenteRegex = /^[A-Z]{2,3}[0-9]{3}[A-Z]{0,2}$/;
    if (!patenteRegex.test(patenteTexto)) {
        mostrarNotificacion('Formato de patente inválido. Ej: ABC123', 'warning');
        return;
    }


    if (patentes.find(p => p.patente === patenteTexto)) {
        mostrarNotificacion('Esta patente ya está registrada', 'warning');
        return;
    }


    const nuevaPatente = {
        patente: patenteTexto,
        fechaRegistro: new Date().toISOString().split('T')[0],
        esDorado: esDorado,
        validaciones: 0,
        inexistente: false
    };


    patentes.push(nuevaPatente);
    guardarPatentesLocal();
    renderizarPatentes();
    actualizarEstadisticas();


    if (isOnline) {
        try {
            await ejecutarAccionEnServidor({
                accion: 'agregarPatente',
                patente: nuevaPatente
            });
        } catch (error) {
            console.error('Error guardando en servidor:', error);
            agregarAColaOffline({
                accion: 'agregarPatente',
                patente: nuevaPatente
            });
            mostrarNotificacion('Patente guardada localmente. Se sincronizará cuando haya conexión.', 'info');
        }
    } else {
        agregarAColaOffline({
            accion: 'agregarPatente',
            patente: nuevaPatente
        });
        mostrarNotificacion('Patente guardada offline. Se sincronizará cuando haya conexión.', 'info');
    }


    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevaPatente'));
    modal.hide();

    mostrarNotificacion(esDorado ? 'Camión dorado registrado' : 'Patente registrada exitosamente', 'success');
}
function mostrarAccionesPatente(patente) {
    patenteSeleccionada = patente;
    document.getElementById('patenteSeleccionada').textContent = patente;
    
    const modal = new bootstrap.Modal(document.getElementById('modalAccionesPatente'));
    modal.show();
}
async function copiarPatente() {
    try {
        await navigator.clipboard.writeText(patenteSeleccionada);
        mostrarNotificacion('Patente copiada al portapapeles', 'success');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalAccionesPatente'));
        modal.hide();
        
        // Marcar la patente como vista (no validada)
        const patente = patentes.find(p => p.patente === patenteSeleccionada);
        if (patente) {
            patente.vista = true;
            guardarPatentesLocal();
            guardarPatentesVistas();
        }
        
        renderizarPatentes();
        
    } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        mostrarNotificacion('Error copiando patente', 'danger');
    }
}
async function validarPatente() {
    const patente = patentes.find(p => p.patente === patenteSeleccionada);
    if (!patente) return;


    if (patentesValidadas.has(patenteSeleccionada)) {
        mostrarNotificacion('Ya validaste esta patente desde este dispositivo', 'warning');
        return;
    }

    patente.validaciones++;
    patentesValidadas.add(patenteSeleccionada);
    guardarPatentesLocal();
    guardarPatentesValidadas();
    renderizarPatentes();
    actualizarEstadisticas();
    if (isOnline) {
        try {
            await ejecutarAccionEnServidor({
                accion: 'validarPatente',
                patente: patenteSeleccionada,
                dispositivo: dispositivoId
            });
        } catch (error) {
            console.error('Error validando en servidor:', error);
            agregarAColaOffline({
                accion: 'validarPatente',
                patente: patenteSeleccionada,
                dispositivo: dispositivoId
            });
        }
    } else {
        agregarAColaOffline({
            accion: 'validarPatente',
            patente: patenteSeleccionada,
            dispositivo: dispositivoId
        });
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAccionesPatente'));
    modal.hide();

    mostrarNotificacion('Patente validada exitosamente', 'success');
}


async function marcarInexistente() {
    const patente = patentes.find(p => p.patente === patenteSeleccionada);
    if (!patente) return;


    patente.marcasInexistente = (patente.marcasInexistente || 0) + 1;
    patente.inexistente = true;
    patente.vista = true;
    

    patentesValidadas.add(patente.patente);
    guardarPatentesValidadas();
    

    guardarPatentesVistas();
    
    guardarPatentesLocal();
    renderizarPatentes();
    actualizarEstadisticas();


    if (isOnline) {
        try {
            const resultado = await ejecutarAccionEnServidor({
                accion: 'marcarInexistente',
                patente: patenteSeleccionada
            });
            

            if (resultado.marcasInexistente) {
                patente.marcasInexistente = resultado.marcasInexistente;
            }
        } catch (error) {
            console.error('Error marcando inexistente en servidor:', error);
            agregarAColaOffline({
                accion: 'marcarInexistente',
                patente: patenteSeleccionada
            });
        }
    } else {
        agregarAColaOffline({
            accion: 'marcarInexistente',
            patente: patenteSeleccionada
        });
    }


    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAccionesPatente'));
    modal.hide();

    mostrarNotificacion('Patente marcada como inexistente', 'warning');
}


function renderizarPatentes() {
    const grid = document.getElementById('gridPatentes');
    const mensajeSin = document.getElementById('mensajeSinPatentes');
    
    if (patentes.length === 0) {
        grid.innerHTML = '';
        mensajeSin.style.display = 'block';
        return;
    }
    
    mensajeSin.style.display = 'none';
    

    const patentesOrdenadas = [...patentes].sort((a, b) => {
        const aVista = patentesValidadas.has(a.patente) || a.vista;
        const bVista = patentesValidadas.has(b.patente) || b.vista;
        
        if (aVista && !bVista) return 1;
        if (!aVista && bVista) return -1;
        if (a.esDorado && !b.esDorado) return -1;
        if (!a.esDorado && b.esDorado) return 1;
        return b.validaciones - a.validaciones;
    });
    
    grid.innerHTML = patentesOrdenadas.map(patente => {
        const clases = ['patente-card'];
        
        if (patente.esDorado) clases.push('patente-dorada');
        if (patente.marcasInexistente && patente.marcasInexistente > 0) clases.push('patente-inexistente');
        if (patentesValidadas.has(patente.patente)) clases.push('patente-validada');
        if (patente.vista) clases.push('patente-vista');
        
        const estadoBadge = (patente.marcasInexistente && patente.marcasInexistente > 0) ? 
            `<span class="validaciones-badge inexistente-badge"><i class="bi bi-x-circle"></i> ${patente.marcasInexistente}</span>` : '';
        
        const vistoBadge = patente.vista ? 
            `<span class="validaciones-badge visto-badge"><i class="bi bi-eye"></i> Visto</span>` : '';
        
        return `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="${clases.join(' ')}" onclick="mostrarAccionesPatente('${patente.patente}')">
                    <div class="patente-numero">${patente.patente}</div>
                    <div class="patente-info">
                        <span class="validaciones-badge">
                            <i class="bi bi-check-circle"></i>
                            ${patente.validaciones}
                        </span>
                        ${estadoBadge}
                        ${vistoBadge}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    

    const cards = grid.querySelectorAll('.patente-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
}


function actualizarEstadisticas() {
    const total = patentes.length;
    const validacionesTotales = patentes.reduce((sum, p) => sum + p.validaciones, 0);
    const doradas = patentes.filter(p => p.esDorado).length;
    const inexistentes = patentes.filter(p => p.marcasInexistente && p.marcasInexistente > 0).length;
    
    document.getElementById('totalPatentes').textContent = total;
    document.getElementById('validacionesTotales').textContent = validacionesTotales;
    document.getElementById('patentesDoradas').textContent = doradas;
    document.getElementById('patentesInexistentes').textContent = inexistentes;
}


function mostrarIndicadorCarga(mostrar) {
    const indicador = document.getElementById('indicadorCarga');
    if (indicador) {
        indicador.style.display = mostrar ? 'block' : 'none';
    }
}


function mostrarNotificacion(mensaje, tipo) {
    const toast = document.getElementById('toastNotificacion');
    const toastMensaje = document.getElementById('toastMensaje');
    const toastHeader = toast.querySelector('.toast-header i');
    
    toastMensaje.textContent = mensaje;
    

    const iconos = {
        success: 'bi bi-check-circle-fill text-success',
        warning: 'bi bi-exclamation-triangle-fill text-warning',
        danger: 'bi bi-x-circle-fill text-danger',
        info: 'bi bi-info-circle-fill text-info'
    };
    
    toastHeader.className = iconos[tipo] + ' me-2';
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

document.addEventListener('DOMContentLoaded', function() {
    dispositivoId = obtenerDispositivoId();
    

    patentesValidadas = cargarPatentesValidadas();
    

    const patentesVistas = cargarPatentesVistas();
    

    verificarConexion();
    

    cargarPatentesDesdeSheets();
    

    setTimeout(() => {
        patentes.forEach(patente => {

            if (patentesVistas.has(patente.patente)) {
                patente.vista = true;
                patentesValidadas.add(patente.patente);
            }

            else if (patente.marcasInexistente && patente.marcasInexistente > 0) {
                patente.vista = true;
                patentesValidadas.add(patente.patente);
            }
        });
        guardarPatentesValidadas();
        guardarPatentesVistas();
        renderizarPatentes();
    }, 1000);
    

    const patenteInput = document.getElementById('patente');
    if (patenteInput) {
        patenteInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
    }
    

    if (isOnline) {
        setTimeout(sincronizarDatosOffline, 2000);
    }
    
    console.log('🚀 YPF Patentes V2 inicializado');
    console.log('📱 Dispositivo ID:', dispositivoId);
    console.log('🌐 Estado de conexión:', isOnline ? 'Online' : 'Offline');
}); 