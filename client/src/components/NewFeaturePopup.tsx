import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'wouter';

interface NewFeaturePopupProps {
  onClose?: () => void;
}

const NewFeaturePopup: React.FC<NewFeaturePopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [, setLocation] = useLocation();

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

  const handleImageClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
      setLocation('/apoie');
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100 bg-black/80 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-20'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      >
        {/* Botão Fechar */}
        <button 
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-50 p-2.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-900 text-slate-400 hover:text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {/* Imagem do Popup - clica para ir para /apoie */}
        <img 
          src="/Popup.png" 
          alt="Apoie o TikJogos"
          className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl cursor-pointer"
          onClick={handleImageClick}
        />
      </div>
    </div>
  );
};

export default NewFeaturePopup;
