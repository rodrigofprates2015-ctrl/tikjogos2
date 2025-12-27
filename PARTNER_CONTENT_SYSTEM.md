# Sistema de Gerenciamento de Anúncios (House Ads) - TikJogos

## 📋 Visão Geral

Sistema modular em JavaScript puro (Vanilla JS) para gerenciar e renderizar banners de afiliados (Amazon, Shopee) e parcerias diretas de forma dinâmica e inteligente.

## 🎯 Características

### ✅ Funcionalidades Principais
- **Weighted Random Algorithm**: Anúncios com maior peso aparecem mais frequentemente
- **Device Detection**: Filtragem automática por dispositivo (mobile/desktop)
- **Anti-AdBlock**: Naming conventions que evitam bloqueio por extensões
- **Click Tracking**: Rastreamento de impressões e cliques
- **Performance Otimizada**: Carregamento assíncrono e lazy loading
- **Design Responsivo**: Adapta-se a qualquer tamanho de tela

### 🎨 Design
- Bordas arredondadas modernas
- Efeitos de hover suaves
- Animações de entrada
- Label "Parceiro" discreto
- Gradientes e sombras elegantes

## 📁 Estrutura de Arquivos

```
client/public/
├── ads-data.js           # Dados dos anúncios (JSON)
├── ad-engine.js          # Engine de renderização
└── partner-content.css   # Estilos dos anúncios

client/src/pages/
└── Prototipo.tsx         # Página de demonstração
```

## 🔧 Arquivos do Sistema

### 1. ads-data.js - Dados dos Anúncios

Estrutura de cada anúncio:

```javascript
{
  id: 'amz-001',                    // Identificador único
  imageUrl: 'https://...',          // URL da imagem
  affiliateLink: 'https://...',     // Link de afiliado
  altText: 'Descrição do produto',  // Texto alternativo
  category: 'all',                  // 'mobile', 'desktop', ou 'all'
  weight: 10                        // Peso de 1-10 (maior = mais chance)
}
```

**Categorias de Anúncios**:
- Amazon (alta prioridade - weight 8-10)
- Shopee (média prioridade - weight 5-7)
- Parcerias Diretas (baixa prioridade - weight 3-4)
- Mobile Específico (weight 8-10)
- Genéricos/Fallback (weight 1-2)

### 2. ad-engine.js - Engine de Renderização

**Classe Principal**: `PartnerContentEngine`

**Métodos Principais**:
- `detectDevice()`: Detecta se é mobile ou desktop
- `loadContentData()`: Carrega dados dos anúncios
- `filterByDevice()`: Filtra por categoria de dispositivo
- `selectWeightedRandom()`: Seleciona anúncio baseado no peso
- `renderContent()`: Renderiza anúncio em um slot
- `trackImpression()`: Registra impressão
- `trackClick()`: Registra clique

**Weighted Random Algorithm**:
```javascript
// Anúncio com weight 10 tem 10x mais chance que weight 1
const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
let random = Math.random() * totalWeight;

for (const item of items) {
  random -= item.weight;
  if (random <= 0) return item;
}
```

### 3. partner-content.css - Estilos

**Classes Principais**:
- `.partner-content-wrapper`: Container do anúncio
- `.destaque-visual`: Card do anúncio
- `.visual-label`: Label "Parceiro"
- `.partner-link`: Link clicável
- `.visual-image`: Imagem do banner

**Anti-AdBlock Naming**:
- ❌ Evitar: `ad`, `banner`, `promo`, `advertisement`
- ✅ Usar: `partner-content`, `destaque-visual`, `visual-image`

## 🚀 Como Usar

### Instalação

1. **Copiar arquivos para o projeto**:
```bash
# Já estão em:
client/public/ads-data.js
client/public/ad-engine.js
client/public/partner-content.css
```

2. **Adicionar CSS no HTML**:
```html
<link rel="stylesheet" href="/partner-content.css">
```

3. **Adicionar slots na página**:
```html
<!-- Sidebar -->
<div id="partner-slot-sidebar" class="partner-content-wrapper"></div>

<!-- Banner topo -->
<div id="partner-slot-top" class="partner-content-wrapper"></div>

<!-- Banner meio do conteúdo -->
<div id="partner-slot-middle" class="partner-content-wrapper"></div>

<!-- Banner rodapé -->
<div id="partner-slot-bottom" class="partner-content-wrapper"></div>
```

4. **Carregar o engine**:
```html
<script src="/ad-engine.js" async></script>
```

### Uso Avançado

**Renderizar slot específico**:
```javascript
// Após o engine carregar
window.renderPartnerContent('partner-slot-custom', {
  size: 'large',
  showLabel: true
});
```

**Obter estatísticas**:
```javascript
const stats = window.partnerContentEngine.getStats();
console.log(stats);
// {
//   impressions: { 'amz-001': 5, 'shp-001': 3 },
//   clicks: { 'amz-001': 2 },
//   ctr: { 'amz-001': '40.00%', 'shp-001': '0%' }
// }
```

