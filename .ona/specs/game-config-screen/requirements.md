# Requirements Document

## Introduction

Este documento descreve os requisitos para implementar uma tela de configuração de partida no jogo Impostor Online. A tela será exibida após o host selecionar o modo de jogo e clicar em "INICIAR PARTIDA", mas antes da revelação das funções dos jogadores (tripulante/impostor). Esta funcionalidade será aplicada APENAS ao modo online do jogo.

A tela permitirá que o host configure:
- Quantidade de impostores na partida
- Sistema de dicas para o impostor (ativado/desativado)
- Restrição de dica apenas se o impostor for o primeiro a falar

O design e CSS devem seguir o mesmo padrão visual já utilizado na tela do lobby online, mantendo a consistência da interface.

## Requirements

### Requirement 1: Adicionar novo status de jogo para configuração

**User Story:** Como desenvolvedor, quero adicionar um novo status de jogo chamado 'gameConfig' no fluxo do jogo, para que a tela de configuração seja exibida entre a seleção de modo e o início da partida.

#### Acceptance Criteria

1. WHEN o sistema gerencia os status do jogo THEN SHALL incluir um novo status 'gameConfig' no tipo GameStatus
2. WHEN o host clica em "INICIAR PARTIDA" na ModeSelectScreen THEN o sistema SHALL navegar para o status 'gameConfig' ao invés de iniciar o jogo diretamente
3. WHEN o sistema está no status 'gameConfig' THEN SHALL exibir o componente GameConfigScreen
4. WHEN o host confirma as configurações THEN o sistema SHALL iniciar o jogo com as configurações selecionadas

### Requirement 2: Criar componente GameConfigScreen com design consistente

**User Story:** Como host da partida, quero visualizar uma tela de configuração com o mesmo design do lobby, para que a experiência visual seja consistente.

#### Acceptance Criteria

