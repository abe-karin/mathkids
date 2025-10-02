// ================================================
// SISTEMA DE LOGIN - PROJETO MATHKIDS
// ================================================
// Este arquivo implementa o sistema completo de autenticação
// incluindo login dual (admin + usuários do banco), "lembrar de mim"
// com tokens seguros, e auto-login inteligente.
// 
// Funcionalidades principais:
// - Login de admin hardcoded (adm@email.com / 123456)
// - Login de usuários registrados no banco PostgreSQL
// - Sistema "lembrar de mim" com cookies seguros
// - Auto-login baseado em tokens de autenticação
// - Validação de formulários em tempo real
// - Detecção automática de ambiente (dev/prod)
// ================================================

class LoginSystem {
    constructor() {
        // Detecta automaticamente o ambiente (similar ao app.js)
        // Isso permite que o sistema funcione tanto em desenvolvimento
        // (localhost:5000) quanto em produção (Render)
        this.apiBaseUrl = this.getApiBaseUrl();
        this.apiUrl = `${this.apiBaseUrl}/api/login`;
        console.log(`🔐 Login API configurada para: ${this.apiUrl}`);
        this.init();
    }

    /**
     * Detecta automaticamente a URL base da API baseada no ambiente
     * @returns {string} URL base da API (localhost ou produção)
     */
    getApiBaseUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Ambiente de desenvolvimento local
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        
        // Ambiente de produção (Render ou similar)
        if (hostname.includes('onrender.com') || hostname.includes('mathkids')) {
            return 'https://mathkids-back.onrender.com';
        }
        
