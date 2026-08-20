import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Gamepad2, Heart, Sparkles, Users } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SideAds } from "@/components/AdSense";
import logoTikjogos from "@assets/logo_nova_tikjogos (1).png";
import "./support-home.css?animation=2";

const initialSupport = { goal: 300, raised: 50, remaining: 250, percentage: 17, supporters: ["@ana.games", "@joaozinho", "@lu_costa"] };

type SupportHomeProps = {
  embedded?: boolean;
};

export default function SupportHome({ embedded = false }: SupportHomeProps) {
  const [support, setSupport] = useState(initialSupport);

  useEffect(() => {
    if (!embedded) {
      document.title = "Ajude o TikJogos a criar novos jogos";
      document.querySelector('meta[name="description"]')?.setAttribute("content", "Apoie voluntariamente o desenvolvimento de novos jogos e melhorias para o TikJogos.");
    }
    fetch('/api/support-summary')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setSupport)
      .catch(() => setSupport(initialSupport));
  }, [embedded]);

  return (
    <div className={`${embedded ? "w-full" : "min-h-screen w-full"} bg-[#1a1b2e] text-white selection:bg-purple-500/30`}>
      {!embedded && <SideAds />}
      {!embedded && <MobileNav />}
      {!embedded && <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-12rem] right-[-8rem] h-96 w-96 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute bottom-[-12rem] left-[-8rem] h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
      </div>}

      <main className={`relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 ${embedded ? "pt-8 md:pt-12" : "pt-10 md:pt-16"}`}>
        <section className="launch-goal animate-fade-in" aria-labelledby="goal-title">
          <div className="launch-goal__flare launch-goal__flare--one" aria-hidden="true">✦</div>
          <div className="launch-goal__flare launch-goal__flare--two" aria-hidden="true">✦</div>
          <div className="launch-goal__top">
            <div className="launch-goal__message">
              <span className="launch-goal__kicker">A comunidade faz o jogo acontecer</span>
              <h2 id="goal-title">Ajude a lançar o <strong>Bomba!</strong></h2>
              <p>Cada contribuição nos aproxima do lançamento. Quando a barra chegar a 100%, o novo jogo será liberado para todos.</p>
            </div>
            <div className="launch-goal__target"><span>Meta</span><strong>R$ {support.goal.toLocaleString('pt-BR')}</strong></div>
          </div>
          <div className="launch-goal__progress-row">
            <div className="launch-goal__heart" aria-hidden="true"><Heart /></div>
            <div className="launch-goal__track" role="progressbar" aria-valuenow={support.raised} aria-valuemin={0} aria-valuemax={support.goal} aria-label={`R$ ${support.raised} arrecadados de R$ ${support.goal}`}>
              <div className="launch-goal__fill" style={{ width: `${support.percentage}%` }} />
            </div>
            <div className="launch-goal__amount"><strong>R$ {support.raised.toLocaleString('pt-BR')}</strong><span>/ R$ {support.goal.toLocaleString('pt-BR')}</span></div>
            <div className="launch-goal__percent"><strong>{support.percentage}%</strong><span>da meta</span></div>
          </div>
          <div className="launch-goal__footer">
            <p><Sparkles aria-hidden="true" /> Faltam <strong>R$ {support.remaining.toLocaleString('pt-BR')}</strong> para o lançamento</p>
            <Link href="/doacoes" className="launch-goal__cta" data-testid="button-support-launch"><Heart className="h-6 w-6 fill-current" /> Apoie via PIX</Link>
            <small>Qualquer valor faz a diferença.</small>
          </div>
        </section>

        <section className="mt-8">
          <div className="support-panel supporter-panel" aria-labelledby="supporters-title">
            <div className="flex items-center gap-3"><Users className="h-7 w-7 text-purple-400" /><h2 id="supporters-title" className="text-2xl font-black">Quem está ajudando a construir o TikJogos</h2></div>
            <p className="mt-3 text-sm text-slate-400">Deixe seu @ no mural, conecte-se com outros jogadores e faça parte da comunidade.</p>
            <div className="supporter-wall">
              {support.supporters.map((supporter, index) => <span key={supporter} className={`supporter-name supporter-name--${index % 6}`}>{supporter}</span>)}
              <span className="supporter-you">@você?</span>
            </div>
          </div>
        </section>

      </main>

      {!embedded && <footer className="relative z-10 w-full border-t-8 border-[#242642] bg-[#0f172a] py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:text-left">
          <div><img src={logoTikjogos} alt="TikJogos" className="h-12 w-auto" /><p className="mt-3 max-w-md text-sm font-medium text-slate-400">Jogos gratuitos feitos para reunir amigos, rir e criar boas histórias.</p></div>
          <div className="flex flex-wrap justify-center gap-5 text-sm font-bold text-slate-300">
            <Link href="/blog" className="hover:text-purple-400">Blog</Link><Link href="/comojogar" className="hover:text-purple-400">Como jogar</Link><Link href="/termos" className="hover:text-purple-400">Termos</Link><Link href="/privacidade" className="hover:text-purple-400">Privacidade</Link>
          </div>
        </div>
      </footer>}
    </div>
  );
}
