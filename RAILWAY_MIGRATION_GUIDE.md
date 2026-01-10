# Guia: Criar Tabela Analytics no Railway

## Seu DATABASE_URL
```
postgresql://postgres:IVfFtDzsEdYIGpuxccTExvakRWcWmMLM@caboose.proxy.rlwy.net:24014/railway
```

## Opção 1: Via Railway Dashboard (Mais Fácil)

### Passo 1: Acessar o PostgreSQL no Railway
1. Acesse https://railway.app
2. Vá no seu projeto
3. Clique no serviço **PostgreSQL**
4. Clique na aba **"Data"** ou **"Query"**

### Passo 2: Executar o SQL
Copie e cole este SQL no editor de queries:

```sql
-- Criar tabela analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  page_path VARCHAR(500),
  referrer VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
```

### Passo 3: Executar
- Clique em **"Run"** ou **"Execute"**
- Deve aparecer "Query executed successfully"

### Passo 4: Verificar
Execute esta query para confirmar:
```sql
SELECT COUNT(*) FROM analytics_events;
```
Deve retornar `0` (tabela vazia, mas criada)

---

## Opção 2: Via psql (Linha de Comando)

Se você tem `psql` instalado:

```bash
psql "postgresql://postgres:IVfFtDzsEdYIGpuxccTExvakRWcWmMLM@caboose.proxy.rlwy.net:24014/railway" -f analytics_migration.sql
```

---

## Opção 3: Via DBeaver / TablePlus / pgAdmin

1. Abra seu cliente SQL favorito
2. Crie nova conexão com estes dados:
   - **Host**: caboose.proxy.rlwy.net
   - **Port**: 24014
   - **Database**: railway
   - **User**: postgres
   - **Password**: IVfFtDzsEdYIGpuxccTExvakRWcWmMLM
3. Conecte
4. Execute o SQL do arquivo `analytics_migration.sql`

---

## Opção 4: Via Render Shell (Se seu site está no Render)

1. Vá no seu Web Service no Render
2. Clique em **"Shell"** no menu lateral
3. Execute:
```bash
npm run db:push
```

**Nota**: Isso só funciona se a variável `DATABASE_URL` estiver configurada no Render.

---

## Verificação Final

Após executar a migração, teste no seu site:

1. Acesse seu site (ex: https://seusite.onrender.com)
2. Vá em `/dashadmin`
3. Faça login com suas credenciais de admin
4. Role até a seção **"Analytics de Tráfego"**
5. Deve mostrar:
   - Total de Pageviews: 0
   - Visitantes Únicos: 0
   - Gráficos vazios (normal, ainda não há dados)

## Começar a Coletar Dados

Após a tabela estar criada:
1. Navegue pelo site normalmente
2. Abra DevTools → Application → Cookies
3. Verifique se existe cookie `visitor_id`
4. Volte ao `/dashadmin` após alguns minutos
5. Os números devem começar a aparecer!

## Troubleshooting

### "relation analytics_events does not exist"
**Solução**: A tabela não foi criada. Execute o SQL novamente.

### "Connection terminated unexpectedly"
**Solução**: 
- Verifique se o banco Railway ainda está ativo
- Confirme que a connection string está correta
- Tente acessar via Railway Dashboard

### "Erro 401: Não autorizado"
**Solução**: Faça logout e login novamente no `/dashadmin`

### Números não aparecem
**Solução**:
1. Verifique se o cookie `visitor_id` está sendo criado
2. Confirme que `DATABASE_URL` está no Render
3. Verifique logs do servidor para erros

## Suporte

Se precisar de ajuda:
1. Verifique os logs do servidor
2. Consulte `ANALYTICS_README.md`
3. Verifique se a tabela existe: `\dt analytics_events` no psql
