import { useEffect, useRef, useState } from "react";
import { X, ChevronUp } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseProps {
  className?: string;
  slot: string;
  format?: string;
  layout?: string;
  layoutKey?: string;
  responsive?: boolean;
}

const AdSenseBlock = ({ 
  className = "", 
  slot, 
  format = "auto", 
  layout, 
  layoutKey, 
  responsive = true 
}: AdSenseProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Só faz push uma vez por instância do componente
    if (pushed.current) return;
    
    const timer = setTimeout(() => {
      try {
        // Inicializa o array se não existir
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushed.current = true;
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }, 100); // Pequeno delay para garantir que o <ins> está no DOM

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`adsense-container my-8 overflow-hidden flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minWidth: "250px" }}
        data-ad-client="ca-pub-9927561573478881"
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export const BlogAd = () => (
  <AdSenseBlock 
    slot="2913946988" 
    layout="in-article" 
    format="fluid" 
    className="blog-ad"
  />
);

export const OutrosJogosAd = () => (
  <AdSenseBlock 
    slot="4766433750" 
    layoutKey="-fg+b+v-54+5s" 
    format="fluid" 
    className="outros-jogos-ad"
  />
);

export const DisplayAd = ({ className, format = "auto" }: { className?: string; format?: "auto" | "horizontal" | "vertical" | "rectangle" }) => (
  <AdSenseBlock 
    slot="7536067322" 
    format={format} 
    className={className}
  />
);

// Anúncios laterais verticais fixos
export const SideAds = () => {
  const leftPushed = useRef(false);
  const rightPushed = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        if (!leftPushed.current) {
          window.adsbygoogle.push({});
          leftPushed.current = true;
        }
        if (!rightPushed.current) {
          window.adsbygoogle.push({});
          rightPushed.current = true;
        }
      } catch (e) {
        console.error("SideAds push error:", e);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Left Side Ad */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "160px", height: "600px" }}
          data-ad-client="ca-pub-9927561573478881"
          data-ad-slot="7536067322"
          data-ad-format="vertical"
        />
      </div>
      {/* Right Side Ad */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "160px", height: "600px" }}
          data-ad-client="ca-pub-9927561573478881"
          data-ad-slot="7536067322"
          data-ad-format="vertical"
        />
      </div>
    </>
  );
};

// Anúncio inferior com botão de esconder
export const BottomAd = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || isMinimized) return;
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushed.current = true;
      } catch (e) {
        console.error("BottomAd push error:", e);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isMinimized]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${isMinimized ? "translate-y-full" : ""}`}>
      {/* Botão para mostrar quando minimizado */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2 text-sm font-bold"
        >
          <ChevronUp className="w-4 h-4" />
          Mostrar Anúncio
        </button>
      )}
      
      {/* Container do anúncio */}
      <div className="bg-[#1a1b2e] border-t-2 border-purple-500/30 p-2 relative">
        {/* Botão de fechar/minimizar */}
        <button
          onClick={() => setIsMinimized(true)}
          className="absolute -top-8 right-4 bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded-t-lg flex items-center gap-1 text-xs font-medium"
        >
          <X className="w-3 h-3" />
          Esconder
        </button>
        
        <div className="max-w-4xl mx-auto">
          <ins
            className="adsbygoogle"
            style={{ display: "block", height: "90px" }}
            data-ad-client="ca-pub-9927561573478881"
            data-ad-slot="7536067322"
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
};

// Anúncio fluido para o Blog
export const BlogFluidAd = ({ className }: { className?: string }) => {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushed.current = true;
      } catch (e) {
        console.error("BlogFluidAd push error:", e);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`adsense-container my-8 overflow-hidden ${className || ""}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client="ca-pub-9927561573478881"
        data-ad-slot="9215812637"
      />
    </div>
  );
};
