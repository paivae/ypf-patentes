// ========================================
//        YPF PATENTES V2 - APP PRINCIPAL
// ========================================

// Configuración
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIzGkjLqVA3gk5iYHZeNqxI9_PR0i-EdibAbPmqbg6ivGOSEzuXWG4fklbookcrxjL/exec'; // Reemplaza con tu URL nueva del deploy
const STORAGE_KEYS = {
    PATENTES: 'ypf_patentes',
    PATENTES_VALIDADAS: 'ypf_patentes_validadas',
    DISPOSITIVO_ID: 'ypf_dispositivo_id',
    OFFLINE_QUEUE: 'ypf_offline_queue'
};

// Variables globales
let patentes = [];
let patentesValidadas = new Set();
let dispositivoId = '';
let isOnline = navigator.onLine;
let patenteSeleccionada = '';

// ========================================
//        GESTIÓN DE DISPOSITIVO
// ========================================

// Generar ID único para el dispositivo
function generarDispositivoId() {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Obtener o crear ID del dispositivo
function obtenerDispositivoId() {
    let id = localStorage.getItem(STORAGE_KEYS.DISPOSITIVO_ID);
    if (!id) {
        id = generarDispositivoId();
        localStorage.setItem(STORAGE_KEYS.DISPOSITIVO_ID, id);
    }
    return id;
}

// ========================================
//        GESTIÓN DE CONEXIÓN
// ========================================

// Verificar estado de conexión
function verificarConexion() {
    const wasOnline = isOnline;
    isOnline = navigator.onLine;
    
    const estadoConexion = document.getElementById('estadoConexion');
    
    if (isOnline) {
        estadoConexion.classList.add('d-none');
        if (!wasOnline) {
            // Acabamos de conectarnos, sincronizar
            sincronizarDatosOffline();
        }
    } else {
        estadoConexion.classList.remove('d-none');
    }
}

// Eventos de conexión
window.addEventListener('online', verificarConexion);
window.addEventListener('offline', verificarConexion);

// ========================================
//        ALMACENAMIENTO LOCAL
// ========================================

// Guardar patentes en localStorage
function guardarPatentesLocal() {
    try {
        localStorage.setItem(STORAGE_KEYS.PATENTES, JSON.stringify(patentes));
    } catch (error) {
        console.error('Error guardando patentes:', error);
    }
}

// Cargar patentes desde localStorage
function cargarPatentesLocal() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PATENTES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error cargando patentes:', error);
        return [];
    }
}

// Guardar patentes validadas localmente
function guardarPatentesValidadas() {
    try {
        localStorage.setItem(STORAGE_KEYS.PATENTES_VALIDADAS, JSON.stringify([...patentesValidadas]));
    } catch (error) {
        console.error('Error guardando validaciones:', error);
    }
}

// Cargar patentes validadas
function cargarPatentesValidadas() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PATENTES_VALIDADAS);
        return data ? new Set(JSON.parse(data)) : new Set();
    } catch (error) {
        console.error('Error cargando validaciones:', error);
        return new Set();
    }
}

// ========================================
//        COMUNICACIÓN CON GOOGLE SHEETS
// ========================================

