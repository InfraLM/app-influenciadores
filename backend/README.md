# Backend - Sistema de Influenciadores

Backend REST API em Express + TypeScript + PostgreSQL para o Sistema de Influenciadores da Liberdade Médica.

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar banco de dados

Execute o script SQL para criar todas as tabelas no PostgreSQL:

```bash
psql -U lovable -d liberdade-medica -h 35.199.101.38 -f schema.sql
```

Ou conecte via seu cliente PostgreSQL preferido e execute o conteúdo do arquivo `schema.sql`.

### 3. Configurar variáveis de ambiente

As variáveis já estão configuradas em `.env` (desenvolvimento) e `.env.production` (produção).

**IMPORTANTE:** Altere o `JWT_SECRET` em `.env.production` para uma string forte e aleatória antes de ir para produção!

```bash
# Exemplo de como gerar um JWT_SECRET forte:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Executar em desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### 5. Build para produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   ├── auth.ts          # Configurações de autenticação JWT
│   │   └── database.ts      # Conexão com PostgreSQL
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── influencersController.ts
│   │   ├── contentsController.ts
│   │   └── genericController.ts
│   ├── middleware/
│   │   └── auth.ts          # Middleware de autenticação
│   ├── routes/
│   │   └── index.ts         # Todas as rotas da API
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   └── server.ts            # Servidor Express
├── .env                     # Configurações de desenvolvimento
├── .env.production          # Configurações de produção
├── schema.sql               # Schema completo do banco de dados
├── package.json
└── tsconfig.json
```

## 🗄️ Schema do Banco de Dados

O banco de dados possui as seguintes tabelas principais:

### Schema `auth`
- `users` - Usuários do sistema (autenticação)

### Schema `public`
- `profiles` - Perfis de usuários
- `user_roles` - Papéis dos usuários (admin/influencer)
- `influencers` - Dados dos influenciadores
- `contents` - Conteúdos publicados
- `performance_evaluations` - Avaliações de performance
- `documents` - Documentos do sistema
- `monthly_goals` - Metas mensais
- `prospect_cards` - Cards de prospecção
- `prospect_comments` - Comentários em prospects
- `prospect_reopen_history` - Histórico de reabertura
- `invites` - Convites para novos usuários

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação.

### Endpoints de autenticação:

- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Registro
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Obter sessão atual

### Usando a autenticação:

1. Faça login e receba um token
2. Inclua o token no header de todas as requisições protegidas:
   ```
   Authorization: Bearer SEU_TOKEN_AQUI
   ```

## 📡 Endpoints da API

### Influencers
- `GET /api/influencers` - Listar todos
- `GET /api/influencers/:id` - Buscar por ID
- `POST /api/influencers` - Criar novo (admin)
- `PUT /api/influencers/:id` - Atualizar
- `DELETE /api/influencers/:id` - Deletar (admin)

### Contents
- `GET /api/contents?month_year=2024-01&influencer_id=xxx` - Listar conteúdos
- `POST /api/contents` - Criar conteúdo
- `PUT /api/contents/:id` - Atualizar conteúdo
- `DELETE /api/contents/:id` - Deletar conteúdo

### Outros endpoints
- `/api/performance-evaluations`
- `/api/documents`
- `/api/monthly-goals`
- `/api/prospects`
- `/api/prospect-comments`
- `/api/invites`
- `/api/profiles`
- `/api/user-roles`

## 🌐 Deploy em Produção

### 1. Configurar variáveis de ambiente

Edite `.env.production` e configure:
- `JWT_SECRET` - Use uma string forte e aleatória
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` - Credenciais do banco
- `CORS_ORIGIN` - Domínio do frontend (https://lmedu.com.br)

### 2. Build

```bash
npm run build
```

### 3. Rodar em produção

```bash
NODE_ENV=production npm start
```

### 4. Configurar proxy reverso (Nginx)

Configure o Nginx para rotear `/influenciadores/api` para o backend:

```nginx
location /influenciadores/api {
    proxy_pass http://localhost:3000/api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 🔧 Troubleshooting

### Erro de conexão com o banco

Verifique:
1. IP do banco está correto
2. Porta 5432 está aberta
3. Credenciais estão corretas
4. O schema `auth` foi criado

### Erro de CORS

Verifique se `CORS_ORIGIN` no `.env` está configurado corretamente com o domínio do frontend.

## 📝 Notas sobre a Migração

Esta API substitui completamente o Supabase. As principais diferenças:

1. **Autenticação**: JWT ao invés de Supabase Auth
2. **Storage**: Será necessário configurar upload de arquivos separadamente (multer já está instalado)
3. **Realtime**: Não há suporte a realtime (WebSockets podem ser adicionados posteriormente se necessário)
4. **RLS**: As políticas RLS do Supabase foram substituídas por middleware de autenticação

## 🔑 Criar Primeiro Usuário Admin

Após executar o schema, você precisará criar um usuário admin manualmente:

```sql
-- Inserir usuário
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'admin@lmedu.com.br',
  '$2a$10$XQZ...', -- Hash bcrypt da senha
  NOW()
);

-- Atualizar role para admin (o trigger cria como influencer por padrão)
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lmedu.com.br');
```

Para gerar o hash da senha em bcrypt, você pode usar:

```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('sua_senha', 10));
```

Ou use o endpoint de signup e depois altere a role manualmente no banco.
