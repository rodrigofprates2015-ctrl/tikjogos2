import { useState } from "react";
import { Link } from "wouter";
import { Zap, Heart } from "lucide-react";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import logoImpostor from "@assets/logo_site_impostor_1765071990526.png";
import tripulanteImg from "@assets/tripulante_natal_1765071995242.png";
import impostorImg from "@assets/impostor_natal_1765071992843.png";
import { AdBanner } from "@/components/ad-banner";
import { getRandomAdByFormat } from "@/data/ad-data";

export default function Prototipo() {
  const [name, setNameInput] = useState("");
  const [code, setCodeInput] = useState("");
  const [saveNicknameChecked, setSaveNicknameChecked] = useState(false);

  // Selecionar anúncios aleatórios
  const topAd = getRandomAdByFormat('728x90');
  const bottomAd = getRandomAdByFormat('728x90');
  const leftAd = getRandomAdByFormat('160x600');
  const rightAd = getRandomAdByFormat('160x600');

  const handleCreate = () => {
    alert('Botão CRIAR SALA clicado! (Página de teste)');
  };

  const handleJoin = () => {
    alert('Botão ENTRAR clicado! (Página de teste)');
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col relative"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Elementos decorativos de fundo */}
      <div className="bg-blur-purple fixed top-20 left-10 w-64 h-64 opacity-30 pointer-events-none"></div>
      <div className="bg-blur-blue fixed bottom-20 right-10 w-80 h-80 opacity-30 pointer-events-none"></div>
      {/* BLOCO DE ANÚNCIO - LATERAL ESQUERDA (Desktop only) - 160x600 */}
      {leftAd && (
        <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-30">
          <AdBanner
            id={leftAd.id}
            productName={leftAd.productName}
            description={leftAd.description}
            image={leftAd.image}
            offers={leftAd.offers}
            dimensions={leftAd.dimensions}
          />
        </div>
      )}

      {/* BLOCO DE ANÚNCIO - LATERAL DIREITA (Desktop only) - 160x600 */}
      {rightAd && (
        <div className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-30">
          <AdBanner
            id={rightAd.id}
            productName={rightAd.productName}
            description={rightAd.description}
            image={rightAd.image}
            offers={rightAd.offers}
            dimensions={rightAd.dimensions}
          />
        </div>
      )}

      {/* BLOCO DE ANÚNCIO - TOPO - 728x90 */}
      {topAd && (
        <div className="flex justify-center" style={{ margin: '1rem auto' }}>
          <AdBanner
            id={topAd.id}
            productName={topAd.productName}
            description={topAd.description}
            image={topAd.image}
            offers={topAd.offers}
            dimensions={topAd.dimensions}
          />
        </div>
      )}

      {/* Hero Banner - Oficina de Temas */}
      <Link 
        href="/criar-tema"
        className="hero-banner"
      >
        <div className="hero-banner-overlay">
          <p className="hero-banner-text-small">Divirta-se com os amigos</p>
          <p className="hero-banner-text-main">Crie seu próprio tema</p>
          <p className="hero-banner-text-price">Por apenas R$ 1,50</p>
        </div>
      </Link>

      {/* Tripulante character - left side (desktop only) */}
      <img 
        src={tripulanteImg} 
        alt="Tripulante" 
        className="hidden md:block absolute bottom-32 left-[18%] lg:left-[22%] xl:left-[26%] h-[42vh] max-h-[420px] object-contain z-10"
      />

      {/* Impostor character - right side (desktop only) */}
      <img 
        src={impostorImg} 
        alt="Impostor" 
        className="hidden md:block absolute bottom-32 right-[18%] lg:right-[22%] xl:right-[26%] h-[42vh] max-h-[420px] object-contain z-10"
      />

      {/* Main content area - flex-grow to push footer down */}
      <div className="flex-1 flex flex-col items-center justify-center pt-20 md:pt-24 px-4 relative z-20">
        {/* Main card */}
        <div className="panel w-[90%] max-w-md animate-fade-in">
          {/* Impostor logo with characters */}
          <div className="flex justify-center mb-3">
            <img src={logoImpostor} alt="Impostor" className="h-28 md:h-36 object-contain" />
          </div>

          {/* Form */}
          <div className="space-y-3">
            {/* Nickname input */}
            <input
              type="text"
              placeholder="Seu nickname"
              value={name}
              onChange={(e) => setNameInput(e.target.value)}
              className="input-dark"
            />

            {/* Create room button */}
            <button 
              onClick={handleCreate} 
              className="btn btn-orange w-full justify-center"
            >
              <Zap size={20} />
              CRIAR SALA
            </button>

            {/* Save nickname checkbox */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveNicknameChecked}
                  onChange={(e) => setSaveNicknameChecked(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#e8a045]"
                />
                <span className="text-sm text-[#8aa0b0]">Guardar nickname</span>
              </label>
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-[#4a6a8a]"></div>
              <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
              <div className="flex-1 h-px bg-[#4a6a8a]"></div>
            </div>

            {/* Code input and Enter button */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="CÓDIGO"
                value={code}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                maxLength={4}
                className="input-code flex-1"
              />
              <button 
                onClick={handleJoin}
                className="btn btn-cta"
              >
                ENTRAR
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* BLOCO DE ANÚNCIO - RODAPÉ - 728x90 */}
      {bottomAd && (
        <div className="flex justify-center" style={{ margin: '1rem auto' }}>
          <AdBanner
            id={bottomAd.id}
            productName={bottomAd.productName}
            description={bottomAd.description}
            image={bottomAd.image}
            offers={bottomAd.offers}
            dimensions={bottomAd.dimensions}
          />
        </div>
      )}

      {/* Footer - now below the content, takes full width */}
      <div className="w-full text-center py-6 px-4 bg-gradient-to-t from-black/40 to-transparent z-20 relative border-t border-[#3d4a5c]/30">
        <img src={logoTikjogos} alt="TikJogos" className="h-4 md:h-5 mx-auto mb-2" />
        <p className="text-[#6a8aaa] text-xs">
          Desenvolvido com <Heart className="inline w-3 h-3 text-gray-500 fill-current" /> por <span className="text-[#8aa0b0]">Rodrigo Freitas</span>
        </p>
        <div className="flex items-center justify-center gap-2 text-xs mt-1 flex-wrap">
          <Link href="/blog" className="text-[#6a8aaa] hover:text-white transition-colors">
            Blog
          </Link>
          <span className="text-[#4a6a8a]">|</span>
          <Link href="/privacidade" className="text-[#6a8aaa] hover:text-white transition-colors">
            Privacidade
          </Link>
          <span className="text-[#4a6a8a]">|</span>
          <Link href="/termos" className="text-[#6a8aaa] hover:text-white transition-colors">
            Termos
          </Link>
        </div>
        <p className="text-[#4a6a8a] text-[10px] mt-2 leading-relaxed max-w-md mx-auto">
          Página de teste - Sistema de anúncios TikJogos
        </p>
      </div>
    </div>
  );
}
