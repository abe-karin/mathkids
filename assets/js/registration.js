// ================================================
// FORMULÁRIO DE REGISTRO - PROJETO EDUCATIVO
// ================================================

class RegistrationForm {
    constructor() {
        this.apiUrl = 'https://mathkids-back.onrender.com/api/register';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.setupFormValidation();
            console.log('Formulário de registro inicializado');
        });
    }

    setupEventListeners() {
        const form = document.getElementById('registrationForm');
        const cancelarBtn = document.getElementById('cancelarBtn');
        const entrarLink = document.getElementById('entrarLink');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (cancelarBtn) {
            cancelarBtn.addEventListener('click', () => this.handleCancel());
        }

        if (entrarLink) {
            entrarLink.addEventListener('click', (e) => this.handleLoginLink(e));
        }
    }

    setupFormValidation() {
        // Validação em tempo real
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

        switch(field.type) {
            case 'email':
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    isValid = false;
                    errorMessage = 'Email inválido';
                }
                break;
            case 'password':
                if (value.length < 6) {
                    isValid = false;
                    errorMessage = 'Senha deve ter no mínimo 6 caracteres';
                }
                break;
            case 'text':
                if (field.id === 'nome' && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Nome muito curto';
                }
                break;
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        field.style.borderColor = isValid ? '#ddd' : '#e74c3c';
        
        // Remove mensagem de erro anterior
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Adiciona nova mensagem de erro se necessário
        if (!isValid && errorMessage) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.style.marginTop = '5px';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        }
    }

    clearFieldError(field) {
        field.style.borderColor = '#ddd';
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        this.setLoadingState(true);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Conta criada com sucesso! Redirecionando...');
                setTimeout(() => {
                    window.location.href = 'entrar.html';
                }, 2000);
            } else {
                this.showError(data.message || 'Erro ao criar conta');
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            this.showError('Erro de conexão. Verifique se o servidor está rodando.');
        } finally {
            this.setLoadingState(false);
        }
    }

    getFormData() {
        return {
            nomeDoResponsavel: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('senha').value.trim(),
            dataDeNascimento: document.getElementById('dataNascimento').value.trim(),
            termosAceitos: document.getElementById('termos').checked
        };
    }

    validateForm(formData) {
        const { nomeDoResponsavel, email, senha, dataDeNascimento, termosAceitos } = formData;

        if (!nomeDoResponsavel || !email || !senha || !dataDeNascimento || !termosAceitos) {
            this.showError('Todos os campos são obrigatórios e os termos devem ser aceitos.');
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            this.showError('Email inválido.');
            return false;
        }

        if (senha.length < 6) {
            this.showError('A senha deve ter no mínimo 6 caracteres.');
            return false;
        }

        return true;
    }

    setLoadingState(isLoading) {
        const submitBtn = document.querySelector('button[type="submit"]');
        const cancelBtn = document.getElementById('cancelarBtn');

        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = isLoading ? 'Cadastrando...' : 'Cadastrar';
        }

        if (cancelBtn) {
            cancelBtn.disabled = isLoading;
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove mensagem anterior
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Cria nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.marginBottom = '20px';
        messageDiv.style.textAlign = 'center';
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        }

        messageDiv.textContent = message;

        const form = document.getElementById('registrationForm');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        }
    }

    handleCancel() {
        if (confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
            window.location.href = '../index.html';
        }
    }

    handleLoginLink(event) {
        event.preventDefault();
        window.location.href = 'entrar.html';
    }
}

// Inicializar formulário de registro
new RegistrationForm();