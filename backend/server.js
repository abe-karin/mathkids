// server.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config(); 

// ================================================
// SERVER.JS - MATHKIDS API BACKEND
// ================================================
// Servidor principal da API MathKids que fornece:
// 
// 🔐 AUTENTICAÇÃO E SEGURANÇA:
// - Sistema de registro de usuários com bcrypt
// - Login dual (usuários do banco + fallback para casos especiais)
// - Tokens de autenticação persistentes ("lembrar de mim")
// - Gerenciamento seguro de cookies
// 
// 📊 DOCUMENTAÇÃO:
// - Swagger/OpenAPI 3.0.3 com interface customizada
// - Detecção automática de ambiente (dev/prod)
// - Endpoints documentados com exemplos
// 
// 💾 BANCO DE DADOS:
// - PostgreSQL via Neon.tech em produção
// - Tabelas: usuarios, auth_tokens
// - Limpeza automática de tokens expirados
// 
// 🌐 DEPLOY:
// - Render.com para produção
// - CORS configurado para múltiplos ambientes
// - Saúde da API com endpoints de diagnóstico
// ================================================

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Para permitir requisições do seu frontend
const path = require('path');
const fs = require('fs');
const emailService = require('./email-service'); // Serviço de email

const app = express();
// Render usa porta dinâmica, local usa 5000
const port = process.env.PORT || 5000;

// Log importante para debug no Render
console.log(`🔧 Starting server on port: ${port}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 DATABASE_URL configured: ${process.env.DATABASE_URL || process.env.NEON_DATABASE_URL ? 'YES' : 'NO'}`);

// Inicializar serviço de email
(async () => {
    try {
        await emailService.init();
        console.log('✅ Email service initialized successfully');
    } catch (error) {
        console.error('⚠️ Email service initialization failed:', error.message);
    }
})();

// ================================================
// CONFIGURAÇÃO DO SWAGGER/OPENAPI
// ================================================
// Carrega documentação da API e configura interface visual
// Swagger UI personalizada com cores e favicon do MathKids

// Verifica se as dependências do Swagger estão disponíveis
// Importante para evitar crashes se pacotes não estiverem instalados
let swaggerUi, swaggerDocument;

// Função utilitária para verificar ambiente
const isProduction = () => process.env.NODE_ENV === 'production';
const getBaseUrl = () => {
    if (isProduction()) {
        return process.env.RENDER_EXTERNAL_URL || 'https://mathkids-back.onrender.com';
    }
    return `http://localhost:${port}`;
};

try {
    swaggerUi = require('swagger-ui-express');
    // Carrega a documentação Swagger
    const swaggerPath = path.join(__dirname, 'swagger.json');
    if (fs.existsSync(swaggerPath)) {
        swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
        console.log('✅ Swagger documentação carregada com sucesso!');
    }
} catch (error) {
    console.log('⚠️  Swagger não disponível. Execute: npm install swagger-ui-express');
}

// ================================================
// MIDDLEWARES DE CONFIGURAÇÃO
// ================================================
// Configurações essenciais para funcionamento da API

// Permite que o Express leia JSON do corpo das requisições
app.use(express.json());

// Middleware para parsing de cookies (necessário para "lembrar de mim")
app.use(require('cookie-parser')());

// Serve arquivos estáticos do frontend (HTML, CSS, JS)
app.use(express.static('../')); // Pasta raiz do projeto

// ================================================
// CONFIGURAÇÃO DE CORS (Cross-Origin Resource Sharing)
// ================================================
// Define quais origens podem acessar a API para segurança
// Inclui URLs de desenvolvimento local e produção

// Lista de origens permitidas para requisições CORS
const allowedOrigins = [
    // Desenvolvimento local
    'http://localhost:5000',    // Servidor backend
    'http://127.0.0.1:5000',   // Alternativa localhost
    'http://localhost:8080',    // Servidor frontend comum
    'http://localhost:3000',    // Porta principal do frontend
    'http://127.0.0.1:3000',   // Frontend via 127.0.0.1
    'http://localhost:3001',    // Porta alternativa do frontend
    
    // Produção - usando variáveis de ambiente
    process.env.RENDER_EXTERNAL_URL,     // Backend principal via env
    process.env.FRONTEND_URL,            // Frontend principal via env
    'https://mathkids-3sz0.onrender.com/',     // Frontend 

].filter(Boolean); // Remove valores undefined/null

console.log(`🔧 CORS Origins configured: ${allowedOrigins.length} origins`);
console.log(`🔧 CORS Origins: ${allowedOrigins.join(', ')}`);

// Configuração CORS simplificada - permitindo todas as origens temporariamente
app.use(cors({
    origin: true, // Permite todas as origens
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
})); 

// Middleware adicional para garantir headers CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Responde diretamente a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        console.log('✅ Respondendo a preflight OPTIONS para:', req.headers.origin);
        return res.status(200).end();
    }
    
    next();
});

