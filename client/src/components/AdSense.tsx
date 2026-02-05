import { useEffect, useRef } from "react";

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

export const DisplayAd = ({ className }: { className?: string }) => (
  <AdSenseBlock 
    slot="7536067322" 
    format="auto" 
    className={className}
  />
);
