# Checklist de Testes - Melhorias da Galeria

## Testes Funcionais

### Fluxo Normal (Sem Galeria)
- [ ] Criar sala manualmente funciona
- [ ] Entrar em sala com código funciona
- [ ] Selecionar modo "palavraComunidade" manualmente funciona
- [ ] Selecionar tema da lista funciona
- [ ] Iniciar jogo manualmente funciona
- [ ] Outros modos de jogo continuam funcionando

### Fluxo da Galeria - COM Nickname Salvo
- [ ] Acessar `/criar-tema` (galeria)
- [ ] Clicar em "JOGAR" em um tema
- [ ] Verificar redirecionamento para "/"
- [ ] Verificar criação automática da sala
- [ ] Verificar seleção automática do modo "palavraComunidade"
- [ ] Verificar carregamento do tema correto
- [ ] Verificar início automático do jogo
- [ ] Verificar que o jogo iniciou com o tema correto
- [ ] Verificar limpeza do sessionStorage

### Fluxo da Galeria - SEM Nickname Salvo
- [ ] Limpar nickname salvo
- [ ] Acessar `/criar-tema` (galeria)
- [ ] Clicar em "JOGAR" em um tema
- [ ] Verificar redirecionamento para "/"
- [ ] Verificar mensagem pedindo para digitar nome
- [ ] Verificar que não criou sala automaticamente
- [ ] Criar sala manualmente
- [ ] Verificar se tema foi selecionado automaticamente

### Testes de Edge Cases
- [ ] Clicar em "JOGAR" e voltar antes de criar sala
- [ ] Clicar em "JOGAR" em múltiplos temas rapidamente
- [ ] Clicar em "JOGAR" e fechar o navegador
- [ ] Clicar em "JOGAR" com sala já criada
- [ ] Verificar comportamento em modo incógnito

### Testes de UI/UX
- [ ] Toast "Iniciando jogo!" aparece corretamente
- [ ] Toast "Criando sala..." aparece corretamente
- [ ] Transições são suaves
- [ ] Não há flickers ou recarregamentos visíveis
- [ ] Botão "JOGAR" tem feedback visual adequado

### Testes de Compatibilidade
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Testes de Regressão

### Funcionalidades Existentes
- [ ] Criar tema personalizado funciona
- [ ] Pagamento de tema funciona
- [ ] Busca na galeria funciona
- [ ] Filtros (Trending, Novos, Popular) funcionam
- [ ] Estatísticas dos temas são exibidas
- [ ] Chat do lobby funciona
- [ ] Sistema de votação funciona
- [ ] Todos os modos de jogo funcionam

## Bugs Conhecidos a Verificar

- [ ] SessionStorage não é limpo em alguns casos
- [ ] Auto-start pode falhar se sala não carregar rápido
- [ ] Possível race condition entre auto-select e auto-start

## Performance

- [ ] Tempo de carregamento da galeria
- [ ] Tempo de criação de sala
- [ ] Tempo total do fluxo (clique até jogo iniciado)
- [ ] Uso de memória (sessionStorage)

## Segurança

- [ ] Validação de tema existe antes de iniciar
- [ ] Validação de código de acesso
- [ ] Não expor dados sensíveis no sessionStorage
- [ ] Limpeza adequada de dados temporários

---

## Resultados

**Data do Teste**: ___________
**Testador**: ___________
**Ambiente**: ___________

**Bugs Encontrados**:
1. 
2. 
3. 

**Observações**:
