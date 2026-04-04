import { useEffect, useRef } from "react";
import { Sparkles, Zap, BookOpen, ExternalLink } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

function pushAd(ref: React.MutableRefObject<boolean>) {
  if (ref.current) return;
  const timer = setTimeout(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      ref.current = true;
    } catch (e) {
      console.error("NativeAd push error:", e);
    }
  }, 150);
  return () => clearTimeout(timer);
}

// Card patrocinado que imita visualmente os cards de tema da página /temas
// Deve ser renderizado como filho direto do grid para herdar o layout
export const NativeThemeAd = () => {
  const pushed = useRef(false);

  useEffect(() => pushAd(pushed), []);

  return (
    <article className="bg-gradient-to-br from-purple-900/40 to-blue-900/30 rounded-[2.5rem] border-4 border-purple-500/40 overflow-hidden shadow-xl">
      <div className="p-6 sm:p-8 flex flex-col h-full">
        {/* Badge patrocinado */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full w-fit">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-purple-400 font-black text-[10px] uppercase tracking-widest">
              Patrocinado
            </span>
          </div>
        </div>

        {/* Ad unit */}
        <div className="flex-1 flex items-center justify-center min-h-[160px] overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", minHeight: "120px" }}
            data-ad-client="ca-pub-9927561573478881"
            data-ad-slot="4766433750"
            data-ad-format="fluid"
            data-ad-layout-key="-fg+b+v-54+5s"
          />
        </div>
      </div>
    </article>
  );
};

// Card patrocinado horizontal que aparece abaixo do seletor de jogo em ImpostorGame
// Imita o estilo visual do card principal do jogo
export const NativeGameModeAd = () => {
  const pushed = useRef(false);

  useEffect(() => pushAd(pushed), []);

  return (
    <div className="w-[90%] max-w-md mb-4">
      <div className="bg-gradient-to-br from-[#1e1545]/80 to-[#1a2a40]/80 rounded-3xl border-2 border-purple-500/30 overflow-hidden shadow-xl">
        {/* Header do card */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/40 rounded-full">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-purple-400 font-black text-[9px] uppercase tracking-widest">
              Patrocinado
            </span>
          </div>
        </div>

        {/* Ad unit */}
        <div className="px-2 pb-3 overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-9927561573478881"
            data-ad-slot="9215812637"
            data-ad-format="fluid"
            data-ad-layout="in-article"
          />
        </div>
      </div>
    </div>
  );
};

// Seção "Leia também" ao final do blog — imita links de artigos relacionados
// Um dos "links" é na verdade o slot de ad nativo fluido
export const ContextualLinksAd = () => {
  const pushed = useRef(false);

  useEffect(() => pushAd(pushed), []);

  const relatedLinks = [
    { text: "Como identificar o impostor em 3 rodadas", href: "/blog/identificar-impostor-rapido" },
    { text: "Melhores estratégias para o Jogo do Impostor", href: "/blog/estrategias-impostor" },
    { text: "Jogo do Impostor no PC: guia completo", href: "/blog/jogo-do-impostor-pc" },
  ];

  return (
    <div className="mt-8 bg-[#1a1b2e]/60 rounded-3xl border-2 border-[#2f3252] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2f3252]">
        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <BookOpen className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-white font-black text-sm uppercase tracking-wider">
          Leia Também
        </span>
      </div>

      {/* Related article links */}
      <ul className="divide-y divide-[#2f3252]/60">
        {relatedLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-purple-500/5 transition-colors group"
            >
              <span className="text-slate-300 font-semibold text-sm group-hover:text-purple-400 transition-colors leading-snug">
                {link.text}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
            </a>
          </li>
        ))}

        {/* Sponsored slot — visually consistent with the article links above */}
        <li className="relative">
          <div className="absolute top-2 right-3 z-10">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Patrocinado
            </span>
          </div>
          <div className="px-2 py-1 overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-9927561573478881"
              data-ad-slot="4766433750"
              data-ad-format="fluid"
              data-ad-layout-key="-fg+b+v-54+5s"
            />
          </div>
        </li>
      </ul>
    </div>
  );
};
