# Deploy na Vercel - Guia Completo

Este guia explica como fazer o deploy do sistema de influenciadores na Vercel com o domínio `influenciadores.lmedu.com.br`.

## 📋 Pré-requisitos

1. Conta na Vercel
2. Repositório no GitHub
3. Acesso ao DNS do domínio `lmedu.com.br`

## 🚀 Passo a Passo

### 1. Preparar o Repositório

O projeto já está configurado para deploy na Vercel. Certifique-se de que todos os arquivos foram commitados:

```bash
git add .
git commit -m "Configurar projeto para deploy na Vercel"
git push origin main
```

### 2. Importar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure o projeto:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (já configurado)
   - **Output Directory**: `dist` (já configurado)
   - **Install Command**: `npm install`

### 3. Configurar Variáveis de Ambiente

Na seção "Environment Variables" da Vercel, adicione:

#### Variáveis do Frontend

```
VITE_API_URL=https://influenciadores.lmedu.com.br/api
VITE_APP_ENV=production
```

#### Variáveis do Backend

```
NODE_ENV=production
PORT=3000

# Database
DB_HOST=35.199.101.38
DB_PORT=5432
DB_NAME=liberdade-medica
DB_USER=lovable
DB_PASSWORD=XqH+B5tdvyR-AebQ

# JWT
JWT_SECRET=beb18607dd2bd434f3b7ffab8a95d0b8aacfa2732a1cb3005594c1fb38912cd3d1867f1a1c5c6cd1bf3c66712187ab4a602c986b4bf067560e33b919b340a455

# CORS
CORS_ORIGIN=https://influenciadores.lmedu.com.br
```

⚠️ **IMPORTANTE**: Certifique-se de que o `JWT_SECRET` seja uma string forte e aleatória em produção!

### 4. Configurar Domínio Personalizado

1. Na dashboard da Vercel, vá em "Settings" > "Domains"
2. Adicione o domínio: `influenciadores.lmedu.com.br`
3. A Vercel fornecerá as configurações de DNS

### 5. Configurar DNS

No painel de DNS do domínio `lmedu.com.br`, adicione um registro CNAME:

```
Tipo: CNAME
Nome: influenciadores
Valor: cname.vercel-dns.com
TTL: 3600 (ou o padrão)
```

**OU** use um registro A (se preferir):

```
Tipo: A
Nome: influenciadores
Valor: [IP fornecido pela Vercel]
TTL: 3600
```

### 6. Verificar Deploy

Após o deploy:

1. Acesse `https://influenciadores.lmedu.com.br`
2. Teste o login
3. Verifique se as APIs funcionam corretamente em `https://influenciadores.lmedu.com.br/api/health`

## 🏗️ Estrutura de Rotas

- **Frontend**: `influenciadores.lmedu.com.br/*` (todas as rotas do SPA)
- **Backend API**: `influenciadores.lmedu.com.br/api/*`

Exemplos:
- Login: `https://influenciadores.lmedu.com.br/login`
- Dashboard: `https://influenciadores.lmedu.com.br/`
- API Health: `https://influenciadores.lmedu.com.br/api/health`
- API Login: `https://influenciadores.lmedu.com.br/api/auth/login`

## 📝 Configurações do Projeto

### Frontend

- **Base URL**: `/` (raiz do domínio)
- **API URL**: `https://influenciadores.lmedu.com.br/api`
- **Router**: BrowserRouter sem basename

### Backend

- **Rotas**: Todas em `/api/*`
- **CORS**: Configurado para `https://influenciadores.lmedu.com.br`
- **Serverless**: O Express é exportado e funciona como serverless function

## 🔧 Desenvolvimento Local

Para desenvolvimento local:

```bash
# Frontend (raiz do projeto)
npm run dev

# Backend (pasta backend)
cd backend
npm run dev
```

O frontend estará em `http://localhost:8080` e o backend em `http://localhost:3000`.

## 📦 Build Local

Para testar o build localmente:

```bash
npm run build
npm run preview
```

## 🔄 Atualizações

Para fazer deploy de novas versões:

1. Faça commit das mudanças
2. Push para o GitHub
3. A Vercel fará o deploy automaticamente (se configurado)

OU faça deploy manual:

```bash
vercel --prod
```

## 🐛 Troubleshooting

### Erro 404 nas Rotas da API

Verifique se o `vercel.json` está configurado corretamente e se o backend está sendo executado.

### CORS Error

Certifique-se de que a variável `CORS_ORIGIN` está configurada corretamente na Vercel:

```
CORS_ORIGIN=https://influenciadores.lmedu.com.br
```

### Erro de Conexão com Banco de Dados

Verifique se as variáveis de ambiente do banco de dados estão configuradas corretamente na Vercel.

### Rotas do Frontend Retornam 404

Certifique-se de que o `vercel.json` tem a configuração de fallback para `index.html`:

```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## 📚 Recursos Úteis

- [Documentação da Vercel](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Configuração de Domínios na Vercel](https://vercel.com/docs/concepts/projects/domains)

## ✅ Checklist Final

- [ ] Código commitado e pushed para GitHub
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio personalizado adicionado
- [ ] DNS configurado
- [ ] Deploy realizado com sucesso
- [ ] Testes de login funcionando
- [ ] APIs respondendo corretamente
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS funcionando

---

**Última atualização**: 2026-02-20
