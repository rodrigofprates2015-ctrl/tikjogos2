# Implementation Plan

- [ ] 1. Atualizar tipos no gameStore
  - Adicionar tipo GameConfig com campos impostorCount, enableHints, firstPlayerHintOnly
  - Adicionar 'gameConfig' ao tipo GameStatus
  - Adicionar gameConfig ao GameState
  - Adicionar métodos goToGameConfig, backToModeSelect, startGameWithConfig
  - _Requirements: 1.1, 1.2, 8.2_

- [ ] 2. Implementar métodos no gameStore
  - Implementar goToGameConfig() que muda status para 'gameConfig'
  - Implementar backToModeSelect() que muda status para 'modeSelect'
  - Implementar startGameWithConfig() que envia config para API
  - Modificar método startGame existente para aceitar config opcional
  - _Requirements: 1.3, 1.4, 8.1, 8.2, 8.3_

- [ ] 3. Criar componente CounterControl
  - Criar componente com props label, value, onChange, min, max, icon
  - Implementar botões de incremento/decremento com estilos do lobby
  - Adicionar estados disabled para min/max
  - Aplicar estilos: bg-slate-800, rounded-3xl, border-4, gradiente laranja no botão +
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 4. Criar componente ToggleSwitch
  - Criar componente com props label, subLabel, checked, onChange, disabled
  - Implementar switch animado com ícones Check/X
  - Adicionar estados ativo (verde) e inativo (cinza)
  - Aplicar estilos consistentes com lobby
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 5. Criar componente GameConfigScreen - estrutura base
  - Criar componente funcional GameConfigScreen
  - Adicionar elementos decorativos de fundo (círculos blur)
  - Criar container principal com bg-[#242642], rounded-[3rem], border-4
  - Adicionar header com botão voltar e título "Configuração da Partida"
  - Verificar se usuário é host
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.3, 10.4_

- [ ] 6. Adicionar estado local no GameConfigScreen
  - Criar useState para impostorCount (inicial: 1)
  - Criar useState para enableHints (inicial: true)
  - Criar useState para firstPlayerHintOnly (inicial: false)
  - Criar useState para isStarting (inicial: false)
  - Adicionar lógica para desabilitar firstPlayerHintOnly quando enableHints é false
  - _Requirements: 3.2, 4.2, 5.2, 12.1, 12.2_

- [ ] 7. Integrar CounterControl no GameConfigScreen
  - Adicionar CounterControl para quantidade de impostores
  - Configurar min=1, max=5
  - Adicionar ícone AlertTriangle
  - Conectar com estado impostorCount
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 8. Integrar ToggleSwitches no GameConfigScreen
  - Adicionar ToggleSwitch para "Dica para o Impostor"
  - Adicionar sublabel explicativo
  - Adicionar ToggleSwitch para "Dica Apenas se for o Primeiro"
  - Configurar disabled baseado em enableHints
  - Adicionar seção com título "Sistema de Dicas"
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 9. Criar componente de resumo visual
  - Criar card de resumo com bg-slate-950/50, border-slate-800/50
  - Adicionar ícone Info
  - Mostrar quantidade de impostores com destaque (text-red-400)
  - Mostrar status do sistema de dicas dinamicamente
  - Atualizar texto baseado em enableHints e firstPlayerHintOnly
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 10. Implementar botão "INICIAR PARTIDA"
  - Criar botão com gradiente verde (from-green-500 to-emerald-500)
  - Adicionar ícone Play com animação bounce
  - Implementar função handleStartGame
  - Coletar configurações (impostorCount, enableHints, firstPlayerHintOnly)
  - Chamar startGameWithConfig do store
  - Adicionar loading state
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 11. Modificar ModeSelectScreen para navegar para gameConfig
  - Alterar handleStartGameWithSorteio para chamar goToGameConfig ao invés de startGame
  - Manter lógica de validação (tema selecionado, etc)
  - Preservar selectedThemeCode e selectedCategory no estado
  - _Requirements: 1.2, 9.2_

- [ ] 12. Adicionar renderização condicional no ImpostorGame
  - Adicionar {status === 'gameConfig' && <GameConfigScreen />} no render
  - Posicionar entre modeSelect e playing
  - _Requirements: 1.3, 9.2_

- [ ] 13. Atualizar backend para receber gameConfig
  - Modificar endpoint POST /api/rooms/{code}/start para aceitar gameConfig
  - Validar impostorCount (1-5, menor que número de jogadores)
  - Armazenar configurações no room
  - Aplicar lógica de dicas baseado nas configurações
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 14. Implementar lógica de dicas no backend
  - Criar/atualizar lista de palavras com dicas correspondentes
  - Ao sortear palavra, buscar dica correspondente
  - Se enableHints é false, não enviar dica ao impostor
  - Se firstPlayerHintOnly é true, verificar se impostor é primeiro jogador
  - Enviar dica apenas se condições forem atendidas
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 15. Adicionar validação de jogadores insuficientes
  - Verificar se número de jogadores > impostorCount
  - Mostrar toast de erro se insuficiente
  - Desabilitar botão iniciar se necessário
  - _Requirements: 8.4_

- [ ] 16. Implementar persistência de configurações durante sessão
  - Manter valores ao voltar para modeSelect
  - Resetar ao iniciar nova partida
  - Limpar ao sair da sala
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 17. Testar fluxo completo
  - Testar navegação: lobby → modeSelect → gameConfig → playing
  - Testar botão voltar: gameConfig → modeSelect
  - Testar todas as configurações
  - Verificar que dicas funcionam conforme configurado
  - Testar responsividade mobile/desktop
  - _Requirements: Todos_
