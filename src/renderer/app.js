const { ipcRenderer } = require('electron');

class SphereSSHApp {
    constructor() {
        this.connections = [];
        this.folders = [];
        this.activeTerminals = new Map();
        this.currentTerminalId = null;
        this.editingConnection = null;
        
        this.init();
    }

    async init() {
        await this.loadConnections();
        this.setupEventListeners();
        this.renderConnectionsTree();
        this.updateFolderSelects();
    }

    setupEventListeners() {
        document.getElementById('newConnectionBtn').addEventListener('click', () => {
            this.showConnectionModal();
        });

        document.getElementById('newFolderBtn').addEventListener('click', () => {
            this.showFolderModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideConnectionModal();
        });

        document.getElementById('closeFolderModal').addEventListener('click', () => {
            this.hideFolderModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideConnectionModal();
        });

        document.getElementById('cancelFolderBtn').addEventListener('click', () => {
            this.hideFolderModal();
        });

        document.getElementById('connectionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConnection();
        });

        document.getElementById('folderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFolder();
        });

        window.addEventListener('click', (e) => {
            const connectionModal = document.getElementById('connectionModal');
            const folderModal = document.getElementById('folderModal');
            
            if (e.target === connectionModal) {
                this.hideConnectionModal();
            }
            if (e.target === folderModal) {
                this.hideFolderModal();
            }
        });

        ipcRenderer.on('terminal-data', (event, terminalId, data) => {
            this.appendTerminalData(terminalId, data);
        });

        ipcRenderer.on('terminal-closed', (event, terminalId) => {
            this.closeTerminal(terminalId);
        });

        ipcRenderer.on('terminal-error', (event, terminalId, error) => {
            this.appendTerminalData(terminalId, `\\r\\n❌ Error: ${error}\\r\\n`);
        });
    }

    parseAnsiCodes(text) {
        if (!text) return '';
        
        const ansiColors = {
            '30': '#2e3436', '31': '#cc0000', '32': '#4e9a06', '33': '#c4a000',
            '34': '#3465a4', '35': '#75507b', '36': '#06989a', '37': '#d3d7cf',
            '90': '#555753', '91': '#ef2929', '92': '#8ae234', '93': '#fce94f',
            '94': '#729fcf', '95': '#ad7fa8', '96': '#34e2e2', '97': '#eeeeec'
        };

        return text.replace(/\\x1b\\[([\\d;]*)m/g, (match, codes) => {
            if (!codes) return '';
            
            const parts = codes.split(';');
            let styles = [];
            
            for (const code of parts) {
                const num = parseInt(code);
                if (num >= 30 && num <= 37) {
                    styles.push(`color: ${ansiColors[num]}`);
                } else if (num === 1) {
                    styles.push('font-weight: bold');
                } else if (num === 0) {
                    return '</span><span>';
                }
            }
            
            return styles.length > 0 ? `<span style="${styles.join('; ')}">` : '';
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    cleanControlCodes(text) {
        if (!text) return '';
        return text.replace(/\\x1b\\[[0-9;]*[a-zA-Z]/g, (match) => {
            return match.endsWith('m') ? match : '';
        });
    }

    async loadConnections() {
        try {
            const data = await ipcRenderer.invoke('load-connections');
            this.connections = data.filter(item => item.type === 'connection');
            this.folders = data.filter(item => item.type === 'folder');
        } catch (error) {
            console.error('Error loading connections:', error);
            this.showNotification('Error al cargar las conexiones', 'error');
        }
    }

    async saveConnectionsToFile() {
        try {
            const allItems = [...this.folders, ...this.connections];
            await ipcRenderer.invoke('save-connections', allItems);
        } catch (error) {
            console.error('Error saving connections:', error);
            this.showNotification('Error al guardar las conexiones', 'error');
        }
    }

    showConnectionModal(connection = null) {
        this.editingConnection = connection;
        const modal = document.getElementById('connectionModal');
        const form = document.getElementById('connectionForm');
        const title = document.getElementById('modalTitle');

        if (connection) {
            title.textContent = 'Editar Conexión';
            document.getElementById('connectionName').value = connection.name;
            document.getElementById('hostInput').value = connection.host;
            document.getElementById('portInput').value = connection.port || 22;
            document.getElementById('usernameInput').value = connection.username;
            document.getElementById('passwordInput').value = connection.password || '';
            document.getElementById('folderSelect').value = connection.folderId || '';
        } else {
            title.textContent = 'Nueva Conexión SSH';
            form.reset();
            document.getElementById('portInput').value = 22;
        }

        modal.classList.add('show');
        document.getElementById('connectionName').focus();
    }

    hideConnectionModal() {
        document.getElementById('connectionModal').classList.remove('show');
        this.editingConnection = null;
    }

    showFolderModal() {
        const modal = document.getElementById('folderModal');
        const form = document.getElementById('folderForm');
        
        form.reset();
        modal.classList.add('show');
        document.getElementById('folderNameInput').focus();
    }

    hideFolderModal() {
        document.getElementById('folderModal').classList.remove('show');
    }

    async saveConnection() {
        const formData = {
            name: document.getElementById('connectionName').value.trim(),
            host: document.getElementById('hostInput').value.trim(),
            port: parseInt(document.getElementById('portInput').value) || 22,
            username: document.getElementById('usernameInput').value.trim(),
            password: document.getElementById('passwordInput').value,
            folderId: document.getElementById('folderSelect').value || null,
            type: 'connection',
            id: this.editingConnection?.id || this.generateId()
        };

        if (!formData.name || !formData.host || !formData.username) {
            this.showNotification('Por favor, completa todos los campos requeridos', 'warning');
            return;
        }

        try {
            if (this.editingConnection) {
                const index = this.connections.findIndex(c => c.id === this.editingConnection.id);
                if (index !== -1) {
                    this.connections[index] = formData;
                }
            } else {
                this.connections.push(formData);
            }

            await this.saveConnectionsToFile();
            this.renderConnectionsTree();
            this.hideConnectionModal();
            this.showNotification('Conexión guardada correctamente', 'success');
        } catch (error) {
            console.error('Error saving connection:', error);
            this.showNotification('Error al guardar la conexión', 'error');
        }
    }

    async saveFolder() {
        const folderData = {
            id: this.generateId(),
            name: document.getElementById('folderNameInput').value.trim(),
            parentId: document.getElementById('parentFolderSelect').value || null,
            type: 'folder'
        };

        if (!folderData.name) {
            this.showNotification('Por favor, ingresa un nombre para la carpeta', 'warning');
            return;
        }

        try {
            this.folders.push(folderData);
            await this.saveConnectionsToFile();
            this.renderConnectionsTree();
            this.updateFolderSelects();
            this.hideFolderModal();
            this.showNotification('Carpeta creada correctamente', 'success');
        } catch (error) {
            console.error('Error saving folder:', error);
            this.showNotification('Error al crear la carpeta', 'error');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    renderConnectionsTree() {
        const container = document.getElementById('connectionsTree');
        container.innerHTML = '';

        const tree = this.buildTree();
        this.renderTreeItems(container, tree);
    }

    buildTree() {
        const tree = [];
        const folderMap = new Map();

        this.folders.forEach(folder => {
            folderMap.set(folder.id, {
                ...folder,
                children: [],
                connections: []
            });
        });

        this.folders.forEach(folder => {
            const folderNode = folderMap.get(folder.id);
            if (folder.parentId && folderMap.has(folder.parentId)) {
                folderMap.get(folder.parentId).children.push(folderNode);
            } else {
                tree.push(folderNode);
            }
        });

        this.connections.forEach(connection => {
            if (connection.folderId && folderMap.has(connection.folderId)) {
                folderMap.get(connection.folderId).connections.push(connection);
            } else {
                tree.push(connection);
            }
        });

        return tree;
    }

    renderTreeItems(container, items, level = 0) {
        items.forEach(item => {
            const element = document.createElement('div');
            element.className = `tree-item ${item.type}`;
            element.style.marginLeft = `${level * 16}px`;

            if (item.type === 'folder') {
                element.innerHTML = `
                    <i class="fas fa-folder"></i>
                    <span>${item.name}</span>
                    <div class="actions">
                        <button class="btn-icon" onclick="app.deleteFolder('${item.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                container.appendChild(element);
                
                if (item.connections.length > 0) {
                    this.renderTreeItems(container, item.connections, level + 1);
                }
                
                if (item.children.length > 0) {
                    this.renderTreeItems(container, item.children, level + 1);
                }
            } else if (item.type === 'connection') {
                element.innerHTML = `
                    <i class="fas fa-server"></i>
                    <span>${item.name}</span>
                    <div class="connection-status" title="Desconectado"></div>
                    <div class="actions">
                        <button class="btn-icon" onclick="app.editConnection('${item.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="app.deleteConnection('${item.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                element.addEventListener('dblclick', () => {
                    this.connectToHost(item);
                });
                
                container.appendChild(element);
            }
        });
    }

    updateFolderSelects() {
        const selects = [
            document.getElementById('folderSelect'),
            document.getElementById('parentFolderSelect')
        ];

        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Raíz</option>';
            
            this.folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = folder.name;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        });
    }

    async connectToHost(connection) {
        try {
            this.updateConnectionStatus(connection.id, 'connecting');
            this.showNotification(`Conectando a ${connection.name}...`, 'info');

            const result = await ipcRenderer.invoke('ssh-connect', connection);
            
            if (result.success) {
                this.updateConnectionStatus(connection.id, 'connected');
                this.showNotification(`Conectado a ${connection.name}`, 'success');
                
                const terminalResult = await ipcRenderer.invoke('create-ssh-terminal', result.connectionId);
                
                if (terminalResult.success) {
                    this.createTerminalTab(connection, terminalResult.terminalId, result.connectionId);
                } else {
                    this.showNotification('Error al crear el terminal', 'error');
                }
            } else {
                this.updateConnectionStatus(connection.id, 'disconnected');
                this.showNotification(`Error al conectar: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.updateConnectionStatus(connection.id, 'disconnected');
            this.showNotification('Error de conexión', 'error');
        }
    }

    updateConnectionStatus(connectionId, status) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) return;

        const treeItems = document.querySelectorAll('.tree-item.connection');
        treeItems.forEach(item => {
            if (item.querySelector('span').textContent === connection.name) {
                const statusEl = item.querySelector('.connection-status');
                statusEl.className = `connection-status ${status}`;
                
                const titles = {
                    'connecting': 'Conectando...',
                    'connected': 'Conectado',
                    'disconnected': 'Desconectado'
                };
                statusEl.title = titles[status] || 'Desconectado';
            }
        });
    }

    createTerminalTab(connection, terminalId, connectionId) {
        const tabsContainer = document.getElementById('terminalTabs');
        const tab = document.createElement('div');
        tab.className = 'terminal-tab';
        tab.dataset.terminalId = terminalId;
        
        tab.innerHTML = `
            <i class="fas fa-terminal"></i>
            <span class="tab-title">${connection.name}</span>
            <button class="tab-close" onclick="app.closeTerminal('${terminalId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        tab.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.switchToTerminal(terminalId);
            }
        });
        
        tabsContainer.appendChild(tab);

        const terminalContent = document.getElementById('terminalContent');
        const terminalPanel = document.createElement('div');
        terminalPanel.className = 'terminal-panel';
        terminalPanel.dataset.terminalId = terminalId;
        
        terminalPanel.innerHTML = `
            <div class="terminal-output" id="output-${terminalId}"></div>
            <div class="terminal-input">
                <span class="terminal-prompt">$ </span>
                <input type="text" id="input-${terminalId}" placeholder="Escribe un comando...">
            </div>
        `;
        
        terminalContent.appendChild(terminalPanel);

        const input = document.getElementById(`input-${terminalId}`);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendTerminalCommand(terminalId, input.value);
                input.value = '';
            }
        });

        const terminalInfo = {
            connectionId,
            connection,
            element: terminalPanel,
            tab: tab,
            commandHistory: [],
            historyIndex: -1
        };

        this.activeTerminals.set(terminalId, terminalInfo);
        this.switchToTerminal(terminalId);
        
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
    }

    switchToTerminal(terminalId) {
        document.querySelectorAll('.terminal-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.terminal-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const tab = document.querySelector(`.terminal-tab[data-terminal-id="${terminalId}"]`);
        const panel = document.querySelector(`.terminal-panel[data-terminal-id="${terminalId}"]`);
        
        if (tab && panel) {
            tab.classList.add('active');
            panel.classList.add('active');
            this.currentTerminalId = terminalId;
            
            const input = document.getElementById(`input-${terminalId}`);
            if (input) {
                input.focus();
            }
        }
    }

    async sendTerminalCommand(terminalId, command) {
        if (!command.trim()) return;

        try {
            const output = document.getElementById(`output-${terminalId}`);
            const terminal = this.activeTerminals.get(terminalId);
            
            if (output && terminal) {
                const commandLine = document.createElement('div');
                commandLine.className = 'command-line';
                commandLine.innerHTML = `<span style="color: #00ffff;">$ ${this.escapeHtml(command)}</span>`;
                output.appendChild(commandLine);
                output.scrollTop = output.scrollHeight;
            }

            await ipcRenderer.invoke('terminal-write', terminalId, command + '\\n');
        } catch (error) {
            console.error('Error sending command:', error);
            this.showNotification('Error al enviar comando', 'error');
        }
    }

    appendTerminalData(terminalId, data) {
        const output = document.getElementById(`output-${terminalId}`);
        if (!output || !data) return;

        try {
            let cleanedData = this.cleanControlCodes(data);
            if (!cleanedData.trim()) return;

            const processedData = this.parseAnsiCodes(cleanedData);
            
            const outputLine = document.createElement('div');
            outputLine.className = 'output-line';
            outputLine.innerHTML = processedData;
            
            output.appendChild(outputLine);
            output.scrollTop = output.scrollHeight;

            const lines = output.children;
            if (lines.length > 1000) {
                for (let i = 0; i < 100; i++) {
                    if (lines[0]) output.removeChild(lines[0]);
                }
            }
        } catch (error) {
            console.error('Error processing terminal data:', error);
            const outputLine = document.createElement('div');
            outputLine.className = 'output-line';
            outputLine.textContent = data;
            output.appendChild(outputLine);
            output.scrollTop = output.scrollHeight;
        }
    }

    async closeTerminal(terminalId) {
        try {
            await ipcRenderer.invoke('terminal-close', terminalId);
            
            const tab = document.querySelector(`.terminal-tab[data-terminal-id="${terminalId}"]`);
            const panel = document.querySelector(`.terminal-panel[data-terminal-id="${terminalId}"]`);
            
            if (tab) tab.remove();
            if (panel) panel.remove();
            
            const terminal = this.activeTerminals.get(terminalId);
            if (terminal) {
                this.updateConnectionStatus(terminal.connection.id, 'disconnected');
                this.activeTerminals.delete(terminalId);
            }
            
            if (this.currentTerminalId === terminalId) {
                const remainingTabs = document.querySelectorAll('.terminal-tab');
                if (remainingTabs.length > 0) {
                    const nextTerminalId = remainingTabs[0].dataset.terminalId;
                    this.switchToTerminal(nextTerminalId);
                } else {
                    this.currentTerminalId = null;
                    const welcomeScreen = document.querySelector('.welcome-screen');
                    if (welcomeScreen) {
                        welcomeScreen.style.display = 'flex';
                    }
                }
            }
        } catch (error) {
            console.error('Error closing terminal:', error);
            this.showNotification('Error al cerrar terminal', 'error');
        }
    }

    editConnection(connectionId) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (connection) {
            this.showConnectionModal(connection);
        }
    }

    async deleteConnection(connectionId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta conexión?')) {
            try {
                this.connections = this.connections.filter(c => c.id !== connectionId);
                await this.saveConnectionsToFile();
                this.renderConnectionsTree();
                this.showNotification('Conexión eliminada', 'success');
            } catch (error) {
                console.error('Error deleting connection:', error);
                this.showNotification('Error al eliminar conexión', 'error');
            }
        }
    }

    async deleteFolder(folderId) {
        const hasConnections = this.connections.some(c => c.folderId === folderId);
        const hasSubfolders = this.folders.some(f => f.parentId === folderId);
        
        if (hasConnections || hasSubfolders) {
            this.showNotification('No se puede eliminar una carpeta que contiene elementos', 'warning');
            return;
        }

        if (confirm('¿Estás seguro de que quieres eliminar esta carpeta?')) {
            try {
                this.folders = this.folders.filter(f => f.id !== folderId);
                await this.saveConnectionsToFile();
                this.renderConnectionsTree();
                this.updateFolderSelects();
                this.showNotification('Carpeta eliminada', 'success');
            } catch (error) {
                console.error('Error deleting folder:', error);
                this.showNotification('Error al eliminar carpeta', 'error');
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="btn-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1001;
                display: flex;
                flex-direction: column;
                gap: 8px;
            `;
            document.body.appendChild(container);
        }
        
        const container = document.querySelector('.notification-container');
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

const app = new SphereSSHApp();
window.app = app;