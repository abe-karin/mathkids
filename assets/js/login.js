// ================================================
// SISTEMA DE LOGIN - PROJETO MATHKIDS
// ================================================

class LoginSystem {
    constructor() {
        // Detecta automaticamente o ambiente (similar ao app.js)
        this.apiBaseUrl = this.getApiBaseUrl();
        this.apiUrl = `${this.apiBaseUrl}/api/login`;
        console.log(`🔐 Login API configurada para: ${this.apiUrl}`);
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
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.setupFormValidation();
            console.log('Sistema de login inicializado');
        });
    }

    setupEventListeners() {
        const form = document.getElementById('loginForm');
        const togglePassword = document.getElementById('togglePassword');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const googleLoginBtn = document.getElementById('googleLoginBtn');

        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', (e) => this.handleGoogleLogin(e));
        }
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
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
        } else {
            sessionStorage.setItem('mathkids_admin', JSON.stringify(adminData));
        }

        this.showMessage('Login realizado com sucesso! Redirecionando...', 'success');
        
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
            loginTime: new Date().toISOString()
        };

        if (rememberMe) {
            localStorage.setItem('mathkids_user', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('mathkids_user', JSON.stringify(userData));
        }

        this.showMessage('Login realizado com sucesso! Redirecionando...', 'success');
        
        // Redirecionar baseado no tipo de usuário
        setTimeout(() => {
            if (userData.tipo === 'admin') {
                window.location.href = '../admin-dashboard.html';
            } else {
                window.location.href = '../dashboard.html';
            }
        }, 1500);
    }

    handleLoginError(data) {
        const message = data.message || 'Erro no login. Verifique suas credenciais.';
        this.showMessage(message, 'error');
    }

    handleForgotPassword(event) {
        event.preventDefault();
        alert('Funcionalidade de recuperação de senha em desenvolvimento.');
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