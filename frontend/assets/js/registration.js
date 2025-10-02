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
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                // Impede que o campo contenha apenas espaços
                if (input.type === 'text' || input.type === 'email') {
                    const trimmedValue = input.value.trim();
                    if (input.value !== trimmedValue) {
                        input.value = trimmedValue;
                    }
                }
            });
        });

        // Validação do checkbox de termos
        const termosCheckbox = document.getElementById('termos');
        if (termosCheckbox) {
            termosCheckbox.addEventListener('change', () => {
                this.clearFieldError(termosCheckbox);
                // Valida imediatamente se os termos foram aceitos
                if (!termosCheckbox.checked) {
                    this.showFieldValidation(termosCheckbox, false, 'Você deve aceitar os termos para continuar');
                } else {
                    this.showFieldValidation(termosCheckbox, true, '');
                }
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validação básica: campo não pode estar vazio
        if (!value || value.length === 0) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
            this.showFieldValidation(field, isValid, errorMessage);
            return isValid;
        }

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
                if (field.id === 'nome') {
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                    } else if (!/^[a-zA-ZÀ-ſ\s]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Nome deve conter apenas letras e espaços';
                    }
                }
                break;
            case 'date':
                if (field.id === 'dataNascimento') {
                    const birthDate = new Date(value);
                    const currentYear = new Date().getFullYear();
                    const birthYear = birthDate.getFullYear();
                    
                    if (isNaN(birthDate.getTime())) {
                        isValid = false;
                        errorMessage = 'Data inválida';
                    } else if (birthYear > currentYear) {
                        isValid = false;
                        errorMessage = `Ano de nascimento não pode ser maior que ${currentYear}`;
                    } else if (birthYear < 1900) {
                        isValid = false;
                        errorMessage = 'Ano de nascimento muito antigo';
                    } else if (birthDate > new Date()) {
                        isValid = false;
                        errorMessage = 'Data de nascimento não pode ser no futuro';
                    }
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

        // Primeira verificação: campos básicos não podem estar vazios
        const nomeInput = document.getElementById('nome');
        const emailInput = document.getElementById('email');
        const senhaInput = document.getElementById('senha');
        const dataInput = document.getElementById('dataNascimento');
        const termosInput = document.getElementById('termos');

        // Remove espaços em branco dos campos de texto
        if (nomeInput) nomeInput.value = nomeInput.value.trim();
        if (emailInput) emailInput.value = emailInput.value.trim();
        if (senhaInput) senhaInput.value = senhaInput.value.trim();
        if (dataInput) dataInput.value = dataInput.value.trim();

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

        // Verificação rigorosa de campos vazios ou apenas com espaços
        if (!nomeDoResponsavel || nomeDoResponsavel.trim().length === 0) {
            this.showError('Nome do responsável é obrigatório.');
            document.getElementById('nome').focus();
            return false;
        }

        if (!email || email.trim().length === 0) {
            this.showError('Email é obrigatório.');
            document.getElementById('email').focus();
            return false;
        }

        if (!senha || senha.trim().length === 0) {
            this.showError('Senha é obrigatória.');
            document.getElementById('senha').focus();
            return false;
        }

        if (!dataDeNascimento || dataDeNascimento.trim().length === 0) {
            this.showError('Data de nascimento é obrigatória.');
            document.getElementById('dataNascimento').focus();
            return false;
        }

        if (!termosAceitos) {
            this.showError('Você deve aceitar os termos de uso para continuar.');
            document.getElementById('termos').focus();
            return false;
        }

        // Validação do nome
        if (nomeDoResponsavel.trim().length < 2) {
            this.showError('Nome deve ter pelo menos 2 caracteres.');
            document.getElementById('nome').focus();
            return false;
        }

        if (!/^[a-zA-ZÀ-ſ\s]+$/.test(nomeDoResponsavel.trim())) {
            this.showError('Nome deve conter apenas letras e espaços.');
            document.getElementById('nome').focus();
            return false;
        }

        // Validação do email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            this.showError('Email inválido.');
            document.getElementById('email').focus();
            return false;
        }

        // Validação da senha
        if (senha.trim().length < 6) {
            this.showError('A senha deve ter no mínimo 6 caracteres.');
            document.getElementById('senha').focus();
            return false;
        }

        // Validação da data de nascimento
        const birthDate = new Date(dataDeNascimento.trim());
        if (isNaN(birthDate.getTime())) {
            this.showError('Data de nascimento inválida.');
            document.getElementById('dataNascimento').focus();
            return false;
        }

        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        
        if (birthYear > currentYear) {
            this.showError(`Ano de nascimento não pode ser maior que ${currentYear}.`);
            document.getElementById('dataNascimento').focus();
            return false;
        }
        
        if (birthYear < 1900) {
            this.showError('Ano de nascimento muito antigo.');
            document.getElementById('dataNascimento').focus();
            return false;
        }
        
        if (birthDate > new Date()) {
            this.showError('Data de nascimento não pode ser no futuro.');
            document.getElementById('dataNascimento').focus();
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