# Teste do Fluxo da Galeria

## Mudanças Implementadas

### 1. CommunityThemes.tsx
- Modificado `handlePlayTheme` para:
  - Armazenar `selectedThemeId`, `selectedThemeCode` e `autoStartGame` no sessionStorage
  - Redirecionar para a página principal
  - Mostrar toast "Iniciando jogo!"

### 2. ImpostorGame.tsx - HomeScreen
- Adicionado useEffect para detectar `autoStartGame` no sessionStorage
- Se detectado e usuário tem nickname salvo:
  - Cria sala automaticamente
  - Mostra toast "Criando sala..."

### 3. ImpostorGame.tsx - ModeSelectScreen
- Adicionado useEffect para auto-selecionar modo "palavraComunidade"
- Modificado useEffect existente para:
  - Detectar tema selecionado da galeria
  - Auto-iniciar jogo se `autoStart === 'true'` e usuário é host
  - Limpar sessionStorage após iniciar

## Fluxo Esperado

1. Usuário clica em "JOGAR" na galeria de temas
2. Sistema armazena dados no sessionStorage e redireciona para "/"
3. Se usuário tem nickname salvo:
   - Cria sala automaticamente
   - Seleciona modo "palavraComunidade"
   - Carrega tema selecionado
   - Inicia jogo automaticamente
4. Se usuário não tem nickname salvo:
   - Mostra mensagem para digitar nome
   - Limpa flag autoStartGame

## Testes Necessários

- [ ] Clicar em "JOGAR" na galeria com nickname salvo
- [ ] Clicar em "JOGAR" na galeria sem nickname salvo
- [ ] Verificar se o jogo inicia com o tema correto
- [ ] Verificar se sessionStorage é limpo após iniciar
