# Requirements Document

## Introduction

Este documento descreve os requisitos para implementar um sistema de Analytics de Tráfego no dashboard do TikJogos. O sistema rastreará visitantes únicos e pageviews através de cookies persistentes, armazenará os dados no banco PostgreSQL existente, e exibirá métricas em tempo real através de cards KPI e gráficos temporais de 30 dias.

## Requirements

### Requirement 1: Sistema de Rastreamento por Cookie

**User Story:** Como administrador do sistema, eu quero rastrear visitantes através de cookies persistentes, para que eu possa distinguir entre visitantes únicos e pageviews recorrentes.

#### Acceptance Criteria

1. WHEN um usuário acessa qualquer página do site THEN o sistema SHALL verificar a existência de um cookie de rastreamento chamado "visitor_id"
2. IF o cookie "visitor_id" não existir THEN o sistema SHALL gerar um UUID único, armazenar no cookie com expiração de 365 dias, e registrar como "Visitante Único"
3. IF o cookie "visitor_id" já existir THEN o sistema SHALL registrar apenas como "Pageview" sem incrementar o contador de visitantes únicos
4. WHEN um acesso é registrado THEN o sistema SHALL capturar e armazenar: timestamp, IP do visitante, visitor_id (UUID do cookie), e tipo de evento (unique_visitor ou pageview)
5. WHEN o cookie é criado THEN o sistema SHALL configurá-lo como httpOnly: false (para permitir leitura client-side), secure: true (em produção), e sameSite: 'lax'

### Requirement 2: Persistência de Dados no Banco

**User Story:** Como desenvolvedor, eu quero armazenar os dados de analytics no PostgreSQL existente, para que os dados persistam entre reinicializações e possam ser consultados historicamente.

#### Acceptance Criteria

1. WHEN o sistema inicializa THEN o sistema SHALL criar uma tabela "analytics_events" no banco PostgreSQL com os campos: id (UUID primary key), visitor_id (UUID), event_type (enum: 'unique_visitor' ou 'pageview'), ip_address (varchar), user_agent (text), page_path (varchar), created_at (timestamp)
2. WHEN um evento de analytics é capturado THEN o sistema SHALL inserir um novo registro na tabela "analytics_events" com todos os campos preenchidos
3. WHEN um visitante único é detectado THEN o sistema SHALL registrar um evento com event_type = 'unique_visitor'
4. WHEN um pageview é detectado THEN o sistema SHALL registrar um evento com event_type = 'pageview'
5. WHEN dados são inseridos THEN o sistema SHALL garantir que o timestamp seja armazenado em UTC

### Requirement 3: API de Consulta de Métricas

**User Story:** Como frontend developer, eu quero uma API REST para consultar métricas de analytics, para que eu possa exibir os dados no dashboard.

#### Acceptance Criteria

1. WHEN uma requisição GET é feita para "/api/analytics/summary" THEN o sistema SHALL retornar um JSON com: total_pageviews (número total de pageviews), total_unique_visitors (número total de visitantes únicos), pageviews_last_30_days (array de objetos com date e count), unique_visitors_last_30_days (array de objetos com date e count)
2. WHEN a API calcula "total_pageviews" THEN o sistema SHALL contar todos os registros onde event_type = 'pageview' OU event_type = 'unique_visitor'
3. WHEN a API calcula "total_unique_visitors" THEN o sistema SHALL contar registros distintos por visitor_id onde event_type = 'unique_visitor'
4. WHEN a API calcula dados dos últimos 30 dias THEN o sistema SHALL agrupar eventos por data (dia) e retornar contagens diárias ordenadas cronologicamente
5. IF não houver dados para um dia específico nos últimos 30 dias THEN o sistema SHALL retornar count = 0 para aquele dia
6. WHEN ocorre um erro na consulta THEN o sistema SHALL retornar status 500 com mensagem de erro apropriada

### Requirement 4: Middleware de Rastreamento Automático

**User Story:** Como administrador, eu quero que todas as requisições sejam automaticamente rastreadas, para que eu não precise adicionar código de tracking manualmente em cada rota.

#### Acceptance Criteria

1. WHEN o servidor Express inicializa THEN o sistema SHALL registrar um middleware global que intercepta todas as requisições HTTP
2. WHEN uma requisição é interceptada THEN o middleware SHALL verificar o cookie "visitor_id" antes de processar a rota
3. IF a requisição é para arquivos estáticos (js, css, imagens) THEN o middleware SHALL ignorar o rastreamento
4. IF a requisição é para rotas de API (/api/*) THEN o middleware SHALL registrar o evento normalmente
5. WHEN o middleware processa uma requisição THEN o sistema SHALL extrair o IP real considerando headers de proxy (X-Forwarded-For, X-Real-IP)

### Requirement 5: Dashboard - Cards de KPI

**User Story:** Como administrador, eu quero visualizar cards com números grandes mostrando métricas totais, para que eu possa rapidamente entender o volume de tráfego do site.

#### Acceptance Criteria

1. WHEN o dashboard de analytics é carregado THEN o sistema SHALL exibir dois cards lado a lado (ou empilhados em mobile)
2. WHEN o primeiro card é renderizado THEN o sistema SHALL exibir o título "Total de Pageviews" e o número total em fonte grande (mínimo 2.5rem)
3. WHEN o segundo card é renderizado THEN o sistema SHALL exibir o título "Visitantes Únicos" e o número total em fonte grande (mínimo 2.5rem)
4. WHEN os dados estão sendo carregados THEN o sistema SHALL exibir um skeleton loader ou spinner nos cards
5. IF ocorrer erro ao carregar dados THEN o sistema SHALL exibir mensagem de erro nos cards
6. WHEN os números são exibidos THEN o sistema SHALL formatar com separadores de milhar (ex: 1.234.567)

### Requirement 6: Dashboard - Gráficos Temporais

**User Story:** Como administrador, eu quero visualizar gráficos de linha mostrando a evolução das métricas nos últimos 30 dias, para que eu possa identificar tendências e padrões de tráfego.

#### Acceptance Criteria

1. WHEN o dashboard de analytics é carregado THEN o sistema SHALL exibir dois gráficos de linha abaixo dos cards KPI
2. WHEN o primeiro gráfico é renderizado THEN o sistema SHALL exibir "Pageviews - Últimos 30 Dias" com eixo X mostrando datas e eixo Y mostrando contagem
3. WHEN o segundo gráfico é renderizado THEN o sistema SHALL exibir "Visitantes Únicos - Últimos 30 Dias" com eixo X mostrando datas e eixo Y mostrando contagem
4. WHEN os gráficos são renderizados THEN o sistema SHALL usar a biblioteca Recharts (já instalada) para criar gráficos responsivos
5. WHEN o usuário passa o mouse sobre um ponto do gráfico THEN o sistema SHALL exibir um tooltip com a data e o valor exato
6. WHEN os dados dos últimos 30 dias são exibidos THEN o sistema SHALL formatar as datas no eixo X como "DD/MM" para melhor legibilidade
7. IF não houver dados para exibir THEN o sistema SHALL mostrar mensagem "Nenhum dado disponível ainda"
8. WHEN os gráficos são renderizados em mobile THEN o sistema SHALL ajustar o tamanho e espaçamento para melhor visualização

### Requirement 7: Página de Analytics no Dashboard

**User Story:** Como administrador, eu quero acessar uma página dedicada de analytics no dashboard, para que eu possa visualizar todas as métricas de tráfego em um só lugar.

#### Acceptance Criteria

1. WHEN o sistema de rotas é configurado THEN o sistema SHALL criar uma rota "/dashboard/analytics" acessível apenas para usuários autenticados
2. WHEN um usuário não autenticado tenta acessar "/dashboard/analytics" THEN o sistema SHALL redirecionar para a página de login
3. WHEN a página de analytics é carregada THEN o sistema SHALL exibir um título "Analytics de Tráfego" no topo
4. WHEN a página é renderizada THEN o sistema SHALL organizar o layout com: título no topo, cards KPI logo abaixo, e gráficos na sequência
5. WHEN a página é acessada THEN o sistema SHALL fazer uma única requisição à API "/api/analytics/summary" para obter todos os dados
6. WHEN os dados são recebidos THEN o sistema SHALL distribuir os dados apropriadamente entre cards e gráficos

### Requirement 8: Performance e Otimização

**User Story:** Como desenvolvedor, eu quero que o sistema de analytics seja performático, para que não impacte negativamente a experiência do usuário.

#### Acceptance Criteria

1. WHEN o middleware de tracking é executado THEN o sistema SHALL processar de forma assíncrona sem bloquear a resposta da requisição
2. WHEN dados são inseridos no banco THEN o sistema SHALL usar prepared statements para prevenir SQL injection
3. WHEN a API de summary é chamada THEN o sistema SHALL executar queries otimizadas com índices apropriados
4. WHEN a tabela analytics_events é criada THEN o sistema SHALL criar índices em: visitor_id, event_type, created_at
5. IF o registro de analytics falhar THEN o sistema SHALL logar o erro mas NÃO SHALL interromper a requisição do usuário
6. WHEN o frontend consulta a API THEN o sistema SHALL implementar cache de 5 minutos usando React Query para evitar requisições desnecessárias