// Cargar patentes desde Google Sheets
async function cargarPatentesDesdeSheets() {
    if (!isOnline) {
        patentes = cargarPatentesLocal();
        renderizarPatentes();
        actualizarEstadisticas();
        return;
    }

    try {
        mostrarIndicadorCarga(true);
        
        // Usar GET para evitar preflight CORS
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

// Sincronizar datos offline
async function sincronizarDatosOffline() {
    if (!isOnline) return;

    try {
        const colaOffline = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
        
        if (colaOffline.length === 0) return;

        mostrarIndicadorCarga(true);
        
        for (const accion of colaOffline) {
            await ejecutarAccionEnServidor(accion);
        }
        
        // Limpiar cola offline
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
        
        // Recargar datos del servidor
        await cargarPatentesDesdeSheets();
        
        mostrarNotificacion('Datos sincronizados exitosamente', 'success');
    } catch (error) {
        console.error('Error sincronizando datos offline:', error);
        mostrarNotificación('Error sincronizando datos', 'danger');
    } finally {
        mostrarIndicadorCarga(false);
    }
}

// Ejecutar acción en servidor
async function ejecutarAccionEnServidor(accion) {
    try {
        // Para acciones simples, usar GET para evitar CORS
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
        // Para datos grandes (agregar patente, sincronizar), usar POST
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

// Agregar acción a cola offline
function agregarAColaOffline(accion) {
    try {
        const cola = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
        cola.push(accion);
        localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(cola));
    } catch (error) {
        console.error('Error agregando a cola offline:', error);
    }
}

// ========================================
//        FUNCIONES PRINCIPALES
// ========================================

// Agregar nueva patente
async function agregarPatente() {
    const form = document.getElementById('formNuevaPatente');
    const patenteTexto = document.getElementById('patente').value.toUpperCase().trim();
    const esDorado = document.getElementById('esDorado').checked;

    // Validaciones
    if (!patenteTexto) {
        mostrarNotificacion('Por favor ingrese una patente', 'warning');
        return;
    }

    const patenteRegex = /^[A-Z]{2,3}[0-9]{3}[A-Z]{0,2}$/;
    if (!patenteRegex.test(patenteTexto)) {
        mostrarNotificacion('Formato de patente inválido. Ej: ABC123', 'warning');
        return;
    }

    // Verificar duplicados
    if (patentes.find(p => p.patente === patenteTexto)) {
        mostrarNotificacion('Esta patente ya está registrada', 'warning');
        return;
    }

    // Crear nueva patente
    const nuevaPatente = {
        patente: patenteTexto,
        fechaRegistro: new Date().toISOString().split('T')[0],
        esDorado: esDorado,
        validaciones: 0,
        inexistente: false
    };

    // Agregar localmente
    patentes.push(nuevaPatente);
    guardarPatentesLocal();
    renderizarPatentes();
    actualizarEstadisticas();

    // Intentar guardar en servidor
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

    // Limpiar formulario y cerrar modal
    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevaPatente'));
    modal.hide();

    mostrarNotificacion(esDorado ? 'Camión dorado registrado' : 'Patente registrada exitosamente', 'success');
}

// Mostrar modal de acciones para una patente
function mostrarAccionesPatente(patente) {
    patenteSeleccionada = patente;
    document.getElementById('patenteSeleccionada').textContent = patente;
    
    const modal = new bootstrap.Modal(document.getElementById('modalAccionesPatente'));
    modal.show();
}

// Copiar patente al portapapeles
async function copiarPatente() {
    try {
        await navigator.clipboard.writeText(patenteSeleccionada);
        mostrarNotificacion('Patente copiada al portapapeles', 'success');
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalAccionesPatente'));
        modal.hide();
        
        // Marcar como validada localmente (atenuada)
        patentesValidadas.add(patenteSeleccionada);
        guardarPatentesValidadas();
        renderizarPatentes();
        
    } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        mostrarNotificacion('Error copiando patente', 'danger');
    }
}

// Validar patente (incrementar contador)
async function validarPatente() {
    const patente = patentes.find(p => p.patente === patenteSeleccionada);
    if (!patente) return;

    // Verificar si ya validó este dispositivo
    if (patentesValidadas.has(patenteSeleccionada)) {
        mostrarNotificacion('Ya validaste esta patente desde este dispositivo', 'warning');
        return;
    }

    // Actualizar localmente
    patente.validaciones++;
    patentesValidadas.add(patenteSeleccionada);
    guardarPatentesLocal();
    guardarPatentesValidadas();
    renderizarPatentes();
    actualizarEstadisticas();

    // Intentar actualizar en servidor
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

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAccionesPatente'));
    modal.hide();

    mostrarNotificacion('Patente validada exitosamente', 'success');
}

// Marcar patente como inexistente
async function marcarInexistente() {
    const patente = patentes.find(p => p.patente === patenteSeleccionada);
    if (!patente) return;

    // Actualizar localmente
    patente.inexistente = true;
    guardarPatentesLocal();
    renderizarPatentes();
    actualizarEstadisticas();

    // Intentar actualizar en servidor
    if (isOnline) {
        try {
            await ejecutarAccionEnServidor({
                accion: 'marcarInexistente',
                patente: patenteSeleccionada
            });
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

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAccionesPatente'));
    modal.hide();

    mostrarNotificacion('Patente marcada como inexistente', 'warning');
}

// ========================================
//        RENDERIZADO DE INTERFAZ
// ========================================

// Renderizar patentes como cards
function renderizarPatentes() {
    const grid = document.getElementById('gridPatentes');
    const mensajeSin = document.getElementById('mensajeSinPatentes');
    
    if (patentes.length === 0) {
        grid.innerHTML = '';
        mensajeSin.style.display = 'block';
        return;
    }
    
    mensajeSin.style.display = 'none';
    
    // Ordenar patentes: doradas primero, luego por validaciones
    const patentesOrdenadas = [...patentes].sort((a, b) => {
        if (a.esDorado && !b.esDorado) return -1;
        if (!a.esDorado && b.esDorado) return 1;
        return b.validaciones - a.validaciones;
    });
    
    grid.innerHTML = patentesOrdenadas.map(patente => {
        const clases = ['patente-card'];
        
        if (patente.esDorado) clases.push('patente-dorada');
        if (patente.inexistente) clases.push('patente-inexistente');
        if (patentesValidadas.has(patente.patente)) clases.push('patente-validada');
        
        const estadoBadge = patente.inexistente ? 
            '<span class="estado-badge inexistente">Inexistente</span>' :
            patente.esDorado ? '<span class="estado-badge dorado">Dorado</span>' : '';
        
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
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar animación de entrada
    const cards = grid.querySelectorAll('.patente-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const total = patentes.length;
    const validacionesTotales = patentes.reduce((sum, p) => sum + p.validaciones, 0);
    const doradas = patentes.filter(p => p.esDorado).length;
    const inexistentes = patentes.filter(p => p.inexistente).length;
    
    document.getElementById('totalPatentes').textContent = total;
    document.getElementById('validacionesTotales').textContent = validacionesTotales;
    document.getElementById('patentesDoradas').textContent = doradas;
    document.getElementById('patentesInexistentes').textContent = inexistentes;
}

// ========================================
//        UTILIDADES
// ========================================

// Mostrar/ocultar indicador de carga
function mostrarIndicadorCarga(mostrar) {
    const indicador = document.getElementById('indicadorCarga');
    if (indicador) {
        indicador.style.display = mostrar ? 'block' : 'none';
    }
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const toast = document.getElementById('toastNotificacion');
    const toastMensaje = document.getElementById('toastMensaje');
    const toastHeader = toast.querySelector('.toast-header i');
    
    toastMensaje.textContent = mensaje;
    
    // Cambiar icono según el tipo
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

// ========================================
//        INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar ID del dispositivo
    dispositivoId = obtenerDispositivoId();
    
    // Cargar patentes validadas localmente
    patentesValidadas = cargarPatentesValidadas();
    
    // Verificar conexión inicial
    verificarConexion();
    
    // Cargar patentes
    cargarPatentesDesdeSheets();
    
    // Configurar formulario de patente
    const patenteInput = document.getElementById('patente');
    if (patenteInput) {
        patenteInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
    }
    
    // Intentar sincronizar datos offline al cargar
    if (isOnline) {
        setTimeout(sincronizarDatosOffline, 2000);
    }
    
    console.log('🚀 YPF Patentes V2 inicializado');
    console.log('📱 Dispositivo ID:', dispositivoId);
    console.log('🌐 Estado de conexión:', isOnline ? 'Online' : 'Offline');
}); 