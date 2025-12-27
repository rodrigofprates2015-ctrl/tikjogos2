import { ExternalLink } from 'lucide-react';

type Store = 'Amazon' | 'MercadoLivre' | 'Shopee';

interface Offer {
  store: Store;
  price: number;
  url: string;
}

interface AdBannerProps {
  id: string;
  productName: string;
  description: string;
  image: string;
  offers: Offer[];
  dimensions: '728x90' | '300x250' | '160x600' | '300x600';
}

const storeColors: Record<Store, { bg: string; text: string; badge: string }> = {
  Amazon: {
    bg: 'bg-[#FF9900]/10',
    text: 'text-[#FF9900]',
    badge: 'bg-[#FF9900]'
  },
  MercadoLivre: {
    bg: 'bg-[#FFE600]/10',
    text: 'text-[#FFE600]',
    badge: 'bg-[#FFE600]'
  },
  Shopee: {
    bg: 'bg-[#EE4D2D]/10',
    text: 'text-[#EE4D2D]',
    badge: 'bg-[#EE4D2D]'
  }
};

export function AdBanner({ id, productName, description, image, offers, dimensions }: AdBannerProps) {
  // Encontrar melhor oferta
  const bestOffer = offers.reduce((min, offer) => 
    offer.price < min.price ? offer : min
  );
  
  const savings = Math.max(...offers.map(o => o.price)) - bestOffer.price;

  // Renderizar baseado nas dimensões
  if (dimensions === '728x90') {
    return (
      <div 
        id={id}
        className="w-[728px] h-[90px] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
      >
        <div className="flex items-center h-full p-3 gap-3">
          {/* Imagem do Produto */}
          <div className="flex-shrink-0">
            <img 
              src={image} 
              alt={productName}
              className="w-16 h-16 object-contain rounded-lg bg-white/5 p-1"
            />
          </div>

          {/* Info do Produto */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{productName}</h3>
            <p className="text-xs text-white/70 truncate">{description}</p>
          </div>

          {/* Badge de Economia */}
          {savings > 0 && (
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap">
              Economize R$ {savings.toFixed(2)}
            </div>
          )}

          {/* Ofertas */}
          <div className="flex gap-2">
            {offers.map((offer) => (
              <a
                key={offer.store}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`flex flex-col items-center justify-center w-24 h-16 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  offer.store === bestOffer.store
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                {offer.store === bestOffer.store && (
                  <span className="text-[8px] font-bold text-green-400 mb-0.5">🔥 MELHOR</span>
                )}
                <span className="text-[10px] text-white/70 mb-0.5">{offer.store}</span>
                <span className="text-sm font-bold text-white">
                  R$ {offer.price.toFixed(2).replace('.', ',')}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (dimensions === '300x250') {
    return (
      <div 
        id={id}
        className="w-[300px] h-[250px] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
      >
        <div className="flex flex-col h-full p-4">
          {/* Header com Imagem */}
          <div className="text-center mb-3">
            <img 
              src={image} 
              alt={productName}
              className="w-24 h-24 object-contain rounded-lg bg-white/5 p-2 mx-auto mb-2"
            />
            <h3 className="text-sm font-bold text-white">{productName}</h3>
            <p className="text-xs text-white/70">{description}</p>
          </div>

          {/* Badge de Economia */}
          {savings > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center mb-3">
              Economize R$ {savings.toFixed(2)}
            </div>
          )}

          {/* Ofertas Verticais */}
          <div className="flex-1 flex flex-col gap-2">
            {offers.map((offer) => (
              <a
                key={offer.store}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                  offer.store === bestOffer.store
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  {offer.store === bestOffer.store && (
                    <span className="text-xs font-bold text-green-400">💰</span>
                  )}
                  <span className="text-xs font-semibold text-white">{offer.store}</span>
                </div>
                <span className="text-sm font-bold text-white">
                  R$ {offer.price.toFixed(2).replace('.', ',')}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (dimensions === '160x600') {
    return (
      <div 
        id={id}
        className="w-[160px] h-[600px] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
      >
        <div className="flex flex-col h-full p-3">
          {/* Header */}
          <div className="text-center mb-3">
            <img 
              src={image} 
              alt={productName}
              className="w-20 h-20 object-contain rounded-lg bg-white/5 p-2 mx-auto mb-2"
            />
            <h3 className="text-xs font-bold text-white leading-tight mb-1">{productName}</h3>
            <p className="text-[10px] text-white/70 leading-tight">{description}</p>
          </div>

          {/* Badge de Economia */}
          {savings > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg text-center mb-3">
              Economize<br />R$ {savings.toFixed(2)}
            </div>
          )}

          {/* Ofertas Empilhadas */}
          <div className="flex-1 flex flex-col gap-3">
            {offers.map((offer) => (
              <a
                key={offer.store}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                  offer.store === bestOffer.store
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                {offer.store === bestOffer.store && (
                  <span className="text-[9px] font-bold text-green-400 mb-1">🔥 MELHOR</span>
                )}
                <span className="text-[10px] text-white/70 mb-1">{offer.store}</span>
                <span className="text-sm font-bold text-white text-center">
                  R$ {offer.price.toFixed(2).replace('.', ',')}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (dimensions === '300x600') {
    return (
      <div 
        id={id}
        className="w-[300px] h-[600px] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
      >
        <div className="flex flex-col h-full p-4">
          {/* Header Grande */}
          <div className="text-center mb-4">
            <img 
              src={image} 
              alt={productName}
              className="w-32 h-32 object-contain rounded-xl bg-white/5 p-3 mx-auto mb-3"
            />
            <h3 className="text-base font-bold text-white mb-2">{productName}</h3>
            <p className="text-xs text-white/70">{description}</p>
          </div>

          {/* Badge de Economia */}
          {savings > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg text-center mb-4">
              Economize R$ {savings.toFixed(2)}
            </div>
          )}

          {/* Ofertas Grandes */}
          <div className="flex-1 flex flex-col gap-4">
            {offers.map((offer) => (
              <a
                key={offer.store}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`flex flex-col items-center justify-center px-4 py-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                  offer.store === bestOffer.store
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                {offer.store === bestOffer.store && (
                  <span className="text-xs font-bold text-green-400 mb-2">⭐ MELHOR OFERTA</span>
                )}
                <div className="text-3xl mb-2">
                  {offer.store === 'Amazon' && '📦'}
                  {offer.store === 'MercadoLivre' && '💛'}
                  {offer.store === 'Shopee' && '🛍️'}
                </div>
                <span className="text-sm font-semibold text-white mb-2">{offer.store}</span>
                <span className="text-xl font-bold text-white mb-2">
                  R$ {offer.price.toFixed(2).replace('.', ',')}
                </span>
                <div className="flex items-center gap-1 text-xs text-white/70">
                  Ver Oferta <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
