# 🧮 MathKids - Matemática Mágica para Crianças

Uma plataforma educativa digital para ensinar **matemática básica** para crianças de **3 a 9 anos** de forma interativa. O aprendizado é acompanhado por um dragão mascote que transforma cada lição em uma aventura mágica!

![Status](https://img.shields.io/badge/Status-Sistema%20Completo-brightgreen) ![Idade](https://img.shields.io/badge/Idade-3--9%20anos-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white) ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black) ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)

---

## 🎯 Sobre o Projeto

O **MathKids** é uma aplicação web completa projetada para tornar o aprendizado de matemática divertivo e envolvente para crianças pequenas. Com uma interface lúdica e um sistema robusto de autenticação, a plataforma oferece uma experiência segura e educativa tanto para crianças quanto para seus responsáveis.

### 🌟 Características Principais

| Recurso | Descrição | Status |
| :--- | :--- | :---: |
| **🐉 Mascote Amigável** | Um dragão fofo que guia a criança e oferece **reforço positivo** contínuo. | ✅ |
| **🎨 Interface Lúdica** | Design responsivo, colorido e intuitivo para o **público infantil** (3-9 anos). | ✅ |
| **🔐 Sistema de Autenticação** | Cadastro, Login Duplo (Admin + Usuário), Sessão Segura, Criptografia **bcrypt**. | ✅ |
| **📧 Recuperação de Senha** | Sistema completo de reset por email com tokens seguros. | ✅ |
| **🧠 Aprendizado Progressivo** | A dificuldade das atividades cresce conforme a idade e o nível da criança. | 🔄 Em Dev |
| **🎮 Gamificação** | Conceitos matemáticos transformados em jogos interativos com sistema de **níveis e recompensas**. | 🔄 Em Dev |

---

## 🛠️ Stack Tecnológico

**Frontend:** HTML5, CSS3, JavaScript ES6+, Design Mobile-First  
**Backend:** Node.js, Express.js, PostgreSQL, bcrypt, JWT, CORS, Nodemailer  
**Infraestrutura:** Render (hospedagem), Neon.tech (banco), Mailtrap (email)  
**Documentação:** Swagger/OpenAPI 3.0.3, swagger-ui-express

---

## 📁 Estrutura do Projeto

```
projeto/
├── 📄 index.html                    # Página principal/landing page
├── 📁 assets/                       # Recursos estáticos
│   ├── 📁 css/                      # Estilos da aplicação
│   ├── 📁 js/                       # Scripts JavaScript
│   └── 📁 images/                   # Imagens e assets visuais
├── 📁 cadastro/                     # Páginas de autenticação
│   ├── cadastrar.html               # Formulário de cadastro
│   ├── entrar.html                  # Formulário de login
│   └── reset-password.html          # Redefinição de senha
└── 📁 backend-registro/             # Servidor API
    ├── 📄 server.js                 # Servidor Express principal
    ├── 📄 email-service.js          # Serviço de envio de emails
    ├── 📄 swagger.json              # Documentação OpenAPI
    └── 📄 .env.example              # Template de configuração
```

---

## 🚀 Como Executar

### 📋 Pré-requisitos
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL** - Banco local ou [Neon.tech](https://neon.tech/) (recomendado)
- **Conta Mailtrap** - Para envio de emails ([Registro](https://mailtrap.io/))

### 🔧 Configuração

1. **Clone e configure o backend:**
```bash
git clone https://github.com/abe-karin/mathkids.git
cd mathkids/backend-registro
npm install
cp .env.example .env
# Edite o arquivo .env com suas configurações
npm start
```

2. **Sirva o frontend:**
```bash
# Na pasta raiz do projeto
cd ..
# Use qualquer servidor web de sua preferência:
# Node.js: npx http-server -p 8080
# VS Code: extensão Live Server
# Ou acesse diretamente via backend na porta 5000
```

3. **Acesse a aplicação:**
- **Frontend:** http://localhost:5000/ (servido pelo backend)
- **API Backend:** http://localhost:5000
- **Swagger Docs:** http://localhost:5000/api-docs

---

## 🔐 Sistema de Autenticação

### 👥 Acesso de Teste
- **Admin:** `adm@email.com` / `123456`
- **Usuários:** Cadastre-se em `/cadastro/cadastrar.html`

### 🔑 Funcionalidades
- ✅ **Login Seguro** - Criptografia bcrypt com salt
- ✅ **Lembrar de Mim** - Tokens persistentes com expiração
- ✅ **Recuperação de Senha** - Email com token temporário (60 min dev / 15 min prod)
- ✅ **Validação em Tempo Real** - Feedback imediato no frontend
- ✅ **Logout Seguro** - Revogação de tokens de autenticação

---

## 📧 Sistema de Email

### 🛠️ Provedores Suportados
1. **Mailtrap** (Recomendado para desenvolvimento) - Sandbox para testes
2. **Ethereal** (Fallback automático) - Serviço de teste gratuito

### ✉️ Características
- 🎨 **Design HTML Responsivo** - Visual consistente com a marca
- 🔒 **Links Seguros** - Tokens criptografados com expiração
- ⏰ **Expiração Automática** - Tokens válidos por 60 min (dev) / 15 min (prod)
- 📱 **Multi-formato** - HTML + texto puro para compatibilidade

---

## 📚 Documentação da API

**Swagger UI:** [Produção](https://mathkids-back.onrender.com/api-docs) | [Local](http://localhost:5000/api-docs)

### Principais Endpoints
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/register` | Cadastro de responsáveis |
| `POST` | `/api/login` | Login de usuários |
| `POST` | `/api/forgot-password` | Solicitar reset de senha |
| `POST` | `/api/reset-password` | Redefinir senha via token |
| `GET` | `/health` | Status do servidor |
| `GET` | `/health/database` | Status do banco |

**💡 Tip:** Use o Swagger UI para testar interativamente todos os endpoints com exemplos e validações automáticas.

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
- **Git Ignore** - Exclusão de dados sensíveis

---

## 🌍 Deploy e Produção

### 🚀 URLs de Produção
- **Backend API:** https://mathkids-back.onrender.com
- **Swagger Docs:** https://mathkids-back.onrender.com/api-docs
- **Health Check:** https://mathkids-back.onrender.com/health

### ⚙️ Configuração do Deploy
- **Render** - Backend hospedado com auto-deploy
- **Neon.tech** - PostgreSQL gerenciado na nuvem
- **Mailtrap** - Serviço de email para desenvolvimento/produção

---
## 🔄 Roadmap

| Fase | Foco | Status |
| :--- | :--- | :---: |
| **Fase 1** | Sistema de Autenticação e Interface Base | ✅ Concluído |
| **Fase 2** | Módulos Educativos: Contagem (3-5 anos) e Soma/Subtração (5-7 anos) | 🔄 Em Desenvolvimento |
| **Fase 3** | Gamificação Completa, Níveis e Sistema de Progresso | 📅 Planejado |
| **Fase 4** | Relatórios de Progresso e Controle Parental | 📅 Planejado |

---

## 🔐 Status e Módulos Implementados

O projeto completou a **Fase 1 (Autenticação e Interface Base)**. O foco atual (Fase 2) é a implementação dos módulos educativos.

### ✅ Módulos Concluídos

| Módulo | Funcionalidade Principal | Status |
| :--- | :--- | :---: |
| **Sistema de Autenticação** | Cadastro, Login Duplo (Admin + Usuário), Sessão Segura, Criptografia **bcrypt**. | ✅ |
| **Interface Base** | Design Mobile-First, Tema Infantil, Navegação Intuitiva. | ✅ |
| **Backend API** | API REST, Endpoints de Login/Registro, Documentação **Swagger**. | ✅ |
| **Configuração** | CORS, Variáveis de Ambiente, Deploy no **Render**. | ✅ |


### 🔄 Roadmap de Desenvolvimento (Próximos Passos)

| Fase | Foco | Prioridade | Status |
| :--- | :--- | :---: | :---: |
| **Fase 2** | Primeiros Módulos Educativos: **Contagem** (3-5 anos) e **Soma/Subtração** (5-7 anos). | 🚨 Alta | 🔄 Em Desenvolvimento |
| **Fase 3** | Gamificação Completa, Níveis, Recompensas e Sistema de Progresso. | 🔶 Média | 📅 Planejado |
| **Fase 4** | Relatórios de Progresso e Controle Parental Detalhado. | 🔷 Baixa | 📅 Planejado |

---

## ⚙️ Como Executar o Projeto Localmente

### 📋 Pré-requisitos
* **Node.js** v18+
* **PostgreSQL** (local ou em nuvem, ex: Neon.tech)
* **Git**

### 🔧 Configuração e Inicialização

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/abe-karin/mathkids.git](https://github.com/abe-karin/mathkids.git)
    cd mathkids
    ```

2.  **Configure e Inicie o Backend:**
    ```bash
    cd backend-registro
    npm install
    # Copie e edite o .env (PORT, DATABASE_URL, chaves JWT, etc.)
    cp .env.example .env 
    npm start # Inicia a API na porta 5000 (http://localhost:5000)
    ```
---
### 🎮 Como Testar o Sistema

#### 1. **Teste de Cadastro:**
1. Acesse: `http://localhost:5000/cadastro/cadastrar.html`
2. Preencha o formulário com dados válidos
3. Clique em "Cadastrar"

#### 2. **Teste de Login (Admin):**
1. Acesse: `http://localhost:5000/cadastro/entrar.html`
2. Use: `adm@email.com` / `123456`
3. Será redirecionado para o dashboard administrativo

#### 3. **Teste de Login (Usuário):**
1. Acesse: `http://localhost:5000/cadastro/entrar.html`
2. Use credenciais de um usuário cadastrado
3. Será redirecionado para o dashboard de usuário

---

# 📚 Documentação da API - Swagger

## 🌐 **Acesso ao Swagger (Produção)**

A documentação interativa da API está disponível em produção:

### **🚀 URLs Principais:**
- **Swagger UI:** https://mathkids-back.onrender.com/api-docs
- **API JSON:** https://mathkids-back.onrender.com/api-docs.json
- **Página Principal:** https://mathkids-back.onrender.com/ (redireciona para Swagger)
- **Health Check:** https://mathkids-back.onrender.com/health

## 🔧 **Configuração Inteligente**

O Swagger foi configurado para funcionar automaticamente em qualquer ambiente:

### **🏠 Desenvolvimento Local:**
```bash
cd backend-registro
npm start
```
- **Swagger UI:** http://localhost:5000/api-docs
- **Frontend:** http://localhost:5000/
- **API JSON:** http://localhost:5000/api-docs.json

### **🌐 Produção (Render):**
- Detecta automaticamente o ambiente de produção
- URLs se ajustam para `https://mathkids-back.onrender.com`
- Página inicial redireciona automaticamente para o Swagger

## 📋 **Endpoints Implementados**

### **🔐 Autenticação**
| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `POST` | `/api/register` | Registro de responsáveis/pais | ✅ |
| `POST` | `/api/login` | Login de usuários e admin | ✅ |

### **🏥 Sistema**
| Método | Endpoint | Descrição | Status |
| `GET` | `/health/database` | Status do banco |

**� Tip:** Use o Swagger UI para testar interativamente todos os endpoints com exemplos e validações automáticas.

---

## 📁 Estrutura Completa do Projeto

```
mathkids/
├──   index.html                    # 🏠 Landing page principal
├── 📄 admin-dashboard.html          # 🔑 Dashboard administrativo
├── 📄 dashboard.html                # 👤 Dashboard de usuário
├── 📄 package-lock.json             # 📦 Lock file do npm (raiz)
├── 📄 README.md                     # 📚 Este arquivo de documentação
│
├── 📁 assets/                       # 🎨 Recursos do Frontend
│   ├── 📁 css/                      # 🎨 Estilos CSS
│   │   ├── cadastro.css             # Estilo da página de cadastro
│   │   ├── entrar.css               # Estilo da página de login
│   │   ├── home.css                 # Estilo da página inicial
│   │   └── shared.css               # Estilos compartilhados
│   ├── 📁 images/                   # 🖼️ Imagens e recursos visuais
│   │   └── dragao.png               # 🐉 Mascote dragão
│   └── 📁 js/                       # ⚡ Scripts JavaScript
│       ├── app.js                   # Script principal da aplicação
│       ├── login.js                 # 🔐 Sistema completo de login
│       ├── navigation.js            # 🧭 Navegação entre páginas
│       └── registration.js          # 📝 Sistema de cadastro
│
├── 📁 backend-registro/             # 🖥️ Servidor Node.js e API
│   ├── 📄 .env                      # 🔒 Variáveis de ambiente (privado)
│   ├── 📄 .env.example              # 📝 Template de configuração
│   ├── 📄 .gitignore                # 🚫 Arquivos ignorados pelo Git
│   ├── 📄 package.json              # 📦 Dependências do backend
│   ├── 📄 package-lock.json         # 📦 Lock file do npm
│   ├── 📄 server.js                 # 🔧 Servidor principal da API
│   ├── 📄 swagger.json              # 📋 Documentação OpenAPI (JSON)
│   ├── 📄 swagger.yaml              # 📋 Documentação OpenAPI (YAML)
│   └── 📁 node_modules/             # 📚 Dependências instaladas
│
└── 📁 cadastro/                     # 🔐 Páginas de Autenticação
    ├── cadastrar.html               # 📝 Página de registro
    └── entrar.html                  # 🚪 Página de login
```
---

## 🤝 Contribuição e Contato

Este projeto é **open-source** e contribuições são muito bem-vindas! Se você tem ideias para novos jogos, melhorias de UX/UI, ou quer adicionar testes, sinta-se à vontade para colaborar.

1.  Faça um **fork** do projeto.
2.  Crie uma branch para sua funcionalidade (`git checkout -b feature/AmazingFeature`).
3.  Abra um **Pull Request**.

Para dúvidas ou suporte, por favor, abra uma **Issue** no repositório.

<div align="center">
  <br>
  **🎓 Construindo o futuro da educação matemática, uma linha de código por vez! 🐉✨**
  <br>
  <a href="#🧮-mathkids---matemática-mágica-para-crianças-✨">⬆ Voltar ao topo</a>
</div>