# 🧪 Guia de Teste - Analytics Corrigido

## ✅ Correções Implementadas:

### 1. Visitantes Únicos Verificados no Banco
**Antes**: Cache em memória (resetava a cada redeploy)
**Agora**: Consulta no banco PostgreSQL
```sql
SELECT * FROM analytics_events 
WHERE visitor_id = 'xxx' AND event_type = 'unique_visitor'
```
Se já existe → NÃO registra novamente ✅

### 2. Debounce de 2 Segundos
**Antes**: Requisições duplicadas contavam
**Agora**: Mesma página + mesmo visitante em < 2s = IGNORADO ✅

### 3. Mais Filtros
Agora ignora:
- `/api/*` (todas as APIs)
- Assets (`.js`, `.css`, `.png`, etc)
- `/favicon.ico`
- `/manifest.json`
- `/robots.txt`
- `/sitemap.xml`

## 🧹 Banco Limpo
- ✅ Removidos 146 registros antigos
- ✅ Começando do zero com lógica correta

## 📋 Como Testar (Passo a Passo):

### Preparação:
1. **Aguarde 2-3 minutos** (redeploy no Render)
2. **Limpe cookies**: DevTools → Application → Cookies → Delete All
3. **Feche todas as abas** do seu site

### Teste 1: Primeiro Acesso
```
1. Abra o site (home)
2. Vá em /dashadmin
3. Veja Analytics

ESPERADO:
✅ Visitantes Únicos: 1
✅ Pageviews: 2 (home + dashadmin)
```

### Teste 2: F5 na Home (5 vezes)
```
1. Volte para a home
2. Aperte F5 cinco vezes (aguarde 1s entre cada)
3. Vá em /dashadmin
4. Veja Analytics

ESPERADO:
✅ Visitantes Únicos: 1 (não mudou!)
✅ Pageviews: 7 ou 8 (2 anteriores + 5 F5 + dashadmin)
```

### Teste 3: F5 Rápido (Debounce)
```
1. Na home, aperte F5 rapidamente 10 vezes seguidas
2. Vá em /dashadmin
3. Veja Analytics

ESPERADO:
✅ Visitantes Únicos: 1 (não mudou!)
✅ Pageviews: Aumentou apenas 1 ou 2 (debounce funcionou!)
```

### Teste 4: Novo Visitante (Aba Anônima)
```
1. Abra aba anônima/privada
2. Acesse o site
3. Na aba normal, vá em /dashadmin
4. Veja Analytics

ESPERADO:
✅ Visitantes Únicos: 2 (novo visitante!)
✅ Pageviews: +1 (acesso da aba anônima)
```

### Teste 5: Verificar Cookie
```
DevTools → Application → Cookies → visitor_id

ESPERADO:
✅ Cookie existe
✅ Valor é um UUID (ex: 550e8400-e29b-41d4-a716-446655440000)
✅ Expires: daqui a ~365 dias
✅ Persiste após F5
```

## 🔍 Verificar Logs no Render:

Render → Web Service → Logs

Procure por:
```
[Analytics] Tracking: GET /
[Analytics] Visitor: 12345678... | New: false | ExistsInDB: true | WillTrackUnique: false
[Analytics] → Registering PAGEVIEW for 12345678...
```

**Interpretação**:
- `New: false` = Cookie já existia
- `ExistsInDB: true` = Já tem unique_visitor no banco
- `WillTrackUnique: false` = NÃO vai registrar unique_visitor ✅
- Registra apenas PAGEVIEW ✅

Se der F5 rápido, deve aparecer:
```
[Analytics] ⏭️  SKIPPED (debounce): / for 12345678... (500ms ago)
```

## 📊 Números Esperados:

### Cenário Real (1 pessoa testando):
| Ação | Visitantes Únicos | Pageviews |
|------|-------------------|-----------|
| Acessa home | 1 | 1 |
| Vai em /dashadmin | 1 | 2 |
| F5 na home 5x | 1 | 7 |
| Vai em /comojogar | 1 | 8 |
| F5 rápido 10x | 1 | 8 ou 9 (debounce) |

### Cenário Real (3 pessoas diferentes):
| Ação | Visitantes Únicos | Pageviews |
|------|-------------------|-----------|
| Pessoa A acessa | 1 | 1 |
| Pessoa B acessa | 2 | 2 |
| Pessoa C acessa | 3 | 3 |
| Pessoa A F5 5x | 3 | 8 |
| Pessoa B navega 3 páginas | 3 | 11 |

## ❌ Se Ainda Houver Problemas:

### Problema: Visitantes únicos ainda sobem
**Debug**:
1. Veja os logs: procure por `ExistsInDB: false` quando deveria ser `true`
2. Verifique se o cookie persiste: DevTools → Cookies
3. Confirme que DATABASE_URL está correto no Render

**Solução**:
```bash
# Verificar no banco:
SELECT visitor_id, event_type, COUNT(*) 
FROM analytics_events 
GROUP BY visitor_id, event_type 
ORDER BY visitor_id;

# Deve mostrar apenas 1 unique_visitor por visitor_id
```

### Problema: Pageviews sobem muito
**Debug**:
1. Veja os logs: procure por múltiplos `[Analytics] Tracking:`
2. Verifique se há requisições duplicadas
3. Confirme que debounce está funcionando (procure por `SKIPPED`)

**Solução**:
- Aumente DEBOUNCE_MS de 2000 para 5000 (5 segundos)
- Adicione mais paths no IGNORE_PATHS

### Problema: Nada é registrado
**Debug**:
1. Veja os logs: procure por erros `[Analytics] Failed to track`
2. Verifique DATABASE_URL
3. Confirme que a tabela existe

**Solução**:
```bash
node create-analytics-table.js
```

## 🎯 Checklist Final:

Após o redeploy, confirme:
- [ ] Cookie `visitor_id` é criado
- [ ] Cookie persiste após F5
- [ ] Visitantes únicos = 1 após múltiplos F5
- [ ] Pageviews aumenta a cada acesso real
- [ ] F5 rápido não duplica (debounce)
- [ ] Aba anônima cria novo visitante
- [ ] Logs mostram `ExistsInDB: true` para visitantes existentes
- [ ] Logs mostram `SKIPPED (debounce)` para F5 rápido

## 📞 Reporte:

Depois de testar, me diga:
1. ✅ ou ❌ Visitantes únicos ficou em 1 após F5?
2. ✅ ou ❌ Pageviews aumentou corretamente?
3. ✅ ou ❌ Debounce funcionou (F5 rápido)?
4. 📋 Cole os logs do Render (linhas com [Analytics])

---

**Boa sorte nos testes!** 🚀
