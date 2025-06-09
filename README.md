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
└── README.md              # Este archivo
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

### Contacto
Para soporte técnico o consultas sobre el proyecto, podes enviarme un correo a [hola@paivae.com](hola@paivae.com)

---

**Desarrollado con ❤️ para la comunidad YPF Argentina**

*Este proyecto no es oficial de YPF. Es una herramienta comunitaria para facilitar la participación en la Promo INFINIA.* 