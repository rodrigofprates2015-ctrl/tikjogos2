# Fix: SSL/TLS Required no Render PostgreSQL

## ❌ Erro Atual:
```
SSL/TLS required
```

## ✅ Solução: Adicionar Parâmetro SSL

O Render PostgreSQL requer conexão SSL. Você precisa adicionar `?sslmode=require` no final da URL.

## 🔧 URL Corrigida:

### Antes (sem SSL):
```
postgresql://tikjogos_db_user:Pot5AKexb4lEKnI3MUqZEYU2xX4MfrKK@dpg-d5h0p2t6ubrc73flm1q0-a.oregon-postgres.render.com:5432/tikjogos_db
```

### Depois (com SSL):
```
postgresql://tikjogos_db_user:Pot5AKexb4lEKnI3MUqZEYU2xX4MfrKK@dpg-d5h0p2t6ubrc73flm1q0-a.oregon-postgres.render.com:5432/tikjogos_db?sslmode=require
                                                                                                                                                    ^^^^^^^^^^^^^^^^^^
                                                                                                                                                    ADICIONE ISSO
```

## 📝 Passo a Passo:

1. **Vá no Render Dashboard**
2. **Web Service → Environment**
3. **Edite DATABASE_URL**
4. **Cole esta URL completa:**
   ```
   postgresql://tikjogos_db_user:Pot5AKexb4lEKnI3MUqZEYU2xX4MfrKK@dpg-d5h0p2t6ubrc73flm1q0-a.oregon-postgres.render.com:5432/tikjogos_db?sslmode=require
   ```
5. **Save Changes**
6. **Aguarde redeploy** (2-3 minutos)

## 🧪 Depois do Redeploy:

### Criar a Tabela via Shell:
1. Web Service → **Shell**
2. Execute:
   ```bash
   npm run db:push
   ```

### OU Criar via Query no PostgreSQL:
1. Databases → tikjogos_db → **Query**
2. Cole:
   ```sql
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

   CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
   CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
   CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
   ```
3. Execute

## ✅ Testar:

1. Acesse seu site
2. Vá em `/dashadmin`
3. Faça login
4. Veja "Analytics de Tráfego"
5. Deve funcionar! 🎉

## 🔍 Outros Modos SSL (se `require` não funcionar):

Se por algum motivo `sslmode=require` não funcionar, tente estas alternativas:

### Opção 1: disable (não recomendado, mas funciona):
```
?sslmode=disable
```

### Opção 2: prefer:
```
?sslmode=prefer
```

### Opção 3: verify-ca:
```
?sslmode=verify-ca
```

### Opção 4: verify-full:
```
?sslmode=verify-full
```

## 📚 Formato Completo da URL:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?PARAMETROS
          └────┬────┘ └──┬──┘ └─┬─┘ └──┬──┘ └───┬───┘
               │         │      │      │        │
               │         │      │      │        └─ Parâmetros (SSL, etc)
               │         │      │      └────────── Nome do banco
               │         │      └───────────────── Porta (5432)
               │         └──────────────────────── Host completo
               └────────────────────────────────── Credenciais
```

## 🎯 Resumo:

**URL Final Completa:**
```
postgresql://tikjogos_db_user:Pot5AKexb4lEKnI3MUqZEYU2xX4MfrKK@dpg-d5h0p2t6ubrc73flm1q0-a.oregon-postgres.render.com:5432/tikjogos_db?sslmode=require
```

**Copie e cole no DATABASE_URL do seu Web Service!** ✨
