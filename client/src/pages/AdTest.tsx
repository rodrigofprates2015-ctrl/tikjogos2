import { AdBanner } from '@/components/ad-banner';
import { adDataCollection } from '@/data/ad-data';

export default function AdTest() {
  // Separar anúncios por formato
  const ads728x90 = adDataCollection.filter(ad => ad.dimensions === '728x90');
  const ads300x250 = adDataCollection.filter(ad => ad.dimensions === '300x250');
  const ads160x600 = adDataCollection.filter(ad => ad.dimensions === '160x600');
  const ads300x600 = adDataCollection.filter(ad => ad.dimensions === '300x600');

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sistema de Comparação de Preços</h1>
          <p className="text-slate-400">Teste de todos os formatos de banners</p>
        </div>

        {/* Formato 728x90 - Leaderboard */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Formato 728x90 (Leaderboard)</h2>
            <p className="text-slate-400 text-sm">Banner horizontal para desktop - Topo e rodapé</p>
          </div>
          <div className="flex flex-col items-center gap-6">
            {ads728x90.map(ad => (
              <AdBanner
                key={ad.id}
                id={ad.id}
                productName={ad.productName}
                description={ad.description}
                image={ad.image}
                offers={ad.offers}
                dimensions={ad.dimensions}
              />
            ))}
          </div>
        </section>

        <div className="border-t border-slate-700"></div>

        {/* Formato 300x250 - Medium Rectangle */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Formato 300x250 (Medium Rectangle)</h2>
            <p className="text-slate-400 text-sm">Banner quadrado para conteúdo - Mobile e Desktop</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {ads300x250.map(ad => (
              <AdBanner
                key={ad.id}
                id={ad.id}
                productName={ad.productName}
                description={ad.description}
                image={ad.image}
                offers={ad.offers}
                dimensions={ad.dimensions}
              />
            ))}
          </div>
        </section>

        <div className="border-t border-slate-700"></div>

        {/* Formato 160x600 - Wide Skyscraper */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Formato 160x600 (Wide Skyscraper)</h2>
            <p className="text-slate-400 text-sm">Banner vertical para laterais - Desktop only</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {ads160x600.map(ad => (
              <AdBanner
                key={ad.id}
                id={ad.id}
                productName={ad.productName}
                description={ad.description}
                image={ad.image}
                offers={ad.offers}
                dimensions={ad.dimensions}
              />
            ))}
          </div>
        </section>

        <div className="border-t border-slate-700"></div>

        {/* Formato 300x600 - Half Page */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Formato 300x600 (Half Page)</h2>
            <p className="text-slate-400 text-sm">Banner vertical grande para laterais - Desktop only</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {ads300x600.map(ad => (
              <AdBanner
                key={ad.id}
                id={ad.id}
                productName={ad.productName}
                description={ad.description}
                image={ad.image}
                offers={ad.offers}
                dimensions={ad.dimensions}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            Sistema de anúncios TikJogos - Todos os formatos IAB
          </p>
        </div>

      </div>
    </div>
  );
}
