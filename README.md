# Sphere SSH Client

🌐 **Un cliente SSH moderno y multiplataforma construido con Electron y Node.js**

![Sphere SSH Client](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-green)

## ✨ Características

- 🖥️ **Interfaz moderna y elegante** con tema oscuro
- 🗂️ **Gestión organizada de conexiones** con carpetas y jerarquías
- 🛠️ **Terminal SSH integrado** con soporte para colores ANSI
- 💾 **Persistencia de conexiones** y configuraciones
- 🎨 **Interfaz responsiva** que se adapta a diferentes tamaños de pantalla
- 🔒 **Conexiones seguras** con autenticación por contraseña
- 📱 **Multiplataforma** - Windows, macOS y Linux
- ⚡ **Rendimiento optimizado** para sesiones SSH de larga duración

## 🛠️ Tecnologías

- **Electron** - Framework para aplicaciones de escritorio
- **Node.js** - Runtime de JavaScript
- **SSH2** - Cliente SSH para Node.js
- **HTML/CSS/JavaScript** - Interfaz de usuario moderna
- **Font Awesome** - Iconografía

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 16.0.0
- npm >= 8.0.0

### Clonar e instalar

```bash
git clone https://github.com/kalidus/sphere-client.git
cd sphere-client
npm install
```

## 🎮 Uso

### Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Ejecutar normalmente
npm start
```

### Construcción

```bash
# Construir para todas las plataformas
npm run build

# Construir solo para Windows
npm run build:win

# Construir solo para macOS
npm run build:mac

# Construir solo para Linux
npm run build:linux
```

## 📋 Características Detalladas

### Gestión de Conexiones

- ➕ **Agregar nuevas conexiones SSH** con configuración detallada
- 📁 **Organizar en carpetas** para mejor gestión
- ✏️ **Editar conexiones existentes**
- 🗑️ **Eliminar conexiones y carpetas**
- 💾 **Guardado automático** de configuraciones

### Terminal Integrado

- 🎨 **Soporte completo para códigos ANSI** (colores, formato)
- 📜 **Historial de comandos** con navegación por flechas
- 🔄 **Múltiples pestañas** para sesiones simultáneas
- ⚡ **Ejecución en tiempo real** de comandos
- 📊 **Auto-scroll** y gestión de memoria optimizada

### Interfaz de Usuario

- 🌙 **Tema oscuro moderno** optimizado para largas sesiones
- 📱 **Diseño responsivo** que se adapta al tamaño de ventana
- 🎯 **Indicadores de estado** de conexión en tiempo real
- 🔔 **Notificaciones** informativas y de error
- ⌨️ **Atajos de teclado** para mayor productividad

## 📁 Estructura del Proyecto

```
sphere-client/
├── src/
│   ├── main/
│   │   └── main.js          # Proceso principal de Electron
│   └── renderer/
│       ├── index.html       # Interfaz de usuario
│       ├── app.js          # Lógica de la aplicación
│       └── styles.css      # Estilos de la interfaz
├── data/
│   └── connections.json    # Archivo de conexiones guardadas
├── assets/                 # Recursos e iconos
├── dist/                   # Archivos de distribución
├── package.json           # Configuración del proyecto
└── README.md             # Este archivo
```

## ⚙️ Configuración

### Variables de Entorno

Puedes configurar el comportamiento de la aplicación mediante las siguientes variables:

- `NODE_ENV` - Entorno de ejecución (development/production)
- `DEBUG` - Habilitar logs de depuración

### Archivos de Configuración

- `data/connections.json` - Almacena las conexiones SSH guardadas
- `package.json` - Configuración de Electron Builder para distribución

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] **Autenticación por llave SSH** - Soporte para claves públicas/privadas
- [ ] **Transferencia de archivos** - Cliente SFTP integrado
- [ ] **Túneles SSH** - Port forwarding y túneles seguros
- [ ] **Sesiones guardadas** - Restaurar sesiones al reiniciar
- [ ] **Temas personalizables** - Múltiples esquemas de color
- [ ] **Exportar/Importar** configuraciones
- [ ] **Scripting** - Automatización de comandos
- [ ] **Monitoreo de recursos** - CPU, memoria, red del servidor remoto

## 🐛 Reportar Problemas

Si encuentras algún bug o tienes una sugerencia, por favor [abre un issue](https://github.com/kalidus/sphere-client/issues).

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Sphere SSH Client Team**
- Email: contact@sphere-ssh.com
- GitHub: [@kalidus](https://github.com/kalidus)

## 🙏 Agradecimientos

- [Electron](https://www.electronjs.org/) - Framework multiplataforma
- [SSH2](https://github.com/mscdex/ssh2) - Cliente SSH para Node.js
- [Font Awesome](https://fontawesome.com/) - Iconografía
- Comunidad de desarrolladores de código abierto

---

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!** ⭐