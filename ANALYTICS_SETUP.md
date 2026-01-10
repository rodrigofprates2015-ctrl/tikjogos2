# Guia Rápido - Configuração do Analytics

## Problema Atual

O erro "Erro ao carregar dados de analytics" ocorre porque:
1. ❌ A variável `DATABASE_URL` não está configurada
2. ❌ A tabela `analytics_events` não foi criada no banco

## Solução

### Opção 1: Configurar Banco de Dados (Recomendado)

#### Passo 1: Configurar DATABASE_URL

**No Gitpod/Replit:**
```bash
# Adicione a variável de ambiente
export DATABASE_URL="postgresql://user:password@host:port/database"
```

**No Render:**
- Vá no seu Web Service → Environment
- Adicione: `DATABASE_URL` = `sua_connection_string_postgresql`
- Clique em "Save Changes"
- O serviço será reiniciado automaticamente

**No Railway/Vercel:**
- Vá em Settings → Environment Variables
- Adicione: `DATABASE_URL` = `sua_connection_string_postgresql`

**Localmente (.env):**
```bash
# Crie arquivo .env na raiz do projeto
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/tikjogos"' > .env
```

#### Passo 2: Criar a Tabela

```bash
npm run db:push
```

Isso criará a tabela `analytics_events` com todos os índices necessários.

#### Passo 3: Reiniciar o Servidor

```bash
npm run dev
```

### Opção 2: Desabilitar Analytics Temporariamente

Se você não quer usar analytics agora, pode desabilitar:

**1. Comentar o middleware em `server/index.ts`:**
```typescript
// app.use(cookieParser());
// app.use(analyticsMiddleware);
```

**2. Remover a seção do AdminDashboard:**
```typescript
// Em client/src/pages/AdminDashboard.tsx
// Comente ou remova a seção:
/*
<Card className="bg-slate-800 border-slate-700">
  <CardHeader>
    <CardTitle className="text-white flex items-center gap-2">
      <BarChart3 className="w-5 h-5" />
      Analytics de Tráfego
    </CardTitle>
  </CardHeader>
  <CardContent>
    <AnalyticsDashboard />
  </CardContent>
</Card>
*/
```

## Verificação

Após configurar, verifique se está funcionando:

### 1. Teste o Cookie
- Abra o site
- Abra DevTools → Application → Cookies
- Verifique se existe cookie `visitor_id`

### 2. Teste a API
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:5000/api/analytics/summary
```

### 3. Verifique o Banco
```sql
-- Conecte no PostgreSQL e execute:
SELECT COUNT(*) FROM analytics_events;
```

## Provedores de Banco Gratuitos

Se você não tem um banco PostgreSQL:

### 1. Neon (Recomendado para Replit/Gitpod)
- Site: https://neon.tech
- Plano gratuito: 0.5 GB
- Serverless (ideal para ambientes efêmeros)

### 2. Supabase
- Site: https://supabase.com
- Plano gratuito: 500 MB
- Interface visual incluída

### 3. Railway
- Site: https://railway.app
- $5 de crédito grátis
- Deploy integrado

### 4. ElephantSQL
- Site: https://www.elephantsql.com
- Plano gratuito: 20 MB
- Simples e rápido

### 5. Render PostgreSQL (Recomendado se já usa Render)
- Site: https://render.com
- Plano gratuito disponível
- Integração perfeita com Web Services do Render
- Connection string automática

## Configuração Específica para Render

Se você já usa Render para deploy, siga estes passos:

### 1. Criar PostgreSQL Database no Render

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - **Name**: tikjogos-db (ou outro nome)
   - **Database**: tikjogos
   - **User**: (gerado automaticamente)
   - **Region**: Escolha a mesma do seu Web Service
   - **Plan**: Free (ou pago se preferir)
4. Clique em "Create Database"
5. Aguarde a criação (1-2 minutos)

### 2. Conectar ao Web Service

1. Vá no seu Web Service (onde o site está rodando)
2. Clique em "Environment"
3. Adicione a variável:
   - **Key**: `DATABASE_URL`
   - **Value**: Copie a "Internal Database URL" do PostgreSQL que você criou
     - Vá no PostgreSQL → "Info" → copie "Internal Database URL"
4. Clique em "Save Changes"
5. O deploy será feito automaticamente

### 3. Executar Migração

Após o deploy, você precisa criar a tabela. Existem duas opções:

**Opção A: Via Render Shell**
1. No Web Service, vá em "Shell"
2. Execute: `npm run db:push`

**Opção B: Localmente (se tiver acesso)**
1. Copie a "External Database URL" do PostgreSQL
2. No seu terminal local:
   ```bash
   DATABASE_URL="sua_external_url" npm run db:push
   ```

### 4. Verificar

1. Acesse seu site no Render
2. Faça login no `/dashadmin`
3. Role até "Analytics de Tráfego"
4. Deve mostrar os dados (inicialmente zerados)

## Exemplo de Connection String

```
postgresql://username:password@host:5432/database?sslmode=require
```

**Componentes:**
- `username`: Seu usuário do banco
- `password`: Sua senha
- `host`: Endereço do servidor (ex: `ep-cool-name-123456.us-east-2.aws.neon.tech`)
- `5432`: Porta padrão do PostgreSQL
- `database`: Nome do banco de dados
- `?sslmode=require`: Obrigatório para conexões remotas

## Troubleshooting

### Erro: "relation analytics_events does not exist"
**Solução:** Execute `npm run db:push`

### Erro: "Database not available"
**Solução:** Verifique se DATABASE_URL está configurado corretamente

### Erro: "ECONNREFUSED"
**Solução:** Verifique se o banco está acessível e a connection string está correta

### Erro: "SSL required"
**Solução:** Adicione `?sslmode=require` no final da connection string

## Suporte

Para mais detalhes, consulte:
- `ANALYTICS_README.md` - Documentação completa
- `.ona/specs/analytics-trafego/` - Especificações técnicas
