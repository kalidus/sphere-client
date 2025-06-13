# 🚀 Sphere SSH Client - Explorador de Sesiones Avanzado

![Version](https://img.shields.io/badge/version-2.0-blue) ![Status](https://img.shields.io/badge/status-ready-green) ![Features](https://img.shields.io/badge/features-drag%20%26%20drop%20%2B%20edit-orange)

Un cliente SSH moderno con funcionalidades avanzadas de organización y gestión de conexiones.

## ✨ Nuevas Funcionalidades Implementadas

### 🖱️ Drag & Drop de Conexiones
- **Arrastra conexiones** entre carpetas intuitivamente
- **Mover a raíz** arrastrando al área vacía
- **Indicadores visuales** durante el proceso
- **Validación inteligente** para prevenir errores

### ✏️ Edición de Nombres de Carpetas
- **Doble clic** para editar nombres rápidamente
- **Botón de editar** en las acciones de cada carpeta
- **Validación de duplicados** en tiempo real
- **Reversión automática** en caso de errores

---

## 🎯 Características Principales

### 🔧 Funcionalidades Core
- ✅ **Conexiones SSH** con autenticación por contraseña
- ✅ **Terminal integrado** con soporte ANSI completo
- ✅ **Organización en carpetas** jerárquica
- ✅ **Drag & Drop** para reorganización
- ✅ **Edición inline** de nombres
- ✅ **Persistencia automática** de configuraciones

### 🎨 Interfaz de Usuario
- 🎭 **Tema oscuro** optimizado para terminales
- 🌈 **Indicadores visuales** con colores y animaciones
- 📱 **Responsive** adaptable a diferentes pantallas
- ⚡ **Animaciones suaves** con 60fps
- 🖱️ **Cursores contextuales** (grab, text, pointer)

### 🛡️ Seguridad y Validación
- 🔒 **Validación de entrada** en todos los campos
- 🚫 **Prevención de duplicados** por nivel de carpetas
- 🔄 **Rollback automático** en caso de errores
- 💾 **Backup automático** de configuraciones

---

## 📋 Guía de Uso Rápido

### 🚀 Iniciando
1. **Ejecuta** `npm start` o usa el archivo batch incluido
2. **Crea** tu primera carpeta con "Nueva Carpeta"
3. **Agrega** conexiones SSH con "Nueva Conexión"
4. **Organiza** usando drag & drop

### 🖱️ Drag & Drop
```
🎯 Arrastrar Conexión:
   1. Mantén clic en una conexión
   2. Arrastra sobre una carpeta
   3. Suelta para mover

🎯 Mover a Raíz:
   1. Arrastra conexión al área vacía
   2. Aparece "Soltar aquí para mover a la raíz"
   3. Suelta para sacar de carpeta
```

### ✏️ Editar Nombres
```
🎯 Edición Rápida:
   1. Doble clic en nombre de carpeta
   2. Escribe nuevo nombre
   3. Presiona Enter para guardar
   4. ESC para cancelar

🎯 Usando Botón:
   1. Hover sobre carpeta
   2. Clic en icono de lápiz
   3. Edita y guarda
```

---

## 🎨 Indicadores Visuales

### 🌈 Códigos de Color
| Color | Significado | Uso |
|-------|-------------|-----|
| 🔵 **Azul** | Zonas disponibles | Drag zones, campos editables |
| 🟢 **Verde** | Éxito/Confirmación | Drop zones activas, guardado |
| 🔴 **Rojo** | Error/Advertencia | Validaciones fallidas |
| 🟡 **Amarillo** | En progreso | Guardando, procesando |
| 🔷 **Cian** | Zona raíz | Área para sacar de carpetas |

### 🎭 Efectos y Animaciones
- **⋮⋮ Puntos de agarre**: Aparecen en hover de conexiones
- **✏️ Icono de lápiz**: Indica nombres editables
- **🔄 Rotación sutil**: Elementos siendo arrastrados
- **📥 Iconos dinámicos**: Cambian según estado del drop
- **💫 Pulso suave**: Carpetas editables

---

## ⌨️ Atajos de Teclado

| Acción | Atajo | Descripción |
|--------|-------|-------------|
| **Guardar nombre** | `Enter` | Confirma edición de carpeta |
| **Cancelar edición** | `Escape` | Cancela cambios |
| **Editar carpeta** | `Doble clic` | Activa modo de edición |
| **Conectar SSH** | `Doble clic` | En conexiones para conectar |
| **Interrumpir** | `Ctrl+C` | En terminal activo |
| **Limpiar terminal** | `Ctrl+L` | Limpia pantalla del terminal |

---

## 🔧 Instalación y Configuración

### 📦 Requisitos
- **Node.js** 16+ 
- **npm** o **yarn**
- **Windows** 10/11 (optimizado)
- **Conexión SSH** a servidores remotos

### 🚀 Instalación Rápida
```bash
# 1. Clonar repositorio
git clone https://github.com/kalidus/sphere-client.git
cd sphere-client

# 2. Instalar dependencias
npm install

# 3. Ejecutar aplicación
npm start
```

### ⚙️ Configuración
- Las conexiones se guardan en `data/connections.json`
- Configuración automática en el primer uso
- Backup automático de configuraciones

---

## 📁 Estructura del Proyecto

```
Sphere-Client/
├── 📂 src/
│   ├── 📂 main/
│   │   └── 📄 main.js          # Proceso principal Electron
│   └── 📂 renderer/
│       ├── 📄 app.js           # Lógica principal de la app
│       ├── 📄 styles.css       # Estilos y tema
│       └── 📄 index.html       # Interfaz principal
├── 📂 data/
│   └── 📄 connections.json     # Conexiones guardadas
├── 📄 package.json             # Dependencias
└── 📄 README.md               # Este archivo
```

---

## 🧪 Testing y Desarrollo

### 🐛 Debug Mode
```bash
# Ejecutar con debug
npm run dev

# O activar DevTools
Ctrl + Shift + I (en la aplicación)
```

### 📊 Logs de Desarrollo
- Eventos de drag & drop loggeados en consola
- Validaciones de entrada mostradas
- Estados de conexión SSH trackeados

---

## 🎯 Casos de Uso Comunes

### 🏢 Organización Empresarial
```
📂 Mi Empresa
├── 🌐 Servidores Web
│   ├── Apache Producción
│   ├── Nginx Load Balancer
│   └── CDN Server
├── 🗄️ Bases de Datos
│   ├── MySQL Principal
│   ├── Redis Cache
│   └── MongoDB Analytics
├── 🚀 Desarrollo
│   ├── Dev Server
│   ├── Test Environment
│   └── Staging Server
└── 🔧 Infraestructura
    ├── DNS Server
    ├── VPN Gateway
    └── Monitoring
```

### 🏠 Uso Personal
```
📂 Mis Servidores
├── 🏠 Casa
│   ├── Raspberry Pi
│   ├── Home Server
│   └── NAS Synology
├── ☁️ Cloud
│   ├── AWS EC2
│   ├── Google Cloud
│   └── DigitalOcean
└── 🎮 Gaming
    ├── Minecraft Server
    └── Discord Bot
```

---

## 🛠️ Solución de Problemas

### ❓ Problemas Comunes

**🔴 No se puede arrastrar conexiones**
- Verifica que las conexiones tengan el atributo `draggable`
- Comprueba que no hay errores en la consola
- Reinicia la aplicación

**🔴 La edición de nombres no funciona**
- Asegúrate de hacer doble clic en el nombre
- Verifica que no hay otra edición activa
- Comprueba permisos de escritura

**🔴 Conexiones SSH fallan**
- Verifica credenciales de acceso
- Comprueba conectividad de red
- Revisa configuración del firewall

### 🔧 Comandos de Diagnóstico
```bash
# Limpiar caché
npm run clean

# Reinstalar dependencias
rm -rf node_modules && npm install

# Resetear configuración
rm data/connections.json
```

---

## 🤝 Contribución

### 🎯 Áreas de Mejora
- [ ] **Menú contextual completo** (clic derecho)
- [ ] **Búsqueda avanzada** de conexiones
- [ ] **Importar/Exportar** configuraciones
- [ ] **Atajos de teclado** adicionales
- [ ] **Temas personalizables**
- [ ] **Soporte para claves SSH**

### 📝 Reportar Issues
1. Describe el problema detalladamente
2. Incluye pasos para reproducir  
3. Adjunta logs de la consola
4. Especifica versión del sistema

---

## 📜 Licencia y Créditos

### 📄 Licencia
Este proyecto está bajo licencia MIT. Consulta `LICENSE` para más detalles.

### 🙏 Tecnologías Utilizadas
- **Electron** - Framework de aplicación desktop
- **Node.js** - Runtime de JavaScript
- **SSH2** - Cliente SSH para Node.js
- **Font Awesome** - Iconos
- **CSS Grid/Flexbox** - Layout responsive

### 👨‍💻 Autor
Desarrollado con ❤️ para mejorar la gestión de conexiones SSH

---

## 🚀 Changelog

### 📅 Versión 2.0 (Actual)
- ✅ **Drag & Drop** de conexiones entre carpetas
- ✅ **Edición inline** de nombres de carpetas  
- ✅ **Validaciones avanzadas** y rollback automático
- ✅ **Indicadores visuales** mejorados
- ✅ **Optimizaciones de rendimiento**

### 📅 Versión 1.0
- ✅ Cliente SSH básico
- ✅ Terminal integrado
- ✅ Organización en carpetas
- ✅ Persistencia de configuraciones

---

## 🔮 Roadmap Futuro

### 🎯 Próximas Versiones
- **v2.1**: Menú contextual completo
- **v2.2**: Búsqueda y filtros avanzados
- **v2.3**: Soporte para claves SSH
- **v3.0**: Sincronización en la nube

---

*¿Necesitas ayuda? Crea un issue en GitHub o consulta la documentación.*

**¡Disfruta organizando tus conexiones SSH! 🚀**