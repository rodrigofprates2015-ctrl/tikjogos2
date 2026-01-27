import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
    __adPushed?: boolean;
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
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`adsense-container my-8 overflow-hidden flex justify-center ${className}`}>
      <ins
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
