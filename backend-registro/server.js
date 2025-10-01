// server.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config(); 

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Para permitir requisições do seu frontend
const path = require('path');
const fs = require('fs');

const app = express();
// Render usa porta dinâmica, local usa 5000
const port = process.env.PORT || 5000;

// Log importante para debug no Render
console.log(`🔧 Starting server on port: ${port}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 DATABASE_URL configured: ${process.env.DATABASE_URL ? 'YES' : 'NO'}`);

// --- Configuração do Swagger ---
// Verifica se as dependências do Swagger estão disponíveis
let swaggerUi, swaggerDocument;

// Função utilitária para verificar ambiente
const isProduction = () => process.env.NODE_ENV === 'production';
const getBaseUrl = () => isProduction() ? 'https://mathkids-back.onrender.com' : `http://localhost:${port}`;

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

// --- Middlewares ---
app.use(express.json()); // Permite que o Express leia JSON do corpo da requisição

// Servir arquivos estáticos do frontend
app.use(express.static('../')); // Serve arquivos da pasta raiz do projeto

// Configuração do CORS para produção e desenvolvimento
const allowedOrigins = [
    // Desenvolvimento local
    'http://localhost:5000',
    'http://127.0.0.1:5000', 
    'http://localhost:8080',
    'http://localhost:3000',
    // Produção - Render (todas as variações possíveis)
    'https://mathkids-back.onrender.com',
    'https://mathkids.onrender.com',
    'https://mathkids-front.onrender.com'
];

console.log(`🔧 CORS Origins configured: ${allowedOrigins.length} origins`);
console.log(`🔧 CORS Origins: ${allowedOrigins.join(', ')}`);

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS bloqueado para origem:', origin);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); 

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
    ssl: {
        rejectUnauthorized: false 
    }
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
            docs: '/api-docs',
            health: '/health'
        },
        database: databaseUrl ? 'connected' : 'not configured',
        timestamp: new Date().toISOString()
    });
});

// --- Rotas para servir páginas HTML ---
app.get('/', (req, res) => {    
    if (isProduction()) {
        // Em produção (Render), redirecionar para Swagger
        res.redirect('/api-docs');
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

// --- Rota de Login ---
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
        const token = `token_${user.id}_${Date.now()}`;

        console.log(`✅ Login realizado com sucesso para: ${email}`);

        res.status(200).json({ 
            message: 'Login realizado com sucesso!',
            user: userData,
            token: token,
            rememberMe: rememberMe
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