1. WHEN o componente GameConfigScreen é renderizado THEN SHALL utilizar as mesmas classes CSS e padrões de design da tela de lobby online
2. WHEN o componente é exibido THEN SHALL mostrar um cabeçalho com ícone de configuração e título "Configuração da Partida"
3. WHEN o componente é renderizado THEN SHALL utilizar o mesmo esquema de cores (background #1C202C, cards com bg-slate-900/80, etc.)
4. WHEN o componente é exibido THEN SHALL incluir elementos decorativos de background consistentes com o lobby
5. WHEN o componente é renderizado THEN SHALL ser responsivo e funcionar em dispositivos móveis

### Requirement 3: Implementar controle de quantidade de impostores

**User Story:** Como host da partida, quero configurar a quantidade de impostores, para que eu possa ajustar a dificuldade do jogo.

#### Acceptance Criteria

1. WHEN o GameConfigScreen é exibido THEN SHALL mostrar um controle contador para "Quantidade de Impostores"
2. WHEN o contador é exibido THEN SHALL ter valor inicial de 1 impostor
3. WHEN o host clica no botão "-" THEN o sistema SHALL decrementar o valor até o mínimo de 1
4. WHEN o host clica no botão "+" THEN o sistema SHALL incrementar o valor até o máximo de 5
5. WHEN o valor está no mínimo (1) THEN o botão "-" SHALL estar desabilitado
6. WHEN o valor está no máximo (5) THEN o botão "+" SHALL estar desabilitado
7. WHEN o contador é exibido THEN SHALL incluir um ícone AlertTriangle para identificação visual

### Requirement 4: Implementar toggle de dicas para impostor

**User Story:** Como host da partida, quero ativar ou desativar o sistema de dicas para o impostor, para que eu possa controlar o nível de dificuldade.

#### Acceptance Criteria

1. WHEN o GameConfigScreen é exibido THEN SHALL mostrar um toggle switch para "Dica para o Impostor"
2. WHEN o toggle é exibido THEN SHALL estar ativado por padrão (enableHints = true)
3. WHEN o host clica no toggle THEN o sistema SHALL alternar entre ativado e desativado
4. WHEN o toggle está ativado THEN SHALL exibir cor indigo (bg-indigo-600) e ícone de check
5. WHEN o toggle está desativado THEN SHALL exibir cor cinza (bg-slate-600) e ícone de X
6. WHEN o toggle é exibido THEN SHALL incluir um sublabel explicativo: "O impostor recebe uma pista vaga sobre a palavra."

### Requirement 5: Implementar toggle de dica apenas para primeiro jogador

**User Story:** Como host da partida, quero configurar se a dica só será dada ao impostor quando ele for o primeiro a falar, para aumentar a dificuldade do jogo.

#### Acceptance Criteria

1. WHEN o GameConfigScreen é exibido THEN SHALL mostrar um toggle switch para "Dica Apenas se for o Primeiro"
2. WHEN o toggle é exibido THEN SHALL estar desativado por padrão (firstPlayerHintOnly = false)
3. WHEN o sistema de dicas está desativado THEN este toggle SHALL estar desabilitado e com opacidade reduzida
4. WHEN o sistema de dicas está ativado THEN este toggle SHALL estar habilitado e funcional
5. WHEN o host clica no toggle habilitado THEN o sistema SHALL alternar entre ativado e desativado
6. WHEN o toggle é exibido THEN SHALL incluir um sublabel explicativo: "Aumenta a dificuldade. Se o impostor não for o primeiro a falar, ele não recebe dica."

### Requirement 6: Exibir resumo visual das configurações

**User Story:** Como host da partida, quero ver um resumo das configurações selecionadas, para que eu possa confirmar minhas escolhas antes de iniciar.

#### Acceptance Criteria

1. WHEN o GameConfigScreen é exibido THEN SHALL mostrar uma caixa de resumo com as configurações atuais
2. WHEN a quantidade de impostores é alterada THEN o resumo SHALL atualizar dinamicamente mostrando "Haverá X impostor(es) nesta rodada"
3. WHEN o sistema de dicas está desativado THEN o resumo SHALL mostrar "O impostor jogará sem dicas (Modo Hardcore)"
4. WHEN o sistema de dicas está ativado E firstPlayerHintOnly está desativado THEN o resumo SHALL mostrar "O impostor terá acesso à dica"
5. WHEN o sistema de dicas está ativado E firstPlayerHintOnly está ativado THEN o resumo SHALL mostrar "O impostor só terá dica se começar a rodada"
6. WHEN o resumo é exibido THEN SHALL incluir um ícone Info e usar cores destacadas para valores importantes (ex: text-red-400 para número de impostores)

### Requirement 7: Implementar botão de iniciar partida com configurações

**User Story:** Como host da partida, quero clicar em um botão para iniciar a partida com as configurações escolhidas, para que o jogo comece com as regras definidas.

#### Acceptance Criteria

1. WHEN o GameConfigScreen é exibido THEN SHALL mostrar um botão "INICIAR PARTIDA" com ícone de Play
2. WHEN o host clica no botão THEN o sistema SHALL coletar todas as configurações (impostorCount, enableHints, firstPlayerHintOnly)
3. WHEN o host clica no botão THEN o sistema SHALL enviar as configurações para o backend via API
4. WHEN o host clica no botão THEN o sistema SHALL iniciar o jogo normalmente após enviar as configurações
5. WHEN o botão é exibido THEN SHALL usar gradiente verde (from-green-500 to-emerald-500) consistente com o botão do ModeSelectScreen
6. WHEN o botão é exibido THEN SHALL incluir animação de bounce no ícone Play

### Requirement 8: Integrar configurações com o backend

**User Story:** Como sistema, quero enviar as configurações da partida para o backend, para que as regras sejam aplicadas durante o jogo.

#### Acceptance Criteria

1. WHEN o host confirma as configurações THEN o sistema SHALL incluir os parâmetros no body da requisição POST /api/rooms/{code}/start
2. WHEN a requisição é enviada THEN SHALL incluir o campo "gameConfig" com os valores: impostorCount, enableHints, firstPlayerHintOnly
3. WHEN enableHints é false THEN o campo firstPlayerHintOnly SHALL ser enviado como false independente do valor selecionado
4. WHEN a requisição é bem-sucedida THEN o sistema SHALL prosseguir com o fluxo normal do jogo
5. WHEN a requisição falha THEN o sistema SHALL exibir mensagem de erro apropriada

### Requirement 9: Aplicar configurações apenas ao modo online

**User Story:** Como desenvolvedor, quero garantir que a tela de configuração seja exibida apenas no modo online, para que o modo local não seja afetado.

#### Acceptance Criteria

1. WHEN o jogo está no modo local (ModoLocal.tsx ou ModoLocalJogo.tsx) THEN o sistema SHALL NOT exibir o GameConfigScreen
2. WHEN o jogo está no modo online (ImpostorGame.tsx) THEN o sistema SHALL exibir o GameConfigScreen após seleção de modo
3. WHEN o fluxo é do modo local THEN o sistema SHALL manter o comportamento atual sem alterações
4. WHEN o fluxo é do modo online THEN o sistema SHALL incluir o novo status 'gameConfig' no fluxo

### Requirement 10: Implementar botão de voltar

**User Story:** Como host da partida, quero poder voltar para a tela de seleção de modo, para que eu possa mudar o modo escolhido antes de iniciar.

#### Acceptance Criteria

1. WHEN o GameConfigScreen é exibido THEN SHALL mostrar um botão "Voltar" ou ícone de seta
2. WHEN o host clica no botão voltar THEN o sistema SHALL retornar ao status 'modeSelect'
3. WHEN o sistema retorna ao modeSelect THEN SHALL manter o modo previamente selecionado
4. WHEN o botão é exibido THEN SHALL seguir o mesmo padrão visual dos botões secundários do lobby

### Requirement 11: Utilizar lista de palavras e dicas existente

**User Story:** Como sistema, quero utilizar a lista de palavras e dicas já existente no jogo, para que as dicas sejam exibidas corretamente ao impostor.

#### Acceptance Criteria

1. WHEN o sistema precisa de uma dica para o impostor THEN SHALL utilizar a lista de palavras fornecida (ex: Cadeira → Pernas, Mesa → Tampo, etc.)
2. WHEN uma palavra é sorteada THEN o sistema SHALL buscar a dica correspondente na lista
3. WHEN enableHints é true THEN o impostor SHALL receber a dica correspondente à palavra sorteada
4. WHEN enableHints é false THEN o impostor SHALL NOT receber nenhuma dica
5. WHEN firstPlayerHintOnly é true E o impostor não é o primeiro THEN o impostor SHALL NOT receber a dica mesmo com enableHints ativado

### Requirement 12: Persistir configurações durante a sessão

**User Story:** Como host da partida, quero que minhas configurações sejam mantidas se eu voltar para a tela de configuração, para que eu não precise reconfigurar tudo novamente.

#### Acceptance Criteria

1. WHEN o host configura os valores e volta para modeSelect THEN o sistema SHALL manter os valores no estado
2. WHEN o host retorna ao GameConfigScreen THEN SHALL exibir os valores previamente configurados
3. WHEN uma nova partida é iniciada THEN o sistema SHALL resetar as configurações para os valores padrão
4. WHEN o host sai da sala THEN o sistema SHALL limpar as configurações armazenadas
