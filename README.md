# 🧮 **MathKids - Matemática Mágica para Crianças**

> Uma plataforma educativa digital para ensinar **matemática básica** para crianças de **3 a 9 anos** de forma interativa, acompanhada por um dragão mascote que transforma cada lição em uma aventura mágica!

![Status](https://img.shields.io/badge/Status-Sistema%20Completo-brightgreen) ![Idade](https://img.shields.io/badge/Idade-3--9%20anos-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white) ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black) ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)

---

## 🎯 Sobre o Projeto

O **MathKids** é uma aplicação web completa projetada para tornar o aprendizado de matemática divertido e envolvente para crianças pequenas. Com uma interface lúdica e um sistema robusto de autenticação, a plataforma oferece uma experiência segura e educativa tanto para crianças quanto para seus responsáveis.

### 🌟 Características Principais

| Recurso | Descrição | Status |
| :--- | :--- | :---: |
| **🐉 Mascote Amigável** | Um dragão fofo que guia a criança e oferece **reforço positivo** contínuo | ✅ |
| **🎨 Interface Lúdica** | Design responsivo, colorido e intuitivo para o **público infantil** (3-9 anos) | ✅ |
| **🔐 Sistema de Autenticação** | Cadastro, Login Duplo (Admin + Usuário), Sessão Segura, Criptografia **bcrypt** | ✅ |
| **📧 Recuperação de Senha** | Sistema completo de reset por email com tokens seguros | ✅ |
| **🏗️ Arquitetura Separada** | Frontend e Backend completamente separados para melhor manutenção | ✅ |
| **🧠 Aprendizado Progressivo** | A dificuldade das atividades cresce conforme a idade e o nível da criança | � Planejado |
| **🎮 Gamificação** | Conceitos matemáticos transformados em jogos interativos | � Planejado |

---

## 🏗️ Arquitetura do Projeto

O projeto foi **reestruturado** para separar claramente frontend e backend:

```
mathkids/
├── 📁 frontend/                 # 🎨 Aplicação Frontend
│   ├── 📄 index.html           # Página principal
│   ├── 📄 dashboard.html       # Dashboard do usuário
│   ├── 📄 admin-dashboard.html # Dashboard administrativo
│   ├── 📁 cadastro/            # Páginas de autenticação
│   │   ├── cadastrar.html      # Formulário de cadastro
│   │   ├── entrar.html         # Formulário de login
│   │   └── reset-password.html # Redefinição de senha
│   ├── 📁 assets/              # Recursos estáticos
│   │   ├── 📁 css/             # Estilos da aplicação
│   │   ├── 📁 js/              # Scripts JavaScript
│   │   └── 📁 images/          # Imagens e assets visuais
│   ├── 📄 favicon.ico          # Ícone do dragão 🐉
│   └── 📄 package.json         # Dependências do frontend
├── 📁 backend/                 # 🖥️ API e Servidor
│   ├── 📄 server.js            # Servidor Express principal
│   ├── 📄 email-service.js     # Serviço de envio de emails
│   ├── 📄 swagger.json         # Documentação OpenAPI
│   ├── 📄 .env.example         # Template de configuração
│   └── 📄 package.json         # Dependências do backend
├── 📄 package.json             # Scripts do workspace
├── 📄 .gitignore               # Configuração do Git
└── 📄 README.md                # Este arquivo
```

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **HTML5, CSS3, JavaScript ES6+** - Interface do usuário
- **Design Mobile-First** - Otimizado para tablets e smartphones
- **Live-server** - Servidor de desenvolvimento com auto-reload

### **Backend**
- **Node.js + Express.js** - Servidor API REST
- **PostgreSQL** - Banco de dados principal (Neon.tech)
- **bcrypt** - Criptografia de senhas
- **Nodemailer** - Envio de emails
- **Swagger/OpenAPI** - Documentação automática da API

### **Infraestrutura**
- **Desenvolvimento:** localhost
- **Produção:** Render.com (Backend) + Neon.tech (Banco)
- **Email:** Mailtrap (desenvolvimento) + Ethereal (fallback)

### **Performance e Compatibilidade**
- **Navegadores:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos:** Tablets (iPad, Android), Smartphones, Desktops
- **Responsividade:** Mobile-first design otimizado para touch
- **Acessibilidade:** Suporte a leitores de tela e navegação por teclado

---

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Git** - Para clonagem do repositório
- **PostgreSQL** - Banco local ou [Neon.tech](https://neon.tech/) (recomendado)

### ⚡ Execução Rápida (Recomendado)

1. **Clone o repositório:**
```bash
git clone https://github.com/abe-karin/mathkids.git
cd mathkids
```

2. **Instale todas as dependências:**
```bash
npm run install:all
```

3. **Configure o backend:**
```bash
cd backend
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute ambos os serviços:**
```bash
cd ..
npm run dev
```

### 🔧 Execução Separada (Para Desenvolvimento)

**Terminal 1 - Backend:**
```bash
cd backend
npm install          # primeira vez apenas
npm run dev          # desenvolvimento com nodemon
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install          # primeira vez apenas
npm run dev          # desenvolvimento com live-server
```

### 🌐 URLs de Acesso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Swagger Docs:** http://localhost:5000/api-docs

---

## 🔐 Sistema de Autenticação

### 👥 Credenciais de Teste
- **Admin:** `adm@email.com` / `123456`
- **Usuários:** Cadastre-se em http://localhost:3000/cadastro/cadastrar.html

### 🔑 Funcionalidades
- ✅ **Login Seguro** - Criptografia bcrypt com salt
- ✅ **Lembrar de Mim** - Tokens persistentes com expiração
- ✅ **Recuperação de Senha** - Email com token temporário (60 min dev / 15 min prod)
- ✅ **Validação em Tempo Real** - Feedback imediato no frontend
- ✅ **Logout Seguro** - Revogação de tokens de autenticação
- ✅ **CORS Configurado** - Comunicação segura entre frontend e backend

---

## 📚 Documentação da API

### 🌐 Swagger UI Interativo
- **Desenvolvimento:** http://localhost:5000/api-docs
- **Produção:** https://mathkids-back.onrender.com/api-docs

### 📋 Principais Endpoints

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `POST` | `/api/register` | Cadastro de responsáveis | ✅ |
| `POST` | `/api/login` | Login de usuários e admin | ✅ |
| `POST` | `/api/forgot-password` | Solicitar reset de senha | ✅ |
| `POST` | `/api/reset-password` | Redefinir senha via token | ✅ |
| `GET` | `/health` | Status do servidor | ✅ |
| `GET` | `/health/database` | Status do banco de dados | ✅ |

---

## 📧 Sistema de Email

### 🛠️ Configuração
- **Desenvolvimento:** Mailtrap (sandbox para testes)
- **Produção:** Mailtrap + Ethereal (fallback automático)
- **Templates:** HTML responsivo com visual consistente

### ✉️ Funcionalidades
- 🎨 **Design HTML Responsivo** - Visual consistente com a marca
- 🔒 **Links Seguros** - Tokens criptografados com expiração
- ⏰ **Expiração Automática** - Tokens válidos por 60 min (dev) / 15 min (prod)
- 📱 **Multi-formato** - HTML + texto puro para compatibilidade

---

## 🗄️ Banco de Dados

### 📊 Estrutura Principal
- **`usuarios`** - Dados dos responsáveis (nome, email, senha_hash, etc.)
- **`password_resets`** - Tokens de recuperação de senha
- **`auth_tokens`** - Tokens de sessão para "lembrar de mim"

### 💾 Configuração
- **Desenvolvimento:** PostgreSQL local ou Neon.tech
- **Produção:** Neon.tech (PostgreSQL gerenciado)
- **SSL:** Habilitado automaticamente
- **Backups:** Automáticos no Neon.tech

---

## 🔒 Segurança

### 🛡️ Medidas Implementadas
- **Criptografia bcrypt** - Senhas com salt de 10 rounds
- **Tokens JWT Seguros** - Expiração automática
- **Validação de Input** - Sanitização de dados
- **CORS Configurado** - Origens permitidas específicas
- **Variáveis de Ambiente** - Credenciais protegidas
- **Git Ignore Otimizado** - Exclusão de dados sensíveis

### 🔐 .gitignore Configuração
- ✅ Arquivos `.env` (credenciais) protegidos
- ✅ `node_modules/` ignorados
- ✅ Logs e arquivos temporários
- ✅ `package-lock.json` **mantido** (para builds consistentes)

---

## 🛠️ Scripts Disponíveis

### 📦 Workspace (Raiz)
```bash
npm run install:all    # Instala dependências de frontend + backend
npm run dev:backend    # Apenas backend (desenvolvimento - porta 5000)
npm run dev:frontend   # Apenas frontend (desenvolvimento - porta 3000)
npm run start:backend  # Apenas backend (produção)
npm run start:frontend # Apenas frontend (produção)
```

### 🖥️ Backend
```bash
npm start              # Servidor produção
npm run dev            # Servidor desenvolvimento (nodemon)
```

### 🎨 Frontend
```bash
npm start              # Live-server simples
npm run dev            # Live-server com auto-reload
```

### 🧹 Manutenção
```bash
# Para limpeza manual:
rm -rf backend/node_modules frontend/node_modules  # Linux/Mac
rmdir /s backend\node_modules frontend\node_modules  # Windows
```

### 🔍 Debugging e Logs
```bash
# Verificar logs do backend:
cd backend && npm run dev

# Verificar logs do frontend:
cd frontend && npm run dev

# Health check da API:
curl http://localhost:5000/health
curl http://localhost:5000/health/database
```

---

## 🌍 Deploy e Produção

### 🚀 URLs de Produção
- **Backend API:** https://mathkids-back.onrender.com
- **Swagger Docs:** https://mathkids-back.onrender.com/api-docs
- **Health Check:** https://mathkids-back.onrender.com/health

### ⚙️ Configuração do Deploy
- **Backend:** Render.com com auto-deploy
- **Banco:** Neon.tech (PostgreSQL gerenciado)
- **Email:** Mailtrap para desenvolvimento/produção

---

## 🔄 Roadmap de Desenvolvimento

| Fase | Foco | Status |
| :--- | :--- | :---: |
| **Fase 1** | ✅ Sistema de Autenticação e Interface Base | ✅ Concluído |
| **Fase 1.5** | ✅ Reestruturação Frontend/Backend Separados | ✅ Concluído |
| **Fase 2** | � Módulos Educativos: Contagem (3-5 anos) e Soma/Subtração (5-7 anos) | � Planejado |
| **Fase 3** | 📅 Gamificação Completa, Níveis e Sistema de Progresso | 📅 Planejado |
| **Fase 4** | 📅 Relatórios de Progresso e Controle Parental | 📅 Planejado |

---

## 🧪 Como Testar

### 1. **Teste de Cadastro:**
```
URL: http://localhost:3000/cadastro/cadastrar.html
Ação: Preencha o formulário com dados válidos
Resultado: Redirecionamento para página de login
```

### 2. **Teste de Login (Admin):**
```
URL: http://localhost:3000/cadastro/entrar.html
Credenciais: adm@email.com / 123456
Resultado: Redirecionamento para dashboard administrativo
```

### 3. **Teste de Login (Usuário):**
```
URL: http://localhost:3000/cadastro/entrar.html
Credenciais: Use uma conta cadastrada
Resultado: Redirecionamento para dashboard de usuário
```

### 4. **Teste de Reset de Senha:**
```
URL: http://localhost:3000/cadastro/entrar.html
Ação: Clique em "Esqueci minha senha"
Verificação: Check email (Mailtrap) para link de reset
```

---

## 🛠️ Troubleshooting

### ❌ Problema: Erro de CORS
**Solução:** 
1. Verifique se o backend está rodando na porta 5000 e o frontend na porta 3000
2. Certifique-se de que ambos os serviços estão ativos simultaneamente
3. Limpe o cache do navegador se necessário

### ❌ Problema: Backend não conecta ao banco
**Solução:** 
1. Verifique se o arquivo `.env` existe em `/backend`
2. Copie de `.env.example` se necessário
3. Configure as variáveis de ambiente corretamente
4. Teste a conexão: `npm run dev` no backend

### ❌ Problema: Dependências não instaladas
**Solução:**
```bash
npm run install:all  # Instala tudo de uma vez
# OU separadamente:
cd backend && npm install
cd ../frontend && npm install
```

### ❌ Problema: Portas ocupadas
**Solução:**
```bash
# Windows
taskkill /f /im node.exe

# Linux/Mac
pkill -f node

# Depois reinicie os serviços
npm run dev
```

---

## 🤝 Contribuição

Este projeto é **open-source** e contribuições são muito bem-vindas! 

### 📋 Como Contribuir
1. Faça um **fork** do projeto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### 💡 Ideias para Contribuição
- 🎮 Novos jogos educativos
- 🎨 Melhorias de UX/UI
- 🧪 Testes automatizados
- 📚 Documentação
- 🌍 Internacionalização
- ♿ Acessibilidade
---

<div align="center">

**Feito com ❤️ para educar e divertir as crianças**

*Transformando o aprendizado de matemática em uma aventura mágica!* 🐉✨

</div>