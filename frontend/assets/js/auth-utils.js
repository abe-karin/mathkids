// ================================================
// AUTH-UTILS.JS - UTILITÁRIOS DE AUTENTICAÇÃO MATHKIDS
// ================================================
// Este arquivo fornece utilitários globais para gerenciamento de
// autenticação em toda a aplicação MathKids, incluindo:
// 
// - Verificação de tokens de autenticação salvos
// - Logout seguro com limpeza de servidor e local
// - Detecção automática de ambiente (dev/prod)
// - Verificação de status de autenticação
// - Compatibilidade com sistema "lembrar de mim"
//
// Uso: window.authManager (instância global disponível)
//      window.globalLogout() (função global de logout)
// ================================================

/**
 * Classe para gerenciar autenticação e tokens de forma centralizada
 * Fornece métodos para verificar autenticação, logout e gerenciar tokens
 */
class AuthManager {
    constructor() {
        // Utiliza a mesma lógica de detecção de ambiente do login.js e app.js
        this.apiBaseUrl = this.getApiBaseUrl();
    }

    /**
     * Detecta automaticamente a URL base da API baseada no ambiente atual
     * Mantém consistência com outros módulos da aplicação
     * @returns {string} URL base da API (localhost para dev, Render para prod)
     */
    getApiBaseUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Ambiente de desenvolvimento local
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        
        // Ambiente de produção (Render ou serviços similares)
        if (hostname.includes('onrender.com') || hostname.includes('mathkids')) {
            return 'https://mathkids-back.onrender.com';
        }
        
        // Fallback: usar mesmo protocolo e hostname com porta 5000
        return `${protocol}//${hostname}:5000`;
    }

    /**
     * Verificar se há token de autenticação salvo (auto-login)
     */
    async checkSavedAuthentication() {
        try {
            console.log('🔍 Verificando token de autenticação salvo...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/verify-token`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Token válido encontrado');
                return data;
            } else {
                console.log('ℹ️ Nenhum token válido encontrado');
                return null;
            }
        } catch (error) {
            console.log('ℹ️ Verificação de token falhou:', error.message);
            return null;
        }
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
            
            console.log('✅ Token removido do servidor');
            
        } catch (error) {
            console.error('Erro no logout:', error);
        }
        
        // Limpar storage local
        localStorage.removeItem('mathkids_user');
        localStorage.removeItem('mathkids_admin');
        sessionStorage.removeItem('mathkids_user');
        sessionStorage.removeItem('mathkids_admin');
        
        console.log('👋 Logout completo realizado');
    }

    /**
     * Verificar se usuário está autenticado (localmente ou via token)
     */
    async isAuthenticated() {
        // Verificar storage local primeiro
        const localUser = localStorage.getItem('mathkids_user') || 
                         sessionStorage.getItem('mathkids_user') ||
                         localStorage.getItem('mathkids_admin') || 
                         sessionStorage.getItem('mathkids_admin');
        
        if (localUser) {
            return JSON.parse(localUser);
        }
        
        // Verificar token salvo no servidor
        const tokenData = await this.checkSavedAuthentication();
        return tokenData?.user || null;
    }
}

// Instância global
window.authManager = new AuthManager();

// Função global de logout para compatibilidade
window.globalLogout = async function() {
    if (confirm('Tem certeza que deseja sair?')) {
        await window.authManager.logout();
        alert('Logout realizado com sucesso!');
        window.location.href = 'cadastro/entrar.html';
    }
};

console.log('🔐 AuthManager carregado e disponível globalmente');