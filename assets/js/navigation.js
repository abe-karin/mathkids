// ================================================
// NAVEGAÇÃO PRINCIPAL - PROJETO EDUCATIVO
// ================================================

class Navigation {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.addVisualEffects();
            console.log('Sistema de navegação inicializado com efeitos visuais');
        });
    }

    setupEventListeners() {
        const registerBtn = document.getElementById('registerBtn');
        const loginBtn = document.getElementById('loginBtn');

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.handleNavigation('cadastrar'));
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleNavigation('entrar'));
        }
    }

    handleNavigation(action) {
        console.log(`Ação: ${action}`);
        
        // Adicionar efeito visual antes da navegação
        this.addNavigationEffect(action);
        
        switch(action) {
            case 'cadastrar':
                // Pequeno delay para mostrar o efeito visual
                setTimeout(() => {
                    window.location.href = 'cadastro/cadastrar.html';
                }, 300);
                break;
            case 'entrar':
                // Direcionar para a página de login
                setTimeout(() => {
                    window.location.href = 'cadastro/entrar.html';
                }, 300);
                break;
            default:
                console.warn('Ação de navegação não reconhecida:', action);
        }
    }

    addNavigationEffect(action) {
        // Criar efeito de ripple no botão clicado
        const btnId = action === 'cadastrar' ? 'registerBtn' : 'loginBtn';
        const button = document.getElementById(btnId);
        
        if (button) {
            button.classList.add('btn-clicked');
            
            // Criar efeito de ondas
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            button.appendChild(ripple);
            
            // Remover efeito após animação
            setTimeout(() => {
                button.classList.remove('btn-clicked');
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }
    }

    showStyledAlert(message) {
        // Criar alert customizado com gradiente
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-alert';
        alertDiv.innerHTML = `
            <div class="alert-content">
                <p>${message}</p>
                <button onclick="this.parentNode.parentNode.remove()" class="alert-btn">OK</button>
            </div>
        `;
        
        // Adicionar estilos inline para o alert
        alertDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        alertDiv.querySelector('.alert-content').style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            margin: 20px;
        `;
        
        alertDiv.querySelector('.alert-btn').style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 15px;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remover após 3 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }

    addVisualEffects() {
        // Adicionar efeitos CSS para animações dos botões
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .btn-clicked {
                transform: scale(0.95) !important;
                transition: transform 0.1s ease !important;
            }
            
            .ripple-effect {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: translate(-50%, -50%);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
            
            .alert-btn:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar sistema de navegação
new Navigation();