type Store = 'Amazon' | 'MercadoLivre' | 'Shopee';

interface Offer {
  store: Store;
  price: number;
  url: string;
}

export interface AdData {
  id: string;
  type: 'comparison';
  dimensions: '728x90' | '300x250' | '160x600' | '300x600';
  weight: number;
  category: 'desktop' | 'mobile' | 'all';
  positionTarget: string;
  productName: string;
  description: string;
  image: string;
  offers: Offer[];
}

export const adDataCollection: AdData[] = [
  // PlayStation 5 - Formato 728x90 (Leaderboard)
  {
    id: 'comp_ps5_horiz',
    type: 'comparison',
    dimensions: '728x90',
    weight: 10,
    category: 'desktop',
    positionTarget: 'header',
    productName: 'Console Playstation 5 Slim Digital 825GB',
    description: 'Nova geração de jogos em 4K',
    image: 'https://m.media-amazon.com/images/I/71PeCknZMRL._AC_SX679_.jpg',
    offers: [
      { 
        store: 'Amazon', 
        price: 3310.80, 
        url: 'https://amzn.to/4jcPmTI' 
      },
      { 
        store: 'MercadoLivre', 
        price: 3815.14, 
        url: 'https://mercadolivre.com/sec/1DvPY8w' 
      },
      { 
        store: 'Shopee', 
        price: 3519.00, 
        url: 'https://s.shopee.com.br/2LRZd8rBdp' 
      }
    ]
  },

  // Mouse Gamer - Formato 728x90 (Leaderboard)
  {
    id: 'comp_mouse_horiz',
    type: 'comparison',
    dimensions: '728x90',
    weight: 9,
    category: 'desktop',
    positionTarget: 'header',
    productName: 'Mouse Gamer RGB 7 Botões',
    description: 'DPI ajustável até 12.800',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
    offers: [
      { store: 'Shopee', price: 89.90, url: 'https://shope.ee/exemplo' },
      { store: 'MercadoLivre', price: 119.90, url: 'https://mercadolivre.com.br/exemplo' },
      { store: 'Amazon', price: 134.90, url: 'https://amzn.to/4phmY4v' }
    ]
  },

  // Teclado Mecânico - Formato 728x90 (Leaderboard)
  {
    id: 'comp_teclado_horiz',
    type: 'comparison',
    dimensions: '728x90',
    weight: 8,
    category: 'desktop',
    positionTarget: 'header',
    productName: 'Teclado Mecânico RGB Switch Blue',
    description: 'ABNT2, iluminação RGB',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&h=200&fit=crop',
    offers: [
      { store: 'Amazon', price: 199.90, url: 'https://amzn.to/4phmY4v' },
      { store: 'Shopee', price: 219.90, url: 'https://shope.ee/exemplo' },
      { store: 'MercadoLivre', price: 249.90, url: 'https://mercadolivre.com.br/exemplo' }
    ]
  },

  // Headset - Formato 300x250 (Medium Rectangle)
  {
    id: 'comp_headset_medium',
    type: 'comparison',
    dimensions: '300x250',
    weight: 8,
    category: 'all',
    positionTarget: 'content',
    productName: 'Headset Gamer 7.1',
    description: 'Surround, mic cancelamento',
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=200&h=200&fit=crop',
    offers: [
      { store: 'MercadoLivre', price: 149.90, url: 'https://mercadolivre.com.br/exemplo' },
      { store: 'Shopee', price: 159.90, url: 'https://shope.ee/exemplo' },
      { store: 'Amazon', price: 179.90, url: 'https://amzn.to/4phmY4v' }
    ]
  },

  // Mousepad - Formato 300x250 (Medium Rectangle)
  {
    id: 'comp_mousepad_medium',
    type: 'comparison',
    dimensions: '300x250',
    weight: 7,
    category: 'all',
    positionTarget: 'content',
    productName: 'Mousepad Gamer XXL',
    description: '90x40cm, base antiderrapante',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200&h=200&fit=crop',
    offers: [
      { store: 'Shopee', price: 39.90, url: 'https://shope.ee/exemplo' },
      { store: 'Amazon', price: 49.90, url: 'https://amzn.to/4phmY4v' },
      { store: 'MercadoLivre', price: 54.90, url: 'https://mercadolivre.com.br/exemplo' }
    ]
  },

  // Cadeira Gamer - Formato 160x600 (Wide Skyscraper)
  {
    id: 'comp_cadeira_vertical',
    type: 'comparison',
    dimensions: '160x600',
    weight: 8,
    category: 'desktop',
    positionTarget: 'sidebar',
    productName: 'Cadeira Gamer Pro',
    description: 'Ergonômica, reclinável 180°',
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=200&h=200&fit=crop',
    offers: [
      { store: 'MercadoLivre', price: 699.90, url: 'https://mercadolivre.com.br/exemplo' },
      { store: 'Shopee', price: 749.90, url: 'https://shope.ee/exemplo' },
      { store: 'Amazon', price: 799.90, url: 'https://amzn.to/4phmY4v' }
    ]
  },

  // Webcam - Formato 160x600 (Wide Skyscraper)
  {
    id: 'comp_webcam_vertical',
    type: 'comparison',
    dimensions: '160x600',
    weight: 7,
    category: 'desktop',
    positionTarget: 'sidebar',
    productName: 'Webcam Full HD',
    description: '1080p, 60fps, mic integrado',
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=200&h=200&fit=crop',
    offers: [
      { store: 'Amazon', price: 189.90, url: 'https://amzn.to/4phmY4v' },
      { store: 'Shopee', price: 199.90, url: 'https://shope.ee/exemplo' },
      { store: 'MercadoLivre', price: 219.90, url: 'https://mercadolivre.com.br/exemplo' }
    ]
  },

  // Monitor - Formato 300x600 (Half Page)
  {
    id: 'comp_monitor_halfpage',
    type: 'comparison',
    dimensions: '300x600',
    weight: 9,
    category: 'desktop',
    positionTarget: 'sidebar',
    productName: 'Monitor Gamer 24" 144Hz',
    description: 'Full HD, 1ms, FreeSync',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop',
    offers: [
      { store: 'Shopee', price: 799.90, url: 'https://shope.ee/exemplo' },
      { store: 'MercadoLivre', price: 849.90, url: 'https://mercadolivre.com.br/exemplo' },
      { store: 'Amazon', price: 899.90, url: 'https://amzn.to/4phmY4v' }
    ]
  },

  // SSD - Formato 300x600 (Half Page)
  {
    id: 'comp_ssd_halfpage',
    type: 'comparison',
    dimensions: '300x600',
    weight: 8,
    category: 'desktop',
    positionTarget: 'sidebar',
    productName: 'SSD 480GB SATA',
    description: 'Leitura 550MB/s',
    image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=200&h=200&fit=crop',
    offers: [
      { store: 'Amazon', price: 189.90, url: 'https://amzn.to/4phmY4v' },
      { store: 'MercadoLivre', price: 199.90, url: 'https://mercadolivre.com.br/exemplo' },
      { store: 'Shopee', price: 209.90, url: 'https://shope.ee/exemplo' }
    ]
  }
];

// Função helper para selecionar anúncio aleatório por formato
export function getRandomAdByFormat(format: '728x90' | '300x250' | '160x600' | '300x600'): AdData | null {
  const filteredAds = adDataCollection.filter(ad => ad.dimensions === format);
  
  if (filteredAds.length === 0) return null;
  
  // Seleção ponderada por peso
  const totalWeight = filteredAds.reduce((sum, ad) => sum + ad.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const ad of filteredAds) {
    random -= ad.weight;
    if (random <= 0) return ad;
  }
  
  return filteredAds[filteredAds.length - 1];
}

// Função helper para obter anúncio específico por ID
export function getAdById(id: string): AdData | null {
  return adDataCollection.find(ad => ad.id === id) || null;
}
