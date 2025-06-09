# 🚛 YPF Patentes - Registro de Camiones Cisternas

> Aplicación web para el registro y validación de patentes de camiones cisternas YPF en el marco de la **Promo INFINIA 2025**

## 📖 Descripción del Proyecto

Esta aplicación permite a los usuarios registrar las patentes de los **2,657 camiones cisternas de YPF** que recorren todo el país como parte de la promoción INFINIA, donde se pueden **ganar hasta 10 años de combustible INFINIA** por encontrar y registrar las patentes de estos camiones especiales.

### 🎯 Funcionalidades Principales

- **📝 Registro de Patentes**: Captura y almacenamiento de patentes de camiones YPF
- **⭐ Identificación de Camiones Dorados**: Marcado especial para camiones premium que otorgan mayores premios
- **✅ Sistema de Validación**: Contador de validaciones por patente con prevención de duplicados por dispositivo
- **❌ Marcado de Inexistentes**: Sistema para reportar patentes erróneas o inexistentes
- **📊 Dashboard de Estadísticas**: Visualización en tiempo real de métricas importantes
- **📱 Funcionalidad Offline**: Trabajo sin conexión con sincronización automática
- **📋 Copia de Patentes**: Funcionalidad para copiar patentes al portapapeles

### 🏆 Sobre la Promoción INFINIA

La **Promo INFINIA 2025** de YPF permite a los participantes:
- **🥇 Premio Principal**: 1 ganador de 10 años de combustible INFINIA
- **🏅 Premios Secundarios**: 10 ganadores de 1 año de combustible INFINIA
- **🔍 Mecánica**: Encontrar y registrar patentes de los 2,657 camiones YPF que recorren Argentina
- **📱 Participación**: Exclusiva a través de la App YPF oficial