// --- Configuração do Banco de Dados PostgreSQL ---
// Suporta tanto variáveis locais (.env) quanto variáveis do Render
const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ ERRO: Variável DATABASE_URL ou NEON_DATABASE_URL não configurada!');
    console.log('Para o Render, configure a variável DATABASE_URL nas Environment Variables');
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false 
    } : false
});

// Testa a conexão com o banco de dados
console.log('🔧 Testing database connection...');
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('🔧 Full error:', err.stack);
        return;
    }
    console.log('✅ Database connection successful (PostgreSQL)');
    release();
});

// --- Configuração da Documentação Swagger ---
if (swaggerUi && swaggerDocument) {
    // Configurar URLs dinamicamente baseado no ambiente
    const swaggerBaseUrl = getBaseUrl();
    
    // Atualizar servers no documento Swagger dinamicamente
    const dynamicSwaggerDoc = {
        ...swaggerDocument,
        servers: [
            {
                url: swaggerBaseUrl,
                description: isProduction() ? 'Servidor de Produção (Render)' : 'Servidor de Desenvolvimento'
            }
        ]
    };
    
    // Rota para a documentação Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(dynamicSwaggerDoc, {
        customCss: '.swagger-ui .topbar { background-color: #64C9A6; } .swagger-ui .info .title { color: #2E8B57; }',
        customSiteTitle: "MathKids API Documentation",
        customfavIcon: "/assets/images/dragao.png",
        swaggerOptions: {
            persistAuthorization: false,
            tryItOutEnabled: true,
            defaultModelsExpandDepth: -1,
            docExpansion: 'list'
        }
    }));
    
    // Rota para baixar o JSON da documentação com URLs dinâmicas
    app.get('/api-docs.json', (req, res) => {
        const jsonBaseUrl = getBaseUrl();
        
        const dynamicSwaggerDoc = {
            ...swaggerDocument,
            servers: [
                {
                    url: jsonBaseUrl,
                    description: isProduction() ? 'Servidor de Produção (Render)' : 'Servidor de Desenvolvimento'
                }
            ]
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.send(dynamicSwaggerDoc);
    });
    
    const logBaseUrl = getBaseUrl();
    console.log(`📚 Documentação Swagger disponível em: ${logBaseUrl}/api-docs`);
    console.log(`📄 Swagger JSON disponível em: ${logBaseUrl}/api-docs.json`);
} else {
    console.log('⚠️  Para habilitar a documentação Swagger, execute:');
    console.log('   npm install swagger-ui-express');
}

// --- Health Check e Status da API ---
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'MathKids API'
    });
});

