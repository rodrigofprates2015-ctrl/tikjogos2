import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Zap, Ghost, Star, HelpCircle } from 'lucide-react';

interface NewFeaturePopupProps {
  onClose?: () => void;
}

const NewFeaturePopup: React.FC<NewFeaturePopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100 bg-black/80 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      {/* Container Principal */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm transform transition-all duration-500 ${
          isVisible ? 'scale-100 rotate-0 translate-y-0' : 'scale-90 translate-y-20'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      >
        
        {/* Card TikJogos Style */}
        <div className="relative bg-[#242642] rounded-[3rem] overflow-visible border-4 border-[#2f3252] shadow-2xl">
          
          {/* Botão Fechar */}
          <button 
            onClick={handleClose}
            className="absolute top-5 right-5 z-50 p-2.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-900 text-slate-400 hover:text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <X size={20} strokeWidth={3} />
          </button>

          {/* === HEADER: Gradiente e Personagem === */}
          <div className="relative h-72 rounded-t-[2.7rem] bg-gradient-to-b from-[#8b5cf6] to-[#242642] overflow-visible flex items-end justify-center border-b-4 border-[#2f3252]/50">
            
            {/* PERSONAGEM (Pop-out effect) */}
            <div className="relative z-10 -mb-8 transform hover:scale-105 transition-transform duration-500 cursor-pointer drop-shadow-2xl animate-bounce">
              <img 
                src="https://raw.githubusercontent.com/rodrigofprates2015-ctrl/tikjogos2/main/client/src/assets/Gemini_Generated_Image_ntup4sntup4sntup.png" 
                alt="Personagem"
                className="w-56 h-56 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback */}
              <div className="hidden w-40 h-40 bg-white/10 backdrop-blur-md rounded-3xl items-center justify-center border-4 border-white/20 animate-bounce">
                <Ghost size={64} className="text-white" />
              </div>
            </div>

            {/* Badge "NOVO" */}
            <div className="absolute top-8 left-6 rotate-[-6deg] bg-[#facc15] text-[#422006] font-black px-4 py-1.5 text-sm shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border-2 border-[#422006]/20 rounded-xl z-20 animate-pulse">
              NOVO! ✨
            </div>
            {/* Badge "v2.0" */}
            <div className="absolute bottom-16 right-6 rotate-[6deg] bg-[#f43f5e] text-white font-black px-3 py-1 rounded-xl text-xs shadow-[0_4px_0_0_#9f1239] border-2 border-white/20 z-20">
              v2.0
            </div>

          </div>

          {/* === CONTEÚDO === */}
          <div className="px-6 pb-8 pt-12 text-center relative">
            
            <h2 className="text-3xl font-black text-[#facc15] mb-3 uppercase tracking-tight drop-shadow-md">
              NOVIDADE
            </h2>
            
            <p className="text-slate-400 text-sm mb-6 font-medium leading-relaxed px-2">
              Assuma o controle! Configure dicas para o impostor, ative o modo hardcore e escolha a quantidade de vilões.
            </p>

            {/* Features (Tags estilo TikJogos) */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <span className="bg-[#1e2036] text-white border-2 border-[#334155] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Star size={14} className="text-[#facc15] fill-current" /> Dicas Smart
              </span>
              <span className="bg-[#1e2036] text-white border-2 border-[#334155] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <HelpCircle size={14} className="text-[#8b5cf6] fill-current" /> Modo Hardcore
              </span>
              <span className="bg-[#1e2036] text-white border-2 border-[#334155] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Zap size={14} className="text-[#f43f5e] fill-current" /> 1-5 Impostores
              </span>
            </div>

            {/* Botão TikJogos (3D Depth) */}
            <button 
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-[#22c55e] to-[#10b981] border-b-[6px] border-[#047857] text-white font-black text-lg py-4 rounded-2xl shadow-xl hover:brightness-110 active:border-b-0 active:translate-y-1.5 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span className="tracking-wide">BORA JOGAR</span>
              <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
              Toque fora para fechar
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NewFeaturePopup;