        // Fallback: usar mesma origem com porta 5000
        return `${protocol}//${hostname}:5000`;
    }

    /**
     * Inicializa o sistema de login
     * Configura event listeners, validação de formulários e verifica
     * se há tokens de autenticação salvos para auto-login
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.setupFormValidation();
            this.checkSavedAuthentication(); // Verificar se há token salvo
            console.log('Sistema de login inicializado');
        });
    }

    /**
     * Verifica se há token de autenticação salvo para auto-login
     * Esta função é chamada automaticamente ao carregar a página
     * e permite que usuários com "lembrar de mim" ativado sejam
     * automaticamente redirecionados para seus dashboards
     * @returns {Promise<boolean>} true se auto-login foi realizado
     */
    async checkSavedAuthentication() {
        try {
            console.log('🔍 Verificando token de autenticação salvo...');
            
            // Fazer requisição para verificar token no servidor
            const response = await fetch(`${this.apiBaseUrl}/api/verify-token`, {
                method: 'GET',
                credentials: 'include', // Importante: incluir cookies
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Token válido encontrado - fazendo auto-login');
                
                // Mostrar mensagem amigável de boas-vindas
                this.showMessage(`Bem-vindo de volta, ${data.user.nome}!`, 'success');
                
                // Redirecionar após um breve delay para melhor UX
                setTimeout(() => {
                    if (data.user.tipo === 'admin') {
                        window.location.href = '../admin-dashboard.html';
                    } else {
                        window.location.href = '../dashboard.html';
                    }
                }, 1500);
                
                return true;
            } else {
                console.log('ℹ️ Nenhum token válido encontrado - login manual necessário');
                return false;
            }
        } catch (error) {
            console.log('ℹ️ Verificação de token falhou - continuando com login manual');
            return false;
        }
    }

    /**
     * Configura todos os event listeners da página de login
     * Inclui submissão de formulário, toggle de senha, esqueci senha, etc.
     */
    setupEventListeners() {
        const form = document.getElementById('loginForm');
        const togglePassword = document.getElementById('togglePassword');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const googleLoginBtn = document.getElementById('googleLoginBtn');

        // Event listener principal - submissão do formulário
        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Toggle para mostrar/esconder senha
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Link "Esqueci minha senha" (funcionalidade futura)
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Botão de login com Google (funcionalidade futura)
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', (e) => this.handleGoogleLogin(e));
        }
    }

    /**
     * Configura validação em tempo real dos campos do formulário
     * Melhora a UX fornecendo feedback imediato ao usuário
     */
    setupFormValidation() {
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => {
            // Validar quando o campo perde o foco
            input.addEventListener('blur', () => this.validateField(input));
            // Limpar erros enquanto o usuário digita
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Limpar erros anteriores
        this.clearFieldError(field);

        switch (field.type) {
            case 'email':
                if (!value) {
                    errorMessage = 'Email é obrigatório';
                    isValid = false;
                } else if (!this.isValidEmail(value)) {
                    errorMessage = 'Formato de email inválido';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'Senha é obrigatória';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Senha deve ter pelo menos 3 caracteres';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remover mensagem de erro anterior
        this.clearFieldError(field);
        
        // Criar nova mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Inserir após o campo (ou após o container se for password)
        if (field.type === 'password') {
            field.parentNode.parentNode.insertBefore(errorDiv, field.parentNode.nextSibling);
        } else {
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    togglePasswordVisibility() {
        const passwordField = document.getElementById('password');
        const toggleIcon = document.getElementById('togglePassword');

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }

    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validar campos
        const emailField = document.getElementById('email');
        const passwordField = document.getElementById('password');
        
        const isEmailValid = this.validateField(emailField);
        const isPasswordValid = this.validateField(passwordField);

        if (!isEmailValid || !isPasswordValid) {
            this.showMessage('Por favor, corrija os erros antes de continuar', 'error');
            return;
        }

        // Mostrar loading
        this.showLoadingState(true);

        try {
            console.log(`🔄 Tentando login via API: ${this.apiUrl}`);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include', // Incluir cookies
                mode: 'cors',
                body: JSON.stringify({
                    email: email,
                    senha: password,
                    rememberMe: rememberMe
                })
            });

            console.log(`📡 Resposta da API: ${response.status}`);

            if (response.ok) {
                // Login via API bem-sucedido
                const data = await response.json();
                this.handleLoginSuccess(data, rememberMe);
                return;
            } else if (response.status === 401) {
                // Credenciais inválidas na API, verificar se é admin como fallback
                if (email === 'adm@email.com' && password === '123456') {
                    console.log('🔑 Fallback para login de admin');
                    this.handleAdminLogin(rememberMe);
                    return;
                } else {
                    try {
                        const errorData = await response.json();
                        this.handleLoginError(errorData);
                    } catch (parseError) {
                        this.showMessage('Credenciais inválidas', 'error');
                    }
                    return;
                }
            } else if (response.status === 503) {
                // Banco indisponível - permitir apenas admin
                if (email === 'adm@email.com' && password === '123456') {
                    console.log('🔑 Login de admin com banco indisponível');
                    this.handleAdminLogin(rememberMe);
                    return;
                } else {
                    try {
                        const errorData = await response.json();
                        this.showMessage(errorData.message || 'Banco de dados temporariamente indisponível', 'error');
                    } catch (parseError) {
                        this.showMessage('Banco de dados temporariamente indisponível. Apenas admin pode acessar.', 'error');
                    }
                    return;
                }
            } else {
                try {
                    const errorData = await response.json();
                    this.handleLoginError(errorData);
                } catch (parseError) {
                    this.showMessage('Erro do servidor', 'error');
                }
                return;
            }

        } catch (error) {
            console.error('❌ Erro no fetch:', error);
            
            // Verificar tipo específico de erro
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log('🌐 Erro de conexão - possível problema de CORS ou servidor offline');
            }
            
            // Fallback para admin se há erro de conexão
            if (email === 'adm@email.com' && password === '123456') {
                console.log('🔑 Fallback para admin devido a erro de conexão');
                this.handleAdminLogin(rememberMe);
            } else {
                this.showMessage('Erro de conexão. Servidor pode estar offline. Apenas admin pode acessar no modo offline.', 'error');
            }
        } finally {
            this.showLoadingState(false);
        }
    }

    handleAdminLogin(rememberMe) {
        console.log('Login de administrador realizado');
        
        // Salvar dados do admin
        const adminData = {
            email: 'adm@email.com',
            nome: 'Administrador',
            tipo: 'admin',
            loginTime: new Date().toISOString()
        };

        if (rememberMe) {
            localStorage.setItem('mathkids_admin', JSON.stringify(adminData));
            
            // Definir cookie simples para "lembrar de mim" do admin
            document.cookie = `mathkids_admin_remember=true; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax`;
            console.log('🍪 Cookie "lembrar de mim" definido para admin');
        } else {
            sessionStorage.setItem('mathkids_admin', JSON.stringify(adminData));
        }

        let message = 'Login realizado com sucesso!';
        if (rememberMe) {
            message += ' Você será lembrado neste dispositivo.';
        }

        this.showMessage(message + ' Redirecionando...', 'success');
        
        // Redirecionar para página de admin após 1.5 segundos
        setTimeout(() => {
            window.location.href = '../admin-dashboard.html';
        }, 1500);
    }

    handleLoginSuccess(data, rememberMe) {
        console.log('Login realizado com sucesso:', data);
        
        // Salvar dados do usuário
        const userData = {
            id: data.user.id,
            email: data.user.email,
            nome: data.user.nome,
            tipo: data.user.tipo || 'usuario',
            token: data.token,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            authTokenSet: data.authTokenSet
        };

        if (rememberMe) {
            localStorage.setItem('mathkids_user', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('mathkids_user', JSON.stringify(userData));
        }

        let message = 'Login realizado com sucesso!';
        if (data.authTokenSet) {
            message += ' Você será lembrado neste dispositivo.';
        }
        
        this.showMessage(message + ' Redirecionando...', 'success');
        
        // Redirecionar baseado no tipo de usuário
        setTimeout(() => {
            if (userData.tipo === 'admin') {
                window.location.href = '../admin-dashboard.html';
            } else {
                window.location.href = '../dashboard.html';
            }
        }, 1500);
    }

    /**
     * Função de logout que limpa token do servidor
     */
    async logout() {
        try {
            await fetch(`${this.apiBaseUrl}/api/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            // Limpar storage local
            localStorage.removeItem('mathkids_user');
            localStorage.removeItem('mathkids_admin');
            sessionStorage.removeItem('mathkids_user');
            sessionStorage.removeItem('mathkids_admin');
            
            console.log('👋 Logout completo realizado');
            
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }

    handleLoginError(data) {
        const message = data.message || 'Erro no login. Verifique suas credenciais.';
        this.showMessage(message, 'error');
    }

    /**
     * Gerencia funcionalidade "Esqueci minha senha"
     * Abre modal para inserir email e solicita reset via API
     * @param {Event} event - Evento do clique
     */
    handleForgotPassword(event) {
        event.preventDefault();
        this.showForgotPasswordModal();
    }

    /**
     * Exibe modal de recuperação de senha
     */
    showForgotPasswordModal() {
        // Criar modal dinamicamente
        const modal = document.createElement('div');
        modal.className = 'forgot-password-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Recuperar Senha</h3>
                    <button class="close-modal" aria-label="Fechar">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Digite seu email para receber instruções de recuperação:</p>
                    <form id="forgotPasswordForm">
                        <input type="email" id="forgotEmail" placeholder="Seu email" required>
                        <div class="modal-buttons">
                            <button type="button" class="btn secondary-btn" id="cancelForgot">Cancelar</button>
                            <button type="submit" class="btn primary-btn" id="sendReset">Enviar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Adicionar ao DOM
        document.body.appendChild(modal);

        // Event listeners do modal
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('#cancelForgot');
        const form = modal.querySelector('#forgotPasswordForm');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        form.addEventListener('submit', (e) => this.handleForgotPasswordSubmit(e, modal));

        // Focar no campo de email
        setTimeout(() => {
            modal.querySelector('#forgotEmail').focus();
        }, 100);
    }

    /**
     * Processa envio do formulário de recuperação de senha
     * @param {Event} event - Evento de submit
     * @param {Element} modal - Elemento do modal
     */
    async handleForgotPasswordSubmit(event, modal) {
        event.preventDefault();
        
        const email = modal.querySelector('#forgotEmail').value.trim();
        const submitBtn = modal.querySelector('#sendReset');
        
        if (!email) {
            this.showModalMessage(modal, 'Por favor, digite seu email', 'error');
            return;
        }

        // Validar formato do email
        if (!this.isValidEmail(email)) {
            this.showModalMessage(modal, 'Formato de email inválido', 'error');
            return;
        }

        // Mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            console.log(`🔑 Solicitando reset de senha para: ${email}`);
            
            const response = await fetch(`${this.apiBaseUrl}/api/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Solicitação de reset enviada');
                
                // Mostrar mensagem de sucesso
                this.showModalMessage(modal, data.message, 'success');
                
                // Se estiver em desenvolvimento e houver link, mostrar
                if (data.devResetLink) {
                    const devMessage = `\n\n📧 Link de desenvolvimento:\n${data.devResetLink}`;
                    console.log(devMessage);
                    
                    // Adicionar botão para copiar link (desenvolvimento)
                    const devDiv = document.createElement('div');
                    devDiv.className = 'dev-reset-link';
                    devDiv.innerHTML = `
                        <hr>
                        <p><strong>🔧 Modo Desenvolvimento:</strong></p>
                        <p>Link de reset gerado:</p>
                        <input type="text" value="${data.devResetLink}" readonly class="dev-link-input">
                        <button type="button" class="btn secondary-btn" onclick="navigator.clipboard.writeText('${data.devResetLink}'); this.textContent='Copiado!'">
                            <i class="fas fa-copy"></i> Copiar Link
                        </button>
                    `;
                    modal.querySelector('.modal-body').appendChild(devDiv);
                }
                
                // Fechar modal após 5 segundos ou no clique
                setTimeout(() => {
                    if (document.body.contains(modal)) {
                        modal.remove();
                    }
                }, 5000);
                
            } else {
                this.showModalMessage(modal, data.message || 'Erro ao enviar solicitação', 'error');
            }

        } catch (error) {
            console.error('❌ Erro na solicitação de reset:', error);
            this.showModalMessage(modal, 'Erro de conexão. Tente novamente.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Enviar';
        }
    }

    /**
     * Exibe mensagem dentro do modal
     * @param {Element} modal - Elemento do modal
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo da mensagem (success, error, info)
     */
    showModalMessage(modal, message, type = 'info') {
        // Remover mensagem anterior
        const existingMessage = modal.querySelector('.modal-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `modal-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;

        // Inserir no modal
        const modalBody = modal.querySelector('.modal-body');
        modalBody.insertBefore(messageDiv, modalBody.firstChild);
    }

    handleGoogleLogin(event) {
        event.preventDefault();
        alert('Login com Google em desenvolvimento.');
    }

    showLoadingState(isLoading) {
        const submitBtn = document.querySelector('button[type="submit"]');
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Entrar';
        }
    }

    showMessage(message, type = 'info') {
        // Remover mensagem anterior
        const existingMessage = document.querySelector('.login-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `login-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;

        // Inserir antes do formulário
        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(messageDiv, form);

        // Remover após 5 segundos (exceto para success)
        if (type !== 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}

// Inicializar sistema de login
new LoginSystem();