// Health check para verificar conexão com banco de dados
app.get('/health/database', async (req, res) => {
    try {
        const start = Date.now();
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        const queryTime = Date.now() - start;
        
        res.status(200).json({
            status: 'OK',
            database: 'connected',
            timestamp: new Date().toISOString(),
            query_time: `${queryTime}ms`
        });
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(500).json({
            status: 'ERROR',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint específico para debug no Render
app.get('/debug', (req, res) => {
    res.status(200).json({
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 'not set',
        database_configured: !!process.env.DATABASE_URL,
        render_service: process.env.RENDER_SERVICE_NAME || 'not set',
        render_external_url: process.env.RENDER_EXTERNAL_URL || 'not set',
        frontend_url: process.env.FRONTEND_URL || 'not set',
        base_url: getBaseUrl(),
        cors_origins: allowedOrigins.length,
        headers: req.headers,
        url: req.url,
        method: req.method
    });
});

app.get('/api/status', (req, res) => {
    res.status(200).json({
        api: 'MathKids API',
        status: 'online',
        endpoints: {
            register: '/api/register',
            login: '/api/login',
            forgot_password: '/api/forgot-password',
            reset_password: '/api/reset-password',
            docs: '/api-docs',
            health: '/health'
        },
        database: databaseUrl ? 'connected' : 'not configured',
        email_service: emailService.getProviderInfo(),
        timestamp: new Date().toISOString()
    });
});

// Health check específico para email service
app.get('/health/email', async (req, res) => {
    try {
        const isHealthy = await emailService.isHealthy();
        const providerInfo = emailService.getProviderInfo();
        
        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'OK' : 'UNHEALTHY',
            email_service: 'enabled',
            provider: providerInfo.provider,
            details: providerInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            email_service: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// --- Configuração da Tabela de Tokens de Autenticação ---
async function createAuthTokensTable() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS auth_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_agent TEXT,
                ip_address INET
            )
        `;
        
        await pool.query(createTableQuery);
        console.log('✅ Tabela auth_tokens verificada/criada com sucesso');
        
        // Criar índices para performance
        await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens(token_hash)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires ON auth_tokens(expires_at)');
        
        console.log('✅ Índices da tabela auth_tokens criados');
    } catch (error) {
        console.error('❌ Erro ao criar tabela auth_tokens:', error.message);
    }
}

// Função para limpar tokens expirados
async function cleanExpiredTokens() {
    try {
        const result = await pool.query('DELETE FROM auth_tokens WHERE expires_at < NOW()');
        if (result.rowCount > 0) {
            console.log(`🧹 ${result.rowCount} tokens expirados removidos`);
        }
    } catch (error) {
        console.error('❌ Erro ao limpar tokens expirados:', error.message);
    }
}

// Executar criação da tabela e limpeza inicial
if (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) {
    createAuthTokensTable();
    cleanExpiredTokens();
    
    // Agendar limpeza de tokens expirados a cada hora
    setInterval(cleanExpiredTokens, 60 * 60 * 1000);
} else {
    console.log('⚠️ DATABASE_URL não configurado - funcionalidade "lembrar de mim" limitada');
}

// --- Funções de Autenticação com Tokens ---

// Gerar token de autenticação único
function generateAuthToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

// Salvar token de autenticação no banco
async function saveAuthToken(userId, token, userAgent, ipAddress) {
    try {
        const tokenHash = await bcrypt.hash(token, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Token válido por 30 dias
        
        const query = `
            INSERT INTO auth_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        
        const result = await pool.query(query, [userId, tokenHash, expiresAt, userAgent, ipAddress]);
        console.log(`🔐 Token de autenticação salvo para usuário ${userId}`);
        return result.rows[0].id;
    } catch (error) {
        console.error('❌ Erro ao salvar token:', error.message);
        return null;
    }
}

// Verificar token de autenticação
async function verifyAuthToken(token) {
    try {
        const query = `
            SELECT at.*, u.id as user_id, u.nome_responsavel, u.email
            FROM auth_tokens at
            JOIN usuarios u ON at.user_id = u.id
            WHERE at.expires_at > NOW()
            ORDER BY at.created_at DESC
        `;
        
        const result = await pool.query(query);
        
        for (const row of result.rows) {
            const isValidToken = await bcrypt.compare(token, row.token_hash);
            if (isValidToken) {
                // Atualizar último uso
                await pool.query('UPDATE auth_tokens SET last_used = NOW() WHERE id = $1', [row.id]);
                
                return {
                    user: {
                        id: row.user_id,
                        email: row.email,
                        nome: row.nome_responsavel,
                        tipo: 'usuario'
                    },
                    tokenId: row.id
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('❌ Erro ao verificar token:', error.message);
        return null;
    }
}

// Revogar token de autenticação
async function revokeAuthToken(tokenId) {
    try {
        await pool.query('DELETE FROM auth_tokens WHERE id = $1', [tokenId]);
        console.log(`🗑️ Token ${tokenId} revogado`);
    } catch (error) {
        console.error('❌ Erro ao revogar token:', error.message);
    }
}

// --- Rotas de Páginas HTML ---

// Rota principal - redireciona para Swagger em produção ou frontend configurado
app.get('/', (req, res) => {    
    if (isProduction()) {
        // Em produção, redirecionar para Swagger por padrão
        // ou para frontend se FRONTEND_URL estiver configurado
        const frontendUrl = process.env.FRONTEND_URL;
        if (frontendUrl && frontendUrl !== getBaseUrl()) {
            res.redirect(frontendUrl);
        } else {
            res.redirect('/api-docs');
        }
    } else {
        // Em desenvolvimento, servir página principal
        res.sendFile('index.html', { root: '../' });
    }
});

// Rota específica para documentação (funciona em qualquer ambiente)
app.get('/docs', (req, res) => {
    res.redirect('/api-docs');
});

app.get('/cadastro', (req, res) => {
    res.sendFile('cadastro/cadastrar.html', { root: '../' });
});

// --- Rota de Verificação de Token Salvo ---
app.get('/api/verify-token', async (req, res) => {
    try {
        // Se não há DATABASE_URL, verificar cookie simples
        if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
            const adminCookie = req.cookies.mathkids_admin_remember;
            
            if (adminCookie === 'true') {
                console.log('🔑 Cookie de admin encontrado - auto-login');
                return res.json({
                    message: 'Token válido',
                    user: {
                        email: 'adm@email.com',
                        nome: 'Administrador',
                        tipo: 'admin'
                    },
                    autoLogin: true
                });
            }
            
            return res.status(401).json({ 
                message: 'Token de autenticação não encontrado' 
            });
        }

        const authToken = req.cookies.mathkids_auth_token;
        
        if (!authToken) {
            return res.status(401).json({ 
                message: 'Token de autenticação não encontrado' 
            });
        }

        console.log('🔍 Verificando token salvo...');
        
        const tokenData = await verifyAuthToken(authToken);
        
        if (!tokenData) {
            // Token inválido ou expirado - limpar cookie
            res.clearCookie('mathkids_auth_token');
            return res.status(401).json({ 
                message: 'Token inválido ou expirado' 
            });
        }

        console.log(`✅ Token válido para usuário: ${tokenData.user.email}`);
        
        res.json({
            message: 'Token válido',
            user: tokenData.user,
            autoLogin: true
        });

    } catch (error) {
        console.error('❌ Erro na verificação de token:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor' 
        });
    }
});

// --- Rota de Logout ---
app.post('/api/logout', async (req, res) => {
    try {
        // Se não há DATABASE_URL, limpar cookie simples
        if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
            res.clearCookie('mathkids_admin_remember');
            console.log('👋 Logout realizado (cookie simples limpo)');
            
            return res.json({
                message: 'Logout realizado com sucesso'
            });
        }

        const authToken = req.cookies.mathkids_auth_token;
        
        if (authToken) {
            // Revogar token do banco
            const tokenData = await verifyAuthToken(authToken);
            if (tokenData) {
                await revokeAuthToken(tokenData.tokenId);
            }
        }
        
        // Limpar cookie
        res.clearCookie('mathkids_auth_token');
        
        console.log('👋 Logout realizado com sucesso');
        
        res.json({
            message: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro no logout:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor' 
        });
    }
});

// --- Rota de Recuperação de Senha ---
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validação básica
        if (!email) {
            return res.status(400).json({ 
                message: 'Email é obrigatório' 
            });
        }

        // Validação do formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Formato de email inválido' 
            });
        }

        console.log(`🔑 Solicitação de reset de senha para: ${email}`);

        // Verificar se o DATABASE_URL está configurado
        if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
            console.log('⚠️ Banco de dados não configurado - simulando envio');
            
            // Para admin, simular envio bem-sucedido
            if (email === 'adm@email.com') {
                return res.json({ 
                    message: 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.',
                    resetAvailable: true,
                    adminReset: true
                });
            }
            
            return res.json({ 
                message: 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.',
                resetAvailable: false
            });
        }

        // Verificar se o usuário existe no banco (usando busca case-insensitive)
        const query = 'SELECT id, email, nome_responsavel FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))';
        const result = await pool.query(query, [email]);

        // Sempre retornar a mesma mensagem por segurança (não revelar se email existe)
        const responseMessage = 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.';

        if (result.rows.length === 0) {
            console.log(`❌ Tentativa de reset para email não cadastrado: ${email}`);
            console.log(`❌ Email pesquisado (normalizado): "${email.toLowerCase().trim()}"`);
            return res.json({ 
                message: responseMessage,
                resetAvailable: false
            });
        }

        const user = result.rows[0];
        console.log(`👤 Usuário encontrado para reset: ${user.email}`);

        // Gerar token de reset único
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        console.log(`🔐 Token gerado: ${resetToken}`);
        console.log(`🔐 Token length: ${resetToken.length}`);
        console.log(`🔐 Token é hex válido: ${/^[a-f0-9]+$/.test(resetToken)}`);
        
        const resetTokenHash = await bcrypt.hash(resetToken, 10);
        console.log(`🔐 Hash gerado: ${resetTokenHash.substring(0, 30)}...`);
        
        // Teste imediato de hash
        const immediateTest = await bcrypt.compare(resetToken, resetTokenHash);
        console.log(`🔐 Hash test imediato: ${immediateTest}`);
        
        // Tempo de expiração: 1 hora em desenvolvimento, 15 minutos em produção
        const expirationMinutes = process.env.NODE_ENV === 'production' ? 15 : 60;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000);
        
        console.log(`⏰ Horário atual (UTC): ${now.toISOString()}`);
        console.log(`⏰ Horário atual (local): ${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
        console.log(`⏰ Token expirará em ${expirationMinutes} minutos`);
        console.log(`⏰ Expiração (UTC): ${expiresAt.toISOString()}`);
        console.log(`⏰ Expiração (local): ${expiresAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);

        // Salvar token de reset no banco (criará tabela se não existir)
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS password_resets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                    token_hash VARCHAR(255) NOT NULL,
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    used BOOLEAN DEFAULT FALSE
                )
            `);

            // Usar TIMESTAMP WITH TIME ZONE para garantir consistência
            await pool.query(
                'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
                [user.id, resetTokenHash, expiresAt]
            );

            console.log(`🔐 Token de reset gerado para usuário ${user.id}`);
            
            // Gerar link de reset
            let baseUrl;
            if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                // Em desenvolvimento, sempre use localhost:3000
                baseUrl = 'http://localhost:3000';
            } else {
                // Em produção, use variável de ambiente ou host da requisição
                baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
            }
            
            const resetLink = `${baseUrl}/cadastro/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`;
            
            console.log(`📧 Link de reset gerado: ${resetLink}`);

            // Tentar enviar email real
            try {
                const emailResult = await emailService.sendPasswordResetEmail(
                    email, 
                    user.nome_responsavel || 'Usuário', 
                    resetLink
                );

                console.log('✅ Email de reset enviado com sucesso!');
                
                let responseData = {
                    message: responseMessage,
                    resetAvailable: true,
                    emailSent: true
                };

                // Em desenvolvimento, incluir informações extras
                if (process.env.NODE_ENV !== 'production') {
                    responseData.devInfo = {
                        resetToken: resetToken, // Token para teste direto no Swagger
                        resetLink: resetLink,
                        testMode: emailResult.testMode,
                        messageId: emailResult.messageId,
                        provider: emailResult.provider
                    };

                    // Se foi usado fallback, informar
                    if (emailResult.fallbackUsed) {
                        responseData.devInfo.fallbackUsed = true;
                        responseData.devInfo.originalError = emailResult.originalError;
                        console.log('⚠️ Usado fallback para envio de email');
                    }

                    // Se for teste com Ethereal, incluir URL de preview
                    if (emailResult.previewUrl) {
                        responseData.devInfo.previewUrl = emailResult.previewUrl;
                        console.log(`🔍 Preview do email: ${emailResult.previewUrl}`);
                    }
                }

                res.json(responseData);

            } catch (emailError) {
                console.error('❌ Erro ao enviar email:', emailError);
                
                // Email falhou, mas ainda retornar sucesso por segurança
                // Em produção, não revelar que o email falhou
                let responseData = { 
                    message: responseMessage,
                    resetAvailable: true,
                    emailSent: false
                };

                // Em desenvolvimento, incluir informações detalhadas
                if (process.env.NODE_ENV !== 'production') {
                    responseData.devInfo = {
                        resetToken: resetToken, // Token para teste direto no Swagger
                        resetLink: resetLink,
                        devNote: 'Email falhou - use o link abaixo para teste',
                        emailError: emailError.message
                    };
                }

                res.json(responseData);
            }

        } catch (dbError) {
            console.error('❌ Erro ao salvar token de reset:', dbError);
            throw dbError;
        }

    } catch (error) {
        console.error('❌ Erro na recuperação de senha:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor' 
        });
    }
});

// --- Rota de Reset de Senha ---
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        // Validações básicas
        if (!token || !email || !newPassword) {
            return res.status(400).json({ 
                message: 'Token, email e nova senha são obrigatórios' 
            });
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Formato de email inválido' 
            });
        }

        // Validação de força da senha
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Nova senha deve ter pelo menos 6 caracteres' 
            });
        }

        // Validação adicional de segurança da senha
        if (newPassword.length > 128) {
            return res.status(400).json({ 
                message: 'Nova senha muito longa (máximo 128 caracteres)' 
            });
        }

        console.log(`🔄 Tentativa de reset de senha para: ${email}`);
        console.log(`🔐 Token recebido (primeiros 20 chars): ${token.substring(0, 20)}...`);
        console.log(`🔐 Token recebido (length): ${token.length}`);
        console.log(`📧 Email recebido (normalizado): ${email.toLowerCase().trim()}`);

        // Verificar se é admin (casos especiais)
        if (email === 'adm@email.com') {
            console.log('⚠️ Tentativa de reset para conta admin - bloqueado por segurança');
            return res.status(403).json({ 
                message: 'Não é possível redefinir senha da conta administrativa' 
            });
        }

        // Verificar se o DATABASE_URL está configurado
        if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
            return res.status(503).json({ 
                message: 'Serviço de redefinição temporariamente indisponível' 
            });
        }

        // Primeiro, verificar se existe algum token para este email - com timezone UTC
        console.log(`🔍 Buscando tokens para email: "${email}"`);
        const debugQuery = `
            SELECT pr.id, pr.token_hash, pr.expires_at, pr.used, pr.created_at,
                   u.email, u.id as user_id, u.nome_responsavel,
                   NOW() AT TIME ZONE 'UTC' as current_time,
                   (pr.expires_at > NOW() AT TIME ZONE 'UTC') as is_valid_time
            FROM password_resets pr
            JOIN usuarios u ON pr.user_id = u.id
            WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
            ORDER BY pr.created_at DESC
            LIMIT 10
        `;
        
        const debugResult = await pool.query(debugQuery, [email]);
        console.log(`🔍 Tokens encontrados para ${email}:`, debugResult.rows.length);
        
        // Log de todos os emails no banco para debug
        const allEmailsQuery = 'SELECT email, id, nome_responsavel FROM usuarios ORDER BY id';
        const allEmails = await pool.query(allEmailsQuery);
        console.log('📧 Todos os emails no banco:');
        allEmails.rows.forEach((row, idx) => {
            console.log(`   ${idx + 1}. ID: ${row.id}, Email: "${row.email}", Nome: ${row.nome_responsavel}`);
        });
        
        const currentTime = new Date();
        console.log(`⏰ Horário atual do servidor: ${currentTime.toISOString()}`);
        console.log(`⏰ Horário atual (local): ${currentTime.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
        console.log(`⏰ Timezone do servidor: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
        console.log(`⏰ Offset UTC: ${currentTime.getTimezoneOffset()} minutos`);
        
        debugResult.rows.forEach((row, index) => {
            const expiresAt = new Date(row.expires_at);
            const createdAt = new Date(row.created_at);
            const currentDbTime = new Date(row.current_time);
            const isExpired = currentTime > expiresAt;
            const isExpiredVsDb = currentDbTime > expiresAt;
            
            console.log(`   ${index + 1}. ID: ${row.id}`);
            console.log(`      Usado: ${row.used}`);
            console.log(`      Criado: ${createdAt.toISOString()} (${createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`);
            console.log(`      Expira: ${expiresAt.toISOString()} (${expiresAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`);
            console.log(`      Válido no DB: ${row.is_valid_time}`);
            console.log(`      Expirado (calc local): ${isExpired}`);
            console.log(`      Expirado (calc vs DB): ${isExpiredVsDb}`);
            console.log(`      DB Current Time: ${currentDbTime.toISOString()}`);
        });

        // Buscar usuário e token válido (buscando por hash match) - com timezone UTC
        const query = `
            SELECT u.id, u.email, u.nome_responsavel, pr.token_hash, pr.id as reset_id, pr.expires_at, pr.created_at,
                   NOW() AT TIME ZONE 'UTC' as current_db_time,
                   (pr.expires_at > NOW() AT TIME ZONE 'UTC') as is_time_valid
            FROM usuarios u
            JOIN password_resets pr ON u.id = pr.user_id
            WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1)) 
            AND pr.expires_at > NOW() AT TIME ZONE 'UTC'
            AND pr.used = FALSE
            ORDER BY pr.created_at DESC
        `;
        
        const result = await pool.query(query, [email]);
        console.log(`🔍 Tokens válidos encontrados para "${email}": ${result.rows.length}`);

        // Procurar o token correto entre todos os válidos
        let resetData = null;
        let isValidToken = false;
        
        console.log(`🔐 Iniciando verificação de ${result.rows.length} tokens válidos...`);
        
        for (const row of result.rows) {
            console.log(`🔐 Testando token ID ${row.reset_id} para usuário "${row.email}" (ID: ${row.id})...`);
            console.log(`   - Token hash (primeiros 30 chars): ${row.token_hash.substring(0, 30)}...`);
            console.log(`   - Criado em: ${row.created_at}`);
            console.log(`   - Expira em: ${row.expires_at}`);
            
            const testValid = await bcrypt.compare(token, row.token_hash);
            console.log(`🔐 Match para token ID ${row.reset_id}: ${testValid}`);
            
            if (testValid) {
                resetData = row;
                isValidToken = true;
                console.log(`✅ Token correto encontrado - ID: ${row.reset_id} para usuário "${row.email}"`);
                break;
            }
        }

        if (!resetData || !isValidToken) {
            console.log('❌ Nenhum token válido encontrado que corresponda ao hash');
            
            // Debug: verificar se o token existe mas está expirado
            const expiredQuery = `
                SELECT pr.id, pr.expires_at, pr.used, pr.created_at, pr.token_hash, u.email
                FROM password_resets pr
                JOIN usuarios u ON pr.user_id = u.id
                WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1)) AND pr.used = FALSE
                ORDER BY pr.created_at DESC
                LIMIT 5
            `;
            
            const expiredResult = await pool.query(expiredQuery, [email]);
            console.log('  Verificando tokens recentes (incluindo expirados):');
            
            for (const row of expiredResult.rows) {
                const testValid = await bcrypt.compare(token, row.token_hash);
                console.log(`   - Token ID ${row.id}: hash match = ${testValid}, email = "${row.email}"`);
                if (testValid) {
                    const isExpired = new Date() > new Date(row.expires_at);
                    console.log(`🔍 Token encontrado mas ${isExpired ? 'EXPIRADO' : 'VÁLIDO'} - ID: ${row.id} para email: "${row.email}"`);
                    if (!isExpired) {
                        console.log('❗ ATENÇÃO: Token válido encontrado mas não foi capturado na query principal!');
                    }
                    break;
                }
            }
            
            return res.status(400).json({ 
                message: 'Token inválido ou expirado' 
            });
        }

        // Criptografar nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar senha no banco
        await pool.query(
            'UPDATE usuarios SET senha_hash = $1 WHERE id = $2',
            [hashedPassword, resetData.id]
        );

        // Marcar token como usado
        await pool.query(
            'UPDATE password_resets SET used = TRUE WHERE id = $1',
            [resetData.reset_id]
        );

        // Revogar todos os tokens de autenticação do usuário (logout em todos dispositivos)
        await pool.query(
            'DELETE FROM auth_tokens WHERE user_id = $1',
            [resetData.id]
        );

        console.log(`✅ Senha redefinida com sucesso para usuário ${resetData.id}`);

        res.json({ 
            message: 'Senha redefinida com sucesso! Faça login com a nova senha.' 
        });

    } catch (error) {
        console.error('❌ Erro no reset de senha:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor' 
        });
    }
});

// --- Debug: Verificar tokens ativos (apenas desenvolvimento) ---
app.get('/api/debug/reset-tokens/:email', async (req, res) => {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Endpoint não disponível' });
    }

    try {
        const { email } = req.params;
        
        const query = `
            SELECT pr.id, pr.token_hash, pr.expires_at, pr.used, pr.created_at,
                   u.email, u.id as user_id
            FROM password_resets pr
            JOIN usuarios u ON pr.user_id = u.id
            WHERE u.email = $1
            ORDER BY pr.created_at DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query, [email]);
        
        const tokens = result.rows.map(row => ({
            id: row.id,
            expires_at: row.expires_at,
            used: row.used,
            created_at: row.created_at,
            is_expired: new Date() > new Date(row.expires_at),
            token_hash_preview: row.token_hash.substring(0, 20) + '...'
        }));

        res.json({
            email: email,
            total_tokens: tokens.length,
            tokens: tokens,
            current_time: new Date()
        });

    } catch (error) {
        console.error('❌ Erro no debug de tokens:', error);
        res.status(500).json({ message: 'Erro interno' });
    }
});

