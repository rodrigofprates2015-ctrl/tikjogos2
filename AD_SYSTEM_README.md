# Sistema de Anúncios Comparativos - TikJogos

## Visão Geral

Sistema moderno de anúncios comparativos de preços usando React/TypeScript com componentes reutilizáveis e tipagem forte.

## Estrutura

```
client/src/
├── components/
│   └── ad-banner.tsx          # Componente principal de banner
├── data/
│   └── ad-data.ts             # Dados dos anúncios e helpers
└── pages/
    ├── Prototipo.tsx          # Exemplo de uso em página real
    └── AdTest.tsx             # Página de teste com todos os formatos
```

## Formatos Suportados

### 1. 728x90 (Leaderboard)
- **Uso**: Topo e rodapé de páginas
- **Dispositivo**: Desktop
- **Layout**: Horizontal com imagem, info do produto e ofertas lado a lado

### 2. 300x250 (Medium Rectangle)
- **Uso**: Dentro do conteúdo
- **Dispositivo**: Mobile e Desktop
- **Layout**: Vertical com imagem no topo e ofertas empilhadas

### 3. 160x600 (Wide Skyscraper)
- **Uso**: Laterais da página
- **Dispositivo**: Desktop only
- **Layout**: Vertical estreito com ofertas empilhadas

### 4. 300x600 (Half Page)
- **Uso**: Laterais da página
- **Dispositivo**: Desktop only
- **Layout**: Vertical grande com ofertas destacadas

## Como Usar

### Uso Básico

```tsx
import { AdBanner } from '@/components/ad-banner';

const adData = {
  id: 'comp_ps5_horiz',
  productName: 'Console Playstation 5 Slim Digital 825GB',
  description: 'Nova geração de jogos em 4K',
  image: 'https://m.media-amazon.com/images/I/71PeCknZMRL._AC_SX679_.jpg',
  offers: [
    { 
      store: 'Amazon' as const, 
      price: 3310.80, 
      url: 'https://amzn.to/4jcPmTI' 
    },
    { 
      store: 'MercadoLivre' as const, 
      price: 3815.14, 
      url: 'https://mercadolivre.com/sec/1DvPY8w' 
    },
    { 
      store: 'Shopee' as const, 
      price: 3519.00, 
      url: 'https://s.shopee.com.br/2LRZd8rBdp' 
    }
  ],
  dimensions: '728x90' as const
};

function MyPage() {
  return (
    <AdBanner
      id={adData.id}
      productName={adData.productName}
      description={adData.description}
      image={adData.image}
      offers={adData.offers}
      dimensions={adData.dimensions}
    />
  );
}
```

### Uso com Seleção Aleatória

```tsx
import { AdBanner } from '@/components/ad-banner';
import { getRandomAdByFormat } from '@/data/ad-data';

function MyPage() {
  const topAd = getRandomAdByFormat('728x90');
  
  return (
    <>
      {topAd && (
        <AdBanner
          id={topAd.id}
          productName={topAd.productName}
          description={topAd.description}
          image={topAd.image}
          offers={topAd.offers}
          dimensions={topAd.dimensions}
        />
      )}
    </>
  );
}
```

### Uso com ID Específico

```tsx
import { AdBanner } from '@/components/ad-banner';
import { getAdById } from '@/data/ad-data';

function MyPage() {
  const ad = getAdById('comp_ps5_horiz');
  
  return (
    <>
      {ad && (
        <AdBanner
          id={ad.id}
          productName={ad.productName}
          description={ad.description}
          image={ad.image}
          offers={ad.offers}
          dimensions={ad.dimensions}
        />
      )}
    </>
  );
}
```

## Adicionar Novos Produtos

Edite o arquivo `client/src/data/ad-data.ts`:

```typescript
export const adDataCollection: AdData[] = [
  // ... produtos existentes
  
  // Novo produto
  {
    id: 'comp_novo_produto',
    type: 'comparison',
    dimensions: '728x90', // ou '300x250', '160x600', '300x600'
    weight: 10, // Peso para seleção aleatória (maior = mais chance)
    category: 'desktop', // ou 'mobile', 'all'
    positionTarget: 'header', // ou 'content', 'sidebar'
    productName: 'Nome do Produto',
    description: 'Descrição curta',
    image: 'https://url-da-imagem.jpg',
    offers: [
      { 
        store: 'Amazon', 
        price: 199.90, 
        url: 'https://link-afiliado' 
      },
      { 
        store: 'MercadoLivre', 
        price: 219.90, 
        url: 'https://link-afiliado' 
      },
      { 
        store: 'Shopee', 
        price: 189.90, 
        url: 'https://link-afiliado' 
      }
    ]
  }
];
```

## Funcionalidades

### Detecção Automática de Melhor Oferta
O componente automaticamente:
- Identifica a oferta com menor preço
- Destaca com badge "🔥 MELHOR" ou similar
- Aplica estilo visual diferenciado (borda verde)

### Cálculo de Economia
- Calcula automaticamente a diferença entre maior e menor preço
- Exibe badge de economia quando há diferença

### Links Afiliados
- Todos os links abrem em nova aba
- Atributos `rel="noopener noreferrer sponsored"` para SEO
- Tracking de cliques pode ser adicionado

### Responsividade
- Formatos 728x90, 160x600 e 300x600: Desktop only
- Formato 300x250: Mobile e Desktop
- Classes Tailwind para controle de visibilidade

## Estilos

O sistema usa:
- **Tailwind CSS** para estilização
- **Gradientes** para visual moderno
- **Hover effects** para interatividade
- **Bordas e sombras** para destaque
- **Cores temáticas** por loja (Amazon, Mercado Livre, Shopee)

## Páginas de Teste

### /prototipo
Página real com anúncios integrados:
- Banner horizontal no topo (728x90)
- Banner horizontal no rodapé (728x90)
- Banners verticais nas laterais (160x600)

### /ad-test
Página de demonstração com todos os formatos:
- Mostra todos os produtos cadastrados
- Separados por formato
- Ideal para testar novos produtos

## Tracking e Analytics

Para adicionar tracking de cliques, modifique o componente `ad-banner.tsx`:

```tsx
const handleClick = (offer: Offer) => {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'ad_click', {
      product_name: productName,
      store: offer.store,
      price: offer.price
    });
  }
  
  // Seu sistema de tracking
  console.log('Click:', { productName, store: offer.store, price: offer.price });
};
```

## Migração do Sistema Antigo

O sistema antigo (JavaScript vanilla) foi substituído por:
- ✅ Componentes React tipados
- ✅ TypeScript para type safety
- ✅ Tailwind CSS para estilização
- ✅ Melhor performance (sem scripts externos)
- ✅ Mais fácil de manter e estender

Arquivos antigos que podem ser removidos:
- `client/public/price-comparison-engine.js`
- `client/public/price-comparison-ads.js`
- `client/public/price-comparison.css`

## Próximos Passos

1. **A/B Testing**: Implementar testes A/B para diferentes layouts
2. **Analytics**: Integrar com Google Analytics ou similar
3. **Cache**: Implementar cache de imagens
4. **Lazy Loading**: Carregar imagens sob demanda
5. **API**: Buscar preços de uma API em tempo real
6. **Admin Panel**: Interface para gerenciar produtos sem editar código
