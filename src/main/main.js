const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { Client } = require('ssh2');
const { v4: uuidv4 } = require('uuid');

class SphereSSHClient {
  constructor() {
    this.connections = new Map();
    this.sshStreams = new Map();
    this.mainWindow = null;
    this.connectionsFile = path.join(__dirname, '../../data/connections.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.connectionsFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      },
      titleBarStyle: 'default',
      icon: path.join(__dirname, '../../assets/icon.svg'),
      show: false
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Abrir DevTools en desarrollo
    if (process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  setupIPC() {
    // Cargar conexiones guardadas
    ipcMain.handle('load-connections', () => {
      try {
        if (fs.existsSync(this.connectionsFile)) {
          const data = fs.readFileSync(this.connectionsFile, 'utf8');
          return JSON.parse(data);
        }
        return [];
      } catch (error) {
        console.error('Error loading connections:', error);
        return [];
      }
    });

    // Guardar conexiones
    ipcMain.handle('save-connections', (event, connections) => {
      try {
        fs.writeFileSync(this.connectionsFile, JSON.stringify(connections, null, 2));
        return { success: true };
      } catch (error) {
        console.error('Error saving connections:', error);
        return { success: false, error: error.message };
      }
    });

    // Conectar SSH
    ipcMain.handle('ssh-connect', async (event, config) => {
      return new Promise((resolve) => {
        const conn = new Client();
        const connectionId = uuidv4();
        
        conn.on('ready', () => {
          this.connections.set(connectionId, conn);
          console.log('SSH connection established');
          resolve({ success: true, connectionId });
        });

        conn.on('error', (err) => {
          console.error('SSH connection error:', err);
          resolve({ success: false, error: err.message });
        });

        const connectionOptions = {
          host: config.host,
          port: config.port || 22,
          username: config.username,
          readyTimeout: 20000
        };

        if (config.password) {
          connectionOptions.password = config.password;
        }

        conn.connect(connectionOptions);
      });
    });

    // Crear terminal SSH (versión simplificada sin node-pty)
    ipcMain.handle('create-ssh-terminal', async (event, connectionId) => {
      return new Promise((resolve) => {
        const conn = this.connections.get(connectionId);
        if (!conn) {
          resolve({ success: false, error: 'Connection not found' });
          return;
        }

        conn.shell((err, stream) => {
          if (err) {
            console.error('Shell creation error:', err);
            resolve({ success: false, error: err.message });
            return;
          }

          const terminalId = uuidv4();
          this.sshStreams.set(terminalId, { stream, connectionId });

          // Configurar codificación UTF-8
          stream.setEncoding('utf8');

          // Enviar datos del terminal al renderer
          stream.on('data', (data) => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
              this.mainWindow.webContents.send('terminal-data', terminalId, data);
            }
          });

          stream.on('close', () => {
            this.sshStreams.delete(terminalId);
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
              this.mainWindow.webContents.send('terminal-closed', terminalId);
            }
          });

          stream.on('error', (err) => {
            console.error('Stream error:', err);
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
              this.mainWindow.webContents.send('terminal-error', terminalId, err.message);
            }
          });

          // Enviar mensaje de bienvenida
          setTimeout(() => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
              this.mainWindow.webContents.send('terminal-data', terminalId, 
                '\r\n🎉 Conectado exitosamente a SSH\r\n' +
                '💡 Escribe comandos normalmente\r\n' +
                '📋 Usa Ctrl+C para interrumpir procesos\r\n\r\n'
              );
            }
          }, 500);

          resolve({ success: true, terminalId });
        });
      });
    });

    // Escribir en terminal
    ipcMain.handle('terminal-write', (event, terminalId, data) => {
      const terminal = this.sshStreams.get(terminalId);
      if (terminal && terminal.stream) {
        try {
          terminal.stream.write(data);
          return { success: true };
        } catch (error) {
          console.error('Write error:', error);
          return { success: false, error: error.message };
        }
      }
      return { success: false, error: 'Terminal not found' };
    });

    // Ejecutar comando específico
    ipcMain.handle('execute-command', async (event, connectionId, command) => {
      return new Promise((resolve) => {
        const conn = this.connections.get(connectionId);
        if (!conn) {
          resolve({ success: false, error: 'Connection not found' });
          return;
        }

        conn.exec(command, (err, stream) => {
          if (err) {
            resolve({ success: false, error: err.message });
            return;
          }

          let output = '';
          let errorOutput = '';

          stream.on('close', (code, signal) => {
            resolve({ 
              success: true, 
              output, 
              errorOutput, 
              exitCode: code,
              signal 
            });
          });

          stream.on('data', (data) => {
            output += data.toString();
          });

          stream.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
        });
      });
    });

    // Cerrar terminal
    ipcMain.handle('terminal-close', (event, terminalId) => {
      const terminal = this.sshStreams.get(terminalId);
      if (terminal && terminal.stream) {
        terminal.stream.end();
        this.sshStreams.delete(terminalId);
        return { success: true };
      }
      return { success: false, error: 'Terminal not found' };
    });

    // Cerrar conexión SSH
    ipcMain.handle('ssh-disconnect', (event, connectionId) => {
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.end();
        this.connections.delete(connectionId);
        
        // Cerrar todos los streams de esta conexión
        for (const [terminalId, terminal] of this.sshStreams.entries()) {
          if (terminal.connectionId === connectionId) {
            terminal.stream.end();
            this.sshStreams.delete(terminalId);
          }
        }
        
        return { success: true };
      }
      return { success: false, error: 'Connection not found' };
    });

    // Listar archivos (comando ls simplificado)
    ipcMain.handle('list-files', async (event, connectionId, path = '.') => {
      return this.executeCommand(connectionId, `ls -la "${path}"`);
    });

    // Obtener información del sistema
    ipcMain.handle('get-system-info', async (event, connectionId) => {
      const commands = [
        'whoami',
        'pwd', 
        'uname -a',
        'uptime'
      ];
      
      const results = {};
      for (const cmd of commands) {
        try {
          const result = await this.executeCommand(connectionId, cmd);
          if (result.success) {
            results[cmd] = result.output.trim();
          }
        } catch (error) {
          results[cmd] = 'Error: ' + error.message;
        }
      }
      
      return results;
    });
  }

  async executeCommand(connectionId, command) {
    return new Promise((resolve) => {
      const conn = this.connections.get(connectionId);
      if (!conn) {
        resolve({ success: false, error: 'Connection not found' });
        return;
      }

      conn.exec(command, (err, stream) => {
        if (err) {
          resolve({ success: false, error: err.message });
          return;
        }

        let output = '';
        let errorOutput = '';

        stream.on('close', (code) => {
          resolve({ 
            success: true, 
            output, 
            errorOutput, 
            exitCode: code 
          });
        });

        stream.on('data', (data) => {
          output += data.toString();
        });

        stream.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
      });
    });
  }

  init() {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIPC();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', () => {
      // Cerrar todas las conexiones antes de salir
      for (const [connectionId, conn] of this.connections.entries()) {
        try {
          conn.end();
        } catch (error) {
          console.error('Error closing connection:', error);
        }
      }
      
      // Cerrar todos los streams
      for (const [terminalId, terminal] of this.sshStreams.entries()) {
        try {
          terminal.stream.end();
        } catch (error) {
          console.error('Error closing stream:', error);
        }
      }
    });
  }
}

const sphereClient = new SphereSSHClient();
sphereClient.init();