// --- Debug: Listar emails de usuários (apenas desenvolvimento) ---
app.get('/api/debug/users', async (req, res) => {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Endpoint não disponível' });
    }

    try {
        const query = 'SELECT id, email, nome_responsavel FROM usuarios ORDER BY id DESC LIMIT 10';
        const result = await pool.query(query);
        
        const users = result.rows.map(row => ({
            id: row.id,
            email: row.email,
            nome: row.nome_responsavel
        }));

        res.json({
            total_users: users.length,
            users: users
        });

    } catch (error) {
        console.error('❌ Erro no debug de usuários:', error);
        res.status(500).json({ message: 'Erro interno' });
    }
});

// --- Rota de Login (atualizada) ---
app.post('/api/login', async (req, res) => {
    try {
        console.log('🔑 Tentativa de login recebida:', { email: req.body.email });
        
        // 1. Coleta e Validação dos Dados
        const { email, senha, rememberMe } = req.body;

        // Validação básica
        if (!email || !senha) {
            console.log('❌ Dados faltando:', { email: !!email, senha: !!senha });
            return res.status(400).json({ 
                message: 'Erro: Email e senha são obrigatórios.' 
            });
        }

        // Validação do formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Email inválido:', email);
            return res.status(400).json({ 
                message: 'Erro: Formato de email inválido.' 
            });
        }

        // Verificar se o DATABASE_URL está configurado
        if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
            console.log('⚠️ Banco de dados não configurado - apenas login de admin disponível');
            return res.status(401).json({ 
                message: 'Banco de dados não configurado. Use as credenciais de administrador.' 
            });
        }

        // 2. Verificar se o usuário existe no banco de dados
        console.log('🔍 Buscando usuário no banco:', email);
        const query = 'SELECT id, nome_responsavel, email, senha_hash FROM usuarios WHERE email = $1';
        const result = await pool.query(query, [email]);

        console.log(`📊 Resultados encontrados: ${result.rows.length}`);

        if (result.rows.length === 0) {
            console.log('❌ Usuário não encontrado:', email);
            return res.status(401).json({ 
                message: 'Erro: Email ou senha incorretos.' 
            });
        }

        const user = result.rows[0];
        console.log('👤 Usuário encontrado:', { id: user.id, email: user.email });

        // 3. Verificar a senha
        console.log('🔐 Verificando senha...');
        const isPasswordValid = await bcrypt.compare(senha, user.senha_hash);

        if (!isPasswordValid) {
            console.log('❌ Senha inválida para:', email);
            return res.status(401).json({ 
                message: 'Erro: Email ou senha incorretos.' 
            });
        }

        // 4. Login bem-sucedido
        const userData = {
            id: user.id,
            email: user.email,
            nome: user.nome_responsavel,
            tipo: 'usuario'
        };

        // Simular token (em uma implementação real, usaria JWT)
        const sessionToken = `token_${user.id}_${Date.now()}`;

        // Se "lembrar de mim" estiver marcado, criar token persistente
        if (rememberMe) {
            const authToken = generateAuthToken();
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
            
            const tokenId = await saveAuthToken(user.id, authToken, userAgent, ipAddress);
            
            if (tokenId) {
                // Definir cookie seguro que dura 30 dias
                res.cookie('mathkids_auth_token', authToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias em milissegundos
                });
                
                console.log(`🍪 Cookie de autenticação definido para: ${email}`);
            }
        }

        console.log(`✅ Login realizado com sucesso para: ${email}`);

        res.status(200).json({ 
            message: 'Login realizado com sucesso!',
            user: userData,
            token: sessionToken,
            rememberMe: rememberMe,
            authTokenSet: rememberMe
        });

    } catch (error) {
        console.error('❌ Erro detalhado no login:', error);
        console.error('📋 Stack trace:', error.stack);
        
        // Se o erro é de conexão com banco, informar que apenas admin está disponível
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
            console.log('💾 Banco indisponível - apenas admin funcional');
            return res.status(503).json({ 
                message: 'Banco de dados temporariamente indisponível. Use as credenciais de administrador.',
                debug: process.env.NODE_ENV === 'development' ? 'Database connection failed' : undefined
            });
        }
        
        res.status(500).json({ 
            message: 'Erro interno do servidor ao tentar fazer login.',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// --- Rota de Criação de Conta (Registro) ---
app.post('/api/register', async (req, res) => {
    // 1. Coleta e Validação dos Dados
    const { 
        nomeDoResponsavel, 
        email, 
        senha, 
        dataDeNascimento, 
        termosAceitos 
    } = req.body;

    // Verificação de campos essenciais (O frontend já faz, mas o backend deve repetir)
    if (!nomeDoResponsavel || !email || !senha || !dataDeNascimento || termosAceitos === undefined) {
        return res.status(400).json({ 
            message: 'Erro: Todos os campos são obrigatórios, incluindo a aceitação dos termos.' 
        });
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'Erro: Formato de email inválido.' 
        });
    }

    // Validação de força da senha
    if (senha.length < 6) {
        return res.status(400).json({ 
            message: 'Erro: A senha deve ter pelo menos 6 caracteres.' 
        });
    }

    if (senha.length > 128) {
        return res.status(400).json({ 
            message: 'Erro: A senha não pode ter mais de 128 caracteres.' 
        });
    }

    // Validação de termos aceitos
    if (termosAceitos !== true) {
        return res.status(400).json({ 
            message: 'Erro: É necessário aceitar os termos e condições.' 
        });
    }

    try {
        // 2. Hashing da Senha (Segurança)
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        
        // 3. Inserção no Banco de Dados
        const query = `
            INSERT INTO usuarios (nome_responsavel, email, senha_hash, data_nascimento, termos_aceitos)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, nome_responsavel;
        `;
        const values = [
            nomeDoResponsavel, 
            email, 
            senhaHash, 
            dataDeNascimento, 
            termosAceitos
        ];

        const result = await pool.query(query, values);
        
        // 4. Resposta de Sucesso
        res.status(201).json({ 
            message: 'Usuário registrado com sucesso!',
            user: result.rows[0] // Retorna o ID e o e-mail do novo usuário
        });

    } catch (error) {
        // 5. Tratamento de Erro (Ex: E-mail já existe)
        if (error.code === '23505' && error.constraint === 'usuarios_email_key') {
            return res.status(409).json({ 
                message: 'Erro: O e-mail fornecido já está em uso.' 
            });
        }
        console.error('Erro no registro do usuário:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor ao tentar registrar o usuário.' 
        });
    }
});

// --- Inicia o Servidor ---
app.listen(port, () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const renderUrl = 'https://mathkids-back.onrender.com';
    const localUrl = `http://localhost:${port}`;
    const baseUrl = isProduction ? renderUrl : localUrl;
    
    console.log('\n🚀 ================================');
    console.log('   MathKids API Server Started!');
    console.log('🚀 ================================');
    console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO (Render)' : 'DESENVOLVIMENTO'}`);
    console.log(`📡 Servidor: ${baseUrl}`);
    console.log(`🏠 Frontend: ${baseUrl}/`);
    console.log(`📝 Cadastro: ${baseUrl}/cadastro`);
    console.log(`🔗 API: POST ${baseUrl}/api/register`);
    
    if (swaggerUi && swaggerDocument) {
        console.log(`📚 Swagger Docs: ${baseUrl}/api-docs`);
        console.log(`📄 Swagger JSON: ${baseUrl}/api-docs.json`);
    }
    
    console.log(`💾 Banco: ${databaseUrl ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log('🚀 ================================\n');
    
    if (isProduction) {
        console.log('🌐 Para testar a API em produção:');
        console.log(`   curl -X POST ${renderUrl}/api/register \\`);
        console.log('     -H "Content-Type: application/json" \\');
        console.log('     -d \'{ "nomeDoResponsavel": "Teste", "email": "teste@email.com", "senha": "123456", "dataDeNascimento": "1990-01-01", "termosAceitos": true }\'');
    }
});