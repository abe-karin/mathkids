// app.js - MathKids Frontend Application

/**
 * Aplicativo principal do MathKids
 * Gerencia a integração com a API do backend e Swagger
 */

class MathKidsApp {
    constructor() {
        // Detecta automaticamente o ambiente (desenvolvimento vs produção)
        this.apiBaseUrl = this.getApiBaseUrl();
        this.swaggerUrl = `${this.apiBaseUrl}/api-docs`;
        console.log(`🔧 API Base URL configurada para: ${this.apiBaseUrl}`);
        this.init();
    }

    /**
     * Detecta automaticamente a URL base da API baseada no ambiente
     */
    getApiBaseUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Se estivermos em localhost, usar desenvolvimento local
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        
        // Se estivermos em produção (Render ou outro), usar URL de produção
        if (hostname.includes('onrender.com') || hostname.includes('mathkids')) {
            return 'https://mathkids-back.onrender.com';
        }
        
        // Fallback: tentar usar a mesma origem do frontend
        return `${protocol}//${hostname}:5000`;
    }

    init() {
        console.log('🐉 MathKids App iniciado!');
        this.setupEventListeners();
        this.checkAPIConnection();
    }

    /**
     * Configura os event listeners para botões e formulários
     */
    setupEventListeners() {
        // Botão para abrir documentação Swagger
        const swaggerBtn = document.getElementById('swagger-docs-btn');
        if (swaggerBtn) {
            swaggerBtn.addEventListener('click', () => this.openSwaggerDocs());
        }

        // Botão de teste de API
        const testApiBtn = document.getElementById('test-api-btn');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => this.testAPIConnection());
        }
    }

    /**
     * Abre a documentação Swagger em nova aba
     */
    openSwaggerDocs() {
        window.open(this.swaggerUrl, '_blank');
        console.log('📚 Abrindo documentação Swagger...');
    }

    /**
     * Verifica conexão com a API
     */
    async checkAPIConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api-docs.json`);
            if (response.ok) {
                console.log('✅ API conectada - Swagger disponível');
                this.updateConnectionStatus(true);
            } else {
                console.log('⚠️ API conectada mas Swagger indisponível');
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.log('❌ API desconectada:', error.message);
            this.updateConnectionStatus(false);
        }
    }

    /**
     * Testa a conexão com a API fazendo uma requisição
     */
    async testAPIConnection() {
        const testData = {
            nomeDoResponsavel: "Teste API",
            email: `teste.${Date.now()}@mathkids.com`,
            senha: "senha123",
            dataDeNascimento: "1990-01-01",
            termosAceitos: true
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Teste de API bem-sucedido:', result);
                this.showNotification('Teste de API realizado com sucesso!', 'success');
            } else {
                console.log('⚠️ Teste de API com erro esperado:', result);
                this.showNotification(`Resposta da API: ${result.message}`, 'info');
            }
        } catch (error) {
            console.error('❌ Erro no teste de API:', error);
            this.showNotification('Erro ao conectar com a API', 'error');
        }
    }

    /**
     * Atualiza o status visual da conexão
     */
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
            statusElement.className = connected ? 'api-status connected' : 'api-status disconnected';
            statusElement.textContent = connected ? '🟢 API Conectada' : '🔴 API Desconectada';
        }
    }

    /**
     * Mostra notificações para o usuário
     */
    showNotification(message, type = 'info') {
        // Cria elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Adiciona ao DOM
        document.body.appendChild(notification);

        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Obtém informações da API Swagger
     */
    async getAPIInfo() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api-docs.json`);
            if (response.ok) {
                const swaggerDoc = await response.json();
                return {
                    title: swaggerDoc.info.title,
                    version: swaggerDoc.info.version,
                    description: swaggerDoc.info.description,
                    endpoints: Object.keys(swaggerDoc.paths).length
                };
            }
        } catch (error) {
            console.error('Erro ao obter informações da API:', error);
        }
        return null;
    }
}

// CSS para notificações (pode ser movido para um arquivo CSS separado)
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.notification.success {
    background-color: #64C9A6;
}

.notification.error {
    background-color: #e74c3c;
}

.notification.info {
    background-color: #3498db;
}

.notification button {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
}

.api-status {
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: bold;
    display: inline-block;
    margin: 5px;
}

.api-status.connected {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.api-status.disconnected {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
</style>
`;

// Adiciona estilos ao documento
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.mathKidsApp = new MathKidsApp();
});

// Exporta para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathKidsApp;
}