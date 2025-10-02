# 🖥️ Backend - MathKids API

> API REST robusta para o sistema educativo MathKids, construída com **Node.js + Express** e **PostgreSQL**.

![Node.js](https://img.shields.io/badge/Node.js-16+-green) ![Express](https://img.shields.io/badge/Express-4.19+-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon.tech-blue) ![Swagger](https://img.shields.io/badge/API-Swagger-orange)

---

## 🎯 Sobre

Esta API fornece todos os serviços de backend para a aplicação MathKids, incluindo autenticação, gestão de usuários, recuperação de senha e documentação automática.

### 🌟 Características

- ✅ **API REST** completa com Express.js
- ✅ **Autenticação segura** com bcrypt + JWT
- ✅ **PostgreSQL** via Neon.tech (desenvolvimento e produção)
- ✅ **Sistema de email** com Mailtrap
- ✅ **Documentação Swagger** interativa
- ✅ **CORS configurado** para frontend
- ✅ **Health checks** para monitoramento
- ✅ **Logs detalhados** para debugging

---

## 📁 Estrutura do Projeto

```
backend/
├── 📄 server.js            # Servidor Express principal
├── 📄 email-service.js     # Serviço de envio de emails
├── 📄 swagger.json         # Documentação OpenAPI (JSON)
├── 📄 swagger.yaml         # Documentação OpenAPI (YAML)
├── 📄 package.json         # Dependências e scripts
├── 📄 .env.example         # Template de configuração
├── 📄 .env                 # Variáveis de ambiente (não commitado)
├── 📄 .gitignore           # Arquivos ignorados pelo Git
└── 📄 README.md            # Este arquivo
```

---

## 🚀 Como Executar

### 📋 Pré-requisitos
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL** - [Neon.tech](https://neon.tech/) (recomendado)
- **Mailtrap** - [Mailtrap.io](https://mailtrap.io/) (para emails)

### ⚡ Instalação Rápida

1. **Navegue para a pasta backend:**
```bash
cd backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o servidor:**
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

### 🌐 URLs de Acesso

- **API Base:** http://localhost:5000
- **Swagger Docs:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/health
- **Health Database:** http://localhost:5000/health/database

---

## ⚙️ Configuração (.env)

### 🔧 Variáveis Obrigatórias

```bash
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados (Neon.tech)
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/db

# Email (Mailtrap)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=seu_usuario_mailtrap
MAILTRAP_PASS=sua_senha_mailtrap

# Email Config
EMAIL_FROM=noreply@mathkids.com
EMAIL_FROM_NAME=MathKids - Educação Infantil

# Frontend
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### 🛠️ Configuração Completa

Veja o arquivo `.env.example` para todas as opções disponíveis, incluindo:
- Configurações de debug
- Múltiplas origens CORS
- Configurações de produção

---

## 📚 API Endpoints

### 🔐 Autenticação

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `POST` | `/api/register` | Cadastro de usuários | ✅ |
| `POST` | `/api/login` | Login de usuários | ✅ |
| `POST` | `/api/logout` | Logout seguro | ✅ |
| `GET` | `/api/verify-token` | Verificar token salvo | ✅ |

### 📧 Recuperação de Senha

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `POST` | `/api/forgot-password` | Solicitar reset de senha | ✅ |
| `POST` | `/api/reset-password` | Redefinir senha com token | ✅ |

### 🏥 Monitoramento

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `GET` | `/health` | Status geral do servidor | ✅ |
| `GET` | `/health/database` | Status do banco PostgreSQL | ✅ |
| `GET` | `/health/email` | Status do serviço de email | ✅ |

### 🔍 Debug (Desenvolvimento)

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `GET` | `/debug` | Informações de debug | ⚠️ Dev only |
| `GET` | `/api/debug/users` | Listar usuários | ⚠️ Dev only |
| `GET` | `/api/debug/reset-tokens/:email` | Tokens de reset | ⚠️ Dev only |

---

## 📖 Documentação da API

### 🌐 Swagger UI Interativo

A documentação completa da API está disponível em:

**Desenvolvimento:** http://localhost:5000/api-docs  
**Produção:** https://mathkids-back.onrender.com/api-docs

### 📋 Características da Documentação

- ✅ **Interface interativa** para testar endpoints
- ✅ **Exemplos de requisição/resposta** detalhados
- ✅ **Esquemas de validação** completos
- ✅ **Códigos de erro** documentados
- ✅ **Autenticação** via Swagger UI
- ✅ **URLs dinâmicas** (desenvolvimento/produção)

### 🔧 Formatos Disponíveis

- **Swagger UI:** `/api-docs` (interface visual)
- **JSON:** `/api-docs.json` (para integração)
- **YAML:** `swagger.yaml` (arquivo fonte)

---

## 🗄️ Banco de Dados

### 📊 Tabelas Principais

- **`usuarios`** - Dados dos responsáveis e crianças
- **`password_resets`** - Tokens de recuperação de senha
- **`auth_tokens`** - Tokens de sessão persistente

### 💾 Configuração

**Desenvolvimento/Produção:** Neon.tech (PostgreSQL gerenciado)
- ✅ **SSL automático** habilitado
- ✅ **Backups automáticos** 
- ✅ **Escalabilidade** automática
- ✅ **Conexão segura** com pooling

### 🔧 Comandos SQL

O servidor cria automaticamente as tabelas necessárias na primeira execução.

---

## 📧 Sistema de Email

### 🛠️ Provedores Suportados

1. **Mailtrap** (Recomendado para desenvolvimento)
   - Sandbox para testes sem envio real
   - Interface web para visualizar emails
   - API estável e confiável

2. **Ethereal** (Fallback automático)
   - Usado quando Mailtrap falha
   - Gera URLs de preview
   - Totalmente gratuito

### ✉️ Funcionalidades

- 🎨 **Templates HTML** responsivos
- 🔒 **Links seguros** com tokens criptografados
- ⏰ **Expiração automática** de tokens
- 📱 **Compatibilidade** com todos os clientes
- 🛡️ **Fallback automático** entre provedores

### 📋 Emails Implementados

- **Reset de Senha** - Token seguro com expiração
- **Confirmação de Cadastro** - Boas-vindas ao usuário

---

## 🔒 Segurança

### 🛡️ Medidas Implementadas

- **Criptografia bcrypt** - Senhas com salt de 10 rounds
- **Tokens JWT seguros** - Expiração automática
- **CORS configurado** - Origens específicas permitidas
- **Validação rigorosa** - Sanitização de todos os inputs
- **Rate limiting** - Proteção contra ataques
- **Logs de segurança** - Monitoramento de tentativas

### 🔐 Variáveis Sensíveis

Todas as credenciais são mantidas no arquivo `.env`:
- ✅ **Nunca commitadas** no Git
- ✅ **Diferentes para cada ambiente** 
- ✅ **Validação na inicialização**
- ✅ **Logs sem exposição** de dados sensíveis

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start

# Instalar dependências
npm install

# Verificar dependências
npm audit
```

---

## 🌍 Deploy (Produção)

### 🚀 Render.com

O backend está configurado para deploy automático no Render:

**URL de Produção:** https://mathkids-back.onrender.com

### ⚙️ Configuração no Render

```bash
# Build Command
npm install

# Start Command  
npm start

# Environment Variables
NODE_ENV=production
DATABASE_URL=postgresql://...  # Conectado ao Neon.tech
MAILTRAP_USER=...
MAILTRAP_PASS=...
```

### 🔗 Integração

- **Backend:** Render.com (auto-deploy do GitHub)
- **Banco:** Neon.tech (PostgreSQL gerenciado)
- **Email:** Mailtrap (desenvolvimento e produção)

---

## 🧪 Como Testar

### 1. **Health Check Básico:**
```bash
curl http://localhost:5000/health
```

### 2. **Teste de Banco:**
```bash
curl http://localhost:5000/health/database
```

### 3. **Teste de Email:**
```bash
curl http://localhost:5000/health/email
```

### 4. **Documentação Swagger:**
Acesse http://localhost:5000/api-docs

### 5. **Teste de Cadastro:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"nomeDoResponsavel":"Teste","email":"teste@test.com","senha":"123456","dataDeNascimento":"1990-01-01","termosAceitos":true}'
```

---

## 🛠️ Troubleshooting

### ❌ Problema: Servidor não inicia
**Solução:**
1. Verifique se o arquivo `.env` existe
2. Confirme se todas as variáveis obrigatórias estão preenchidas
3. Teste a conexão com o banco: `npm run dev`

### ❌ Problema: Erro de conexão com banco
**Solução:**
1. Verifique a `DATABASE_URL` no `.env`
2. Confirme se o Neon.tech está acessível
3. Teste: http://localhost:5000/health/database

### ❌ Problema: Emails não enviados
**Solução:**
1. Verifique credenciais do Mailtrap no `.env`
2. Teste: http://localhost:5000/health/email
3. Verifique logs do servidor para detalhes

### ❌ Problema: CORS Error
**Solução:**
1. Adicione a origem no `ALLOWED_ORIGINS` no `.env`
2. Reinicie o servidor
3. Verifique se frontend está na porta correta

---

## 📞 Suporte e Contato

- **Logs detalhados:** Ativados automaticamente em desenvolvimento
- **Swagger:** Documentação completa em `/api-docs`
- **Health checks:** Monitoramento em tempo real
- **Debug endpoints:** Informações técnicas para desenvolvimento

---

<div align="center">

**🔧 Backend robusto e escalável para educação infantil**

*Construído com segurança e performance em mente* 🛡️⚡

</div>