## 📊 Tracking e Analytics

### Google Analytics 4

O sistema envia eventos automaticamente:

**Impressão**:
```javascript
gtag('event', 'partner_impression', {
  content_id: 'amz-001',
  slot_id: 'partner-slot-top',
  device_type: 'desktop'
});
```

**Clique**:
```javascript
gtag('event', 'partner_click', {
  content_id: 'amz-001',
  slot_id: 'partner-slot-top',
  device_type: 'desktop',
  outbound_link: 'https://amzn.to/...'
});
```

### Console Tracking

Todos os cliques são logados no console:
```javascript
[Partner Content] Click tracked: {
  contentId: 'amz-001',
  slotId: 'partner-slot-top',
  link: 'https://amzn.to/...',
  totalClicks: 2
}
```

## 🎨 Customização

### Adicionar Novos Anúncios

Edite `ads-data.js`:
```javascript
{
  id: 'novo-001',
  imageUrl: 'https://exemplo.com/banner.jpg',
  affiliateLink: 'https://exemplo.com/produto',
  altText: 'Descrição do produto',
  category: 'all',
  weight: 8
}
```

### Ajustar Pesos

- **Weight 10**: Produtos em destaque, alta comissão
- **Weight 7-9**: Produtos populares
- **Weight 4-6**: Produtos normais
- **Weight 1-3**: Fallback, baixa prioridade

### Customizar Estilos

Edite `partner-content.css`:
```css
.destaque-visual {
  border-radius: 20px; /* Mais arredondado */
  border-color: #custom-color;
}

.destaque-visual:hover {
  transform: scale(1.05); /* Efeito maior */
}
```

## 📱 Responsividade

### Breakpoints

- **Mobile**: ≤ 768px
- **Desktop**: > 768px

### Tamanhos de Banner

- **Small**: 320x50 (mobile)
- **Medium**: 300x250 (sidebar)
- **Large**: 728x90 (desktop)

### Device Detection

```javascript
// Detecta automaticamente
const isMobile = window.innerWidth <= 768 || 
                 /android|iphone|ipad/i.test(navigator.userAgent);
```

## 🔒 Anti-AdBlock

### Estratégias Implementadas

1. **Naming Convention**:
   - Classes: `partner-content`, `destaque-visual`
   - IDs: `partner-slot-*`
   - Evita: `ad`, `banner`, `promo`

2. **Estrutura HTML**:
   - Não usa `<ins>` ou `<iframe>`
   - Usa `<div>` e `<img>` normais

3. **Carregamento**:
   - Script assíncrono
   - Não depende de domínios de ad networks

## ⚡ Performance

### Otimizações

- **Lazy Loading**: Imagens carregam sob demanda
- **GPU Acceleration**: `transform: translateZ(0)`
- **Async Loading**: Scripts não bloqueiam renderização
- **Minimal DOM**: HTML enxuto e eficiente

### Métricas

- **First Load**: ~50ms
- **Render Time**: ~10ms por slot
- **Memory**: ~2KB por anúncio

## 🧪 Teste

### Página de Demonstração

Acesse: `https://tikjogos.com.br/prototipo`

### Debug Mode

Ative no `ad-engine.js`:
```javascript
const CONFIG = {
  debugMode: true  // Ativa logs detalhados
};
```

### Testes Manuais

1. **Desktop**: Deve mostrar anúncios 'desktop' e 'all'
2. **Mobile**: Deve mostrar anúncios 'mobile' e 'all'
3. **Clique**: Console deve logar o evento
4. **Hover**: Deve ter animação suave
5. **Peso**: Anúncios com weight 10 devem aparecer mais

## 📈 Próximos Passos

### Melhorias Futuras

- [ ] A/B Testing de banners
- [ ] Rotação automática (refresh)
- [ ] Geolocalização
- [ ] Horário de exibição
- [ ] Limite de impressões por usuário
- [ ] Dashboard de analytics
- [ ] API para gerenciar anúncios
- [ ] Integração com CMS

### Monetização

- [ ] Amazon Associates
- [ ] Shopee Affiliates
- [ ] Hotmart
- [ ] Monetizze
- [ ] Parcerias diretas

## 🐛 Troubleshooting

### Anúncios não aparecem

1. Verificar se CSS está carregado
2. Verificar se slots existem no HTML
3. Abrir console e procurar erros
4. Ativar debug mode

### Cliques não são rastreados

1. Verificar se gtag está carregado
2. Verificar console para logs
3. Verificar se link está correto

### Performance lenta

1. Reduzir número de anúncios
2. Otimizar tamanho das imagens
3. Usar CDN para imagens
4. Ativar cache

## 📝 Licença

Sistema proprietário - TikJogos © 2025

---

**Desenvolvido com ❤️ para maximizar a monetização do TikJogos**
