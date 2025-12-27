/**
 * Sistema de Gerenciamento de Anúncios - TikJogos
 * Dados dos anúncios (House Ads)
 * 
 * Estrutura:
 * - id: Identificador único
 * - imageUrl: URL da imagem do banner
 * - affiliateLink: Link de afiliado (Amazon, Shopee, etc)
 * - altText: Texto alternativo para acessibilidade
 * - category: 'mobile', 'desktop', ou 'all'
 * - weight: Peso de 1-10 (maior = mais chance de aparecer)
 */

const partnerContentData = [
  // Produtos Amazon - Alta Prioridade
  {
    id: 'amz-001',
    imageUrl: 'https://via.placeholder.com/728x90/6b4ba3/ffffff?text=Mouse+Gamer+RGB+-+R$+89,90',
    affiliateLink: 'https://amzn.to/exemplo-mouse-gamer',
    altText: 'Mouse Gamer RGB com 7 botões programáveis',
    category: 'all',
    weight: 10
  },
  {
    id: 'amz-002',
    imageUrl: 'https://via.placeholder.com/300x250/e07b39/ffffff?text=Teclado+Mecânico+-+R$+199,90',
    affiliateLink: 'https://amzn.to/exemplo-teclado',
    altText: 'Teclado Mecânico RGB Switch Blue',
    category: 'desktop',
    weight: 9
  },
  {
    id: 'amz-003',
    imageUrl: 'https://via.placeholder.com/320x100/4a90a4/ffffff?text=Headset+Gamer+-+R$+149,90',
    affiliateLink: 'https://amzn.to/exemplo-headset',
    altText: 'Headset Gamer 7.1 Surround',
    category: 'all',
    weight: 8
  },

  // Produtos Shopee - Média Prioridade
  {
    id: 'shp-001',
    imageUrl: 'https://via.placeholder.com/728x90/c44536/ffffff?text=Mousepad+XXL+-+R$+39,90',
    affiliateLink: 'https://shope.ee/exemplo-mousepad',
    altText: 'Mousepad Gamer XXL 90x40cm',
    category: 'all',
    weight: 7
  },
  {
    id: 'shp-002',
    imageUrl: 'https://via.placeholder.com/300x250/6b4ba3/ffffff?text=Cadeira+Gamer+-+R$+699,90',
    affiliateLink: 'https://shope.ee/exemplo-cadeira',
    altText: 'Cadeira Gamer Ergonômica com Apoio Lombar',
    category: 'desktop',
    weight: 6
  },
  {
    id: 'shp-003',
    imageUrl: 'https://via.placeholder.com/320x100/e07b39/ffffff?text=Suporte+Monitor+-+R$+79,90',
    affiliateLink: 'https://shope.ee/exemplo-suporte',
    altText: 'Suporte Articulado para Monitor',
    category: 'desktop',
    weight: 5
  },

  // Parcerias Diretas - Baixa Prioridade
  {
    id: 'prt-001',
    imageUrl: 'https://via.placeholder.com/728x90/4a90a4/ffffff?text=Curso+de+Programação+-+50%+OFF',
    affiliateLink: 'https://exemplo.com/curso-programacao',
    altText: 'Curso Completo de Desenvolvimento Web',
    category: 'all',
    weight: 4
  },
  {
    id: 'prt-002',
    imageUrl: 'https://via.placeholder.com/300x250/c44536/ffffff?text=VPN+Premium+-+3+Meses+Grátis',
    affiliateLink: 'https://exemplo.com/vpn-premium',
    altText: 'VPN Premium com 3 meses grátis',
    category: 'all',
    weight: 3
  },

  // Promoções Especiais - Mobile
  {
    id: 'mob-001',
    imageUrl: 'https://via.placeholder.com/320x50/6b4ba3/ffffff?text=App+TikJogos+-+Baixe+Agora',
    affiliateLink: 'https://play.google.com/store/apps/tikjogos',
    altText: 'Baixe o App TikJogos na Google Play',
    category: 'mobile',
    weight: 10
  },
  {
    id: 'mob-002',
    imageUrl: 'https://via.placeholder.com/320x50/e07b39/ffffff?text=Fone+Bluetooth+-+R$+59,90',
    affiliateLink: 'https://shope.ee/exemplo-fone-bluetooth',
    altText: 'Fone de Ouvido Bluetooth TWS',
    category: 'mobile',
    weight: 8
  },

  // Banners Genéricos - Fallback
  {
    id: 'gen-001',
    imageUrl: 'https://via.placeholder.com/728x90/3d4a5c/ffffff?text=Apoie+o+TikJogos',
    affiliateLink: 'https://tikjogos.com.br/apoie',
    altText: 'Apoie o TikJogos e ajude a manter o site no ar',
    category: 'all',
    weight: 2
  },
  {
    id: 'gen-002',
    imageUrl: 'https://via.placeholder.com/300x250/3d4a5c/ffffff?text=Anuncie+Aqui',
    affiliateLink: 'https://tikjogos.com.br/anuncie',
    altText: 'Anuncie no TikJogos e alcance milhares de jogadores',
    category: 'all',
    weight: 1
  }
];

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.partnerContentData = partnerContentData;
}
