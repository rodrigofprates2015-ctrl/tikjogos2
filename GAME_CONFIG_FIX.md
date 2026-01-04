# Correção das Configurações de Partida

## Problema Identificado

As configurações selecionadas na tela de lobby (número de impostores e sistema de dicas) não estavam sendo aplicadas corretamente durante a partida.

## Mudanças Realizadas

### Backend (`server/routes.ts`)

1. **Suporte a múltiplos impostores**:
   - O backend já criava o array `impostorIds` mas não estava garantindo que fosse sempre populado
   - Adicionado fallback para garantir que `impostorIds` seja sempre definido, mesmo quando `gameConfig` não é fornecido

2. **Sistema de dicas**:
   - Dicas são adicionadas ao `gameData.hint` quando:
     - `gameConfig.enableHints` é `true`
     - Modo é `palavraSecreta` (clássico)
     - Não é tema customizado (usa palavras do banco de dados)
   - A lógica de `firstPlayerHintOnly` é tratada no frontend baseado na ordem de fala

### Frontend (`client/src/pages/ImpostorGame.tsx`)

1. **Detecção de impostores**:
   - Atualizado para verificar tanto `room.impostorId` (compatibilidade) quanto `room.gameData.impostorIds` (múltiplos impostores)
   - Aplicado em 3 locais:
     - Tela principal do jogo
     - Tela de Perguntas Diferentes
     - Renderização de conteúdo do impostor

2. **Exibição de dicas**:
   - Implementada lógica condicional baseada em `gameConfig`:
     - Se `enableHints` é `false`: Mostra "Modo Hardcore! Você não tem dica."
     - Se `firstPlayerHintOnly` é `true`: Verifica se o impostor é o primeiro na ordem de fala
     - Se impostor não é o primeiro: Mostra "Você não é o primeiro a falar, então não tem dica!"
     - Caso contrário: Mostra a dica normalmente

3. **Resultados da votação**:
   - Atualizado para mostrar todos os impostores quando há múltiplos
   - Texto adaptado: "O impostor era" vs "Os impostores eram"
   - Vitória adaptada: "Impostor Venceu!" vs "Impostores Venceram!"
   - Contagem de votos considera todos os impostores

## Fluxo Completo

1. **Configuração no Lobby**:
   - Host abre modal de configurações
   - Seleciona número de impostores (1-5)
   - Ativa/desativa dicas
   - Se dicas ativadas, pode ativar "Dica apenas se for o primeiro"
   - Configurações são salvas no `gameStore`

2. **Início da Partida**:
   - Frontend envia `gameConfig` para o backend via `startGameWithConfig`
   - Backend valida número de impostores vs número de jogadores
   - Backend seleciona impostores aleatoriamente
   - Backend busca dica do banco de dados (arquivo `palavras-dicas`)
   - Backend adiciona dica ao `gameData` se condições forem atendidas

3. **Durante a Partida**:
   - Frontend verifica se jogador é impostor usando `impostorIds`
   - Se impostor, verifica configurações de dica:
     - Sem dicas: Mostra mensagem de modo hardcore
     - Com dicas + primeiro apenas: Verifica ordem de fala
     - Com dicas: Mostra dica normalmente
   - Tripulação vê a palavra normalmente

4. **Resultado**:
   - Mostra todos os impostores
   - Conta votos para qualquer impostor
   - Determina vitória baseado em votos totais

## Banco de Dados de Dicas

O arquivo `palavras-dicas` contém 100 palavras com suas respectivas dicas no formato:
```
Palavra\tDica
```

Exemplos:
- Cadeira → Pernas
- Mesa → Tampo
- Sofá → Braços

Essas dicas são carregadas no backend no objeto `WORD_HINTS` e usadas quando o modo clássico é jogado com dicas ativadas.

## Compatibilidade

- Mantida compatibilidade com partidas antigas que usam apenas `room.impostorId`
- Se `impostorIds` não existir, usa `impostorId` como fallback
- Configurações padrão aplicadas quando `gameConfig` não é fornecido