*Más información en: [https://energia-argentina.ypf.com/promo-infinia.html](https://energia-argentina.ypf.com/promo-infinia.html)*

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica y moderna
- **CSS3** - Estilos personalizados con variables CSS
- **JavaScript ES6+** - Lógica de aplicación moderna
- **Bootstrap 5.3** - Framework CSS responsive
- **Bootstrap Icons** - Iconografía consistente
- **Progressive Web App (PWA)** - Funcionalidades nativas

### Backend y Almacenamiento
- **Google Apps Script** - Lógica de servidor y API
- **Google Sheets** - Base de datos en la nube
- **LocalStorage** - Almacenamiento local para funcionalidad offline

### Servicios Adicionales
- **Firebase Analytics** - Seguimiento y análisis de uso
- **Service Worker** - Funcionalidad offline y caché
- **Fetch API** - Comunicación asíncrona con el servidor

## 🏗️ Arquitectura del Sistema

### Patrón de Arquitectura
El sistema implementa una **arquitectura híbrida offline-first** con los siguientes componentes:

1. **Capa de Presentación** (Frontend)
   - Interfaz responsive con Bootstrap
   - Gestión de estado en JavaScript
   - Almacenamiento local para offline

2. **Capa de Comunicación** (API)
   - Google Apps Script como servidor
   - Sincronización bidireccional de datos
   - Manejo de errores y reconexión

3. **Capa de Persistencia** (Backend)
   - Google Sheets como base de datos
   - LocalStorage para caché local
   - Cola de acciones offline

### Flujo de Datos
```
Usuario → Frontend → LocalStorage ↔ Google Apps Script → Google Sheets
                           ↓
                    Firebase Analytics
```

## 📁 Estructura del Proyecto

```
ypf-patentes/
├── index.html              # Aplicación principal
├── assets/
│   ├── app.js              # Lógica de aplicación
│   ├── styles.css          # Estilos personalizados
│   ├── bootstrap.min.css   # Framework CSS
│   └── bootstrap.bundle.min.js # Framework JS
├── GoogleAppsScript_V2.js  # Backend en Google Apps Script
├── CONFIGURACION.md        # Documentación de configuración
└── README.md              # Este archivo
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Navegador web moderno
- Conexión a internet (para sincronización)
- Cuenta de Google (para configurar backend)

### Configuración del Backend (Google Apps Script)

1. **Crear nuevo projeto en Google Apps Script**
   ```
   https://script.google.com
   ```

2. **Copiar el código del archivo `GoogleAppsScript_V2.js`**

3. **Configurar Google Sheets**
   - Crear una nueva hoja de cálculo
   - Copiar el ID de la hoja
   - Actualizar la variable `SHEET_ID` en el script

4. **Desplegar como Web App**
   - Ejecutar > Desplegar > Nueva implementación
   - Tipo: Aplicación web
   - Acceso: Cualquier persona

### Configuración del Frontend

1. **Actualizar URL del Google Apps Script**
   ```javascript
   // En assets/app.js, línea 6
   const GOOGLE_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT';
   ```

2. **Configurar Firebase (opcional)**
   ```javascript
   // En index.html, actualizar configuración de Firebase
   const firebaseConfig = {
     // Tu configuración de Firebase
   };
   ```

## 💡 Funcionalidades Técnicas Destacadas

### 🔄 Sistema Offline-First
- **Almacenamiento local**: Todas las acciones se guardan localmente primero
- **Cola de sincronización**: Las acciones offline se encolan para sincronizar
- **Detección de conexión**: Monitoreo automático del estado de conectividad
- **Sincronización automática**: Al recuperar conexión, sincroniza automáticamente

### 🔐 Control de Duplicados
- **ID de dispositivo único**: Cada dispositivo genera un identificador único
- **Validación por dispositivo**: Previene validaciones múltiples del mismo dispositivo
- **Persistencia local**: Los estados se mantienen entre sesiones

### 📊 Métricas en Tiempo Real
- **Total de patentes**: Contador de patentes registradas
- **Validaciones totales**: Suma de todas las validaciones
- **Camiones dorados**: Contador de camiones especiales
- **Patentes inexistentes**: Contador de reportes de patentes erróneas

## 🎨 Diseño y UX

### Principios de Diseño
- **Mobile-First**: Diseño responsivo que prioriza dispositivos móviles
- **Accesibilidad**: Cumple con estándares WCAG básicos
- **Usabilidad**: Interfaz intuitiva con feedback visual claro
- **Performance**: Carga rápida y funcionamiento fluido

### Paleta de Colores YPF
- **Primario**: `#1E3A8A` (Azul YPF)
- **Secundario**: `#FCD34D` (Amarillo/Dorado)
- **Éxito**: `#10B981` (Verde)
- **Peligro**: `#EF4444` (Rojo)
- **Advertencia**: `#F59E0B` (Naranja)

## 🔧 API y Endpoints

### Endpoints Disponibles

```javascript
// Obtener todas las patentes
GET ?accion=obtenerPatentes

// Agregar nueva patente
POST { accion: 'agregarPatente', patente: {...} }

// Validar patente existente
GET ?accion=validarPatente&patente=ABC123&dispositivo=device_id

// Marcar patente como inexistente
GET ?accion=marcarInexistente&patente=ABC123

// Sincronizar datos offline
POST { accion: 'sincronizarPatentes', patentes: [...] }
```

### Estructura de Datos

```javascript
// Estructura de una patente
{
  patente: "ABC123",           // String: Número de patente
  fechaRegistro: "ISO Date",   // String: Fecha de registro
  esDorado: false,             // Boolean: Es camión dorado
  validaciones: 0,             // Number: Contador de validaciones
  inexistente: false,          // Boolean: Marcado como inexistente
  marcasInexistente: 0,        // Number: Contador de marcas inexistentes
  vista: false                 // Boolean: Estado visual local
}
```

## 📱 Uso de la Aplicación

### Para Usuarios Finales

1. **Registrar Patente**
   - Hacer clic en "Nueva Patente"
   - Ingresar número de patente
   - Marcar si es "Camión Dorado"
   - Confirmar registro

2. **Validar Patente**
   - Hacer clic en una patente existente
   - Seleccionar "Validar Patente"
   - Se incrementa el contador (una vez por dispositivo)

3. **Copiar Patente**
   - Hacer clic en una patente
   - Seleccionar "Copiar Patente"
   - La patente se copia al portapapeles

4. **Marcar Inexistente**
   - Hacer clic en una patente errónea
   - Seleccionar "Marcar Inexistente"
   - Ayuda a limpiar la base de datos

## 🔒 Consideraciones de Seguridad

- **Validación de entrada**: Todos los datos se validan en frontend y backend
- **Prevención de spam**: Sistema de identificación por dispositivo
- **Rate limiting**: Control de frecuencia de peticiones
- **Sanitización**: Los datos se limpian antes de almacenar

## 🧪 Testing y Calidad

### Testing Manual
- ✅ Funcionalidad offline
- ✅ Sincronización de datos
- ✅ Responsividad móvil
- ✅ Validación de formularios
- ✅ Estados de error

### Métricas de Performance
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🚀 Despliegue

### Opciones de Hosting
1. **GitHub Pages** (Recomendado para desarrollo)
2. **Netlify** (Recomendado para producción)
3. **Vercel** (Alternativa moderna)
4. **Firebase Hosting** (Si ya usas Firebase)

### Variables de Entorno
```javascript
// Configurar en assets/app.js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/...';
const FIREBASE_CONFIG = { /* configuración */ };
```

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### Estándares de Código
- **JavaScript**: ES6+ con JSDoc
- **CSS**: BEM methodology
- **HTML**: Semántico y accesible
- **Git**: Conventional Commits

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🆘 Soporte

### Problemas Comunes

**La aplicación no sincroniza**
- Verificar conexión a internet
- Comprobar URL de Google Apps Script
- Revisar consola del navegador

**No aparecen las patentes**
- Verificar configuración de Google Sheets
- Comprobar permisos de la Web App
- Revisar formato de datos

**Error de CORS**
- Configurar correctamente Google Apps Script
- Usar peticiones GET para operaciones simples
- Verificar headers de respuesta

### Contacto
Para soporte técnico o consultas sobre el proyecto, crear un issue en GitHub.

---

**Desarrollado con ❤️ para la comunidad YPF Argentina**

*Este proyecto no es oficial de YPF. Es una herramienta comunitaria para facilitar la participación en la Promo INFINIA.* 