// ================================================
// EMAIL SERVICE - MATHKIDS
// ================================================
// Serviço de envio de emails para recuperação de senha
// Suporta Mailtrap (desenvolvimento) e Ethereal (fallback automático)
// ================================================

// Importar dependências
require('dotenv').config(); // Carrega as variáveis do .env

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.fromEmail = process.env.EMAIL_FROM || 'mathkids@exemplo.com';
        this.fromName = process.env.EMAIL_FROM_NAME || 'MathKids - Educação Infantil';
        this.emailProvider = 'auto'; // 'nodemailer' ou 'test'
        this.init();
    }

    /**
     * Inicializa o serviço de email baseado nas variáveis de ambiente
     * Prioridade: Mailtrap (se configurado) > Ethereal (fallback automático)
     */
    async init() {
        try {
            // Tentar configurar Mailtrap primeiro
            if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
                await this.setupMailtrapService();
            }
            // Fallback para Ethereal (teste automático)
            else {
                console.log('⚠️ Credenciais Mailtrap não encontradas, usando Ethereal como fallback');
                await this.setupTestEmailService();
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Mailtrap:', error.message);
            console.log('🔄 Tentando fallback para Ethereal...');
            await this.setupTestEmailService();
        }
    }

    /**
     * Configura serviço Mailtrap para desenvolvimento
     */
    async setupMailtrapService() {
        console.log('📧 Configurando Mailtrap para envio de emails...');
        
        const config = {
            host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
            port: process.env.MAILTRAP_PORT || 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        };

        // Verificar se as credenciais estão configuradas
        if (!config.auth.user || !config.auth.pass) {
            throw new Error('Credenciais do Mailtrap não configuradas. Configure MAILTRAP_USER e MAILTRAP_PASS no arquivo .env');
        }

        this.transporter = nodemailer.createTransport(config);
        this.emailProvider = 'mailtrap';
        
        // Verificar conexão
        await this.transporter.verify();
        console.log('✅ Mailtrap configurado com sucesso!');
        console.log(`📧 Host: ${config.host}:${config.port}`);
        console.log(`👤 User: ${config.auth.user}`);
    }

    /**
     * Configura serviço de email de teste usando Ethereal
     */
    async setupTestEmailService() {
        console.log('📧 Configurando serviço de email de teste (Ethereal)...');
        
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        this.testAccount = testAccount;
        this.emailProvider = 'test';
        console.log('✅ Serviço de email de teste configurado!');
        console.log(`📧 Credenciais de teste: ${testAccount.user} / ${testAccount.pass}`);
    }

    /**
     * Envia email de recuperação de senha usando o provedor configurado
     * @param {string} to - Email do destinatário
     * @param {string} userName - Nome do usuário
     * @param {string} resetLink - Link de reset de senha
     * @returns {Promise<Object>} Resultado do envio
     */
    async sendPasswordResetEmail(to, userName, resetLink) {
        try {
            console.log(`📧 Enviando email via ${this.emailProvider} para: ${to}`);

            let result;

            switch (this.emailProvider) {
                case 'mailtrap':
                case 'test':
                    result = await this.sendViaNodemailer(to, userName, resetLink);
                    break;
                default:
                    throw new Error('Nenhum provedor de email configurado');
            }

            console.log('✅ Email de reset enviado com sucesso!');
            return result;

        } catch (error) {
            console.error('❌ Erro ao enviar email de reset:', error);
            throw error;
        }
    }

    /**
     * Envia email via Nodemailer (Mailtrap ou Ethereal)
     * @param {string} to - Email do destinatário
     * @param {string} userName - Nome do usuário
     * @param {string} resetLink - Link de reset
     * @returns {Promise<Object>} Resultado do Nodemailer
     */
    async sendViaNodemailer(to, userName, resetLink) {
        const htmlContent = this.generatePasswordResetHTML(userName, resetLink);
        const textContent = this.generatePasswordResetText(userName, resetLink);

        const mailOptions = {
            from: `"${this.fromName}" <${this.fromEmail}>`,
            to: to,
            subject: '🔐 Redefinir Senha - MathKids',
            text: textContent,
            html: htmlContent
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log(`📧 Message ID: ${info.messageId}`);

        // Para serviço de teste, mostrar URL de preview
        if (this.testAccount) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`🔍 Preview do email: ${previewUrl}`);
            return {
                success: true,
                messageId: info.messageId,
                previewUrl: previewUrl,
                provider: 'ethereal',
                testMode: true
            };
        }

        return {
            success: true,
            messageId: info.messageId,
            provider: this.emailProvider,
            testMode: this.emailProvider === 'mailtrap'
        };
    }

    /**
     * Gera conteúdo HTML do email de reset
     * @param {string} userName - Nome do usuário
     * @param {string} resetLink - Link de reset
     * @returns {string} HTML do email
     */
    generatePasswordResetHTML(userName, resetLink) {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinir Senha - MathKids</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #64C9A6, #4fa88a); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🐉 MathKids</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Educação Matemática Divertida</p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #64C9A6; margin-bottom: 20px; font-size: 24px;">🔐 Redefinir Senha</h2>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">
                        Olá, <strong>${userName}</strong>!
                    </p>
                    
                    <p style="margin-bottom: 25px; font-size: 16px;">
                        Recebemos uma solicitação para redefinir a senha da sua conta no MathKids. 
                        Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" 
                           style="display: inline-block; background: #64C9A6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; font-size: 16px; transition: all 0.3s ease;">
                            🔑 Redefinir Minha Senha
                        </a>
                    </div>

                    <div style="background: #f8f9fa; border-left: 4px solid #64C9A6; padding: 15px; border-radius: 5px; margin: 25px 0;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            <strong>⏰ Link temporário:</strong> Este link expira em 60 minutos (desenvolvimento) / 15 minutos (produção) por segurança.
                        </p>
                    </div>

                    <p style="margin-bottom: 15px; font-size: 14px; color: #666;">
                        Se o botão não funcionar, copie e cole este link no seu navegador:
                    </p>
                    
                    <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px; margin-bottom: 25px;">
                        ${resetLink}
                    </p>

                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                        <p style="margin-bottom: 10px; font-size: 14px; color: #999;">
                            <strong>❓ Não solicitou esta alteração?</strong>
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #999;">
                            Se você não pediu para redefinir sua senha, pode ignorar este email com segurança. 
                            Sua senha permanecerá inalterada.
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0; font-size: 12px; color: #999;">
                        © 2025 MathKids - Educação Matemática Divertida para Crianças<br>
                        Este é um email automático, não responda.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Gera conteúdo texto do email de reset
     * @param {string} userName - Nome do usuário
     * @param {string} resetLink - Link de reset
     * @returns {string} Texto do email
     */
    generatePasswordResetText(userName, resetLink) {
        return `
🐉 MATHKIDS - REDEFINIR SENHA

Olá, ${userName}!

Recebemos uma solicitação para redefinir a senha da sua conta no MathKids.

Para criar uma nova senha, acesse este link:
${resetLink}

⏰ IMPORTANTE: Este link expira em 60 minutos (desenvolvimento) / 15 minutos (produção) por segurança.

❓ Não solicitou esta alteração?
Se você não pediu para redefinir sua senha, pode ignorar este email com segurança.

---
© 2025 MathKids - Educação Matemática Divertida
Este é um email automático, não responda.
        `;
    }

    /**
     * Verifica se o serviço de email está funcionando
     * @returns {Promise<boolean>} Status do serviço
     */
    async isHealthy() {
        try {
            switch (this.emailProvider) {
                case 'mailtrap':
                case 'test':
                    if (!this.transporter) return false;
                    await this.transporter.verify();
                    return true;
                default:
                    return false;
            }
        } catch (error) {
            console.error('❌ Serviço de email não está saudável:', error);
            return false;
        }
    }

    /**
     * Retorna informações sobre o provedor ativo
     * @returns {Object} Informações do provedor
     */
    getProviderInfo() {
        return {
            provider: this.emailProvider,
            isMailtrap: this.emailProvider === 'mailtrap',
            isTest: this.emailProvider === 'test',
            fromEmail: this.fromEmail,
            fromName: this.fromName,
            hasTransporter: !!this.transporter
        };
    }
}

// Exportar instância singleton
const emailService = new EmailService();

// Exemplo de uso:
// emailService.sendPasswordResetEmail('usuario@exemplo.com', 'João', 'https://seusite.com/reset?token=XYZ123');

module.exports = emailService;