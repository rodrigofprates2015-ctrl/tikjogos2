import { useEffect } from "react";
import { Link } from "wouter";
import { Clock3, Gamepad2, Heart, Sparkles, Users } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import logoTikjogos from "@assets/logo_nova_tikjogos (1).png";
import "./support-home.css";

const supporters = [
  "@ana.games", "@joaozinho", "@lu_costa",
];

function BombDemo() {
  return (
    <div className="bomb-demo" aria-label="Demonstração animada de uma rodada do Bomba!">
      <div className="bomb-demo__status">
        <span className="bomb-demo__eyebrow">DEMONSTRAÇÃO AUTOMÁTICA</span>
        <span className="bomb-demo__timer"><Clock3 className="h-4 w-4" /> 10s</span>
      </div>
      <div className="bomb-demo__stage">
        <div className="bomb-demo__theme"><span>TEMA SORTEADO</span><strong>🥤 BEBIDAS</strong></div>
        <div className="bomb-demo__turn bomb-demo__turn--one"><span>LIA ESCOLHEU</span><strong>C</strong><em>COCA!</em></div>
        <div className="bomb-demo__turn bomb-demo__turn--two"><span>RAFA ESCOLHEU</span><strong>S</strong><em>SUCO!</em></div>
        <div className="bomb-demo__letters" aria-hidden="true">
          <span>A</span><span>B</span><span className="letter-c">C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span><span>I</span><span>J</span><span>K</span><span>L</span><span>M</span><span>N</span><span>O</span><span>P</span><span>Q</span><span>R</span><span className="letter-s">S</span><span>T</span><span>U</span><span>V</span><span>W</span><span>X</span><span>Y</span><span>Z</span>
        </div>
        <div className="bomb-demo__boom">💥 BOOM!</div>
        <div className="bomb-demo__players" aria-hidden="true">
          <div className="bomb-player bomb-player--one"><span>🧑</span><small>Lia</small></div>
          <div className="bomb-player bomb-player--two"><span>🧔</span><small>Rafa</small></div>
          <div className="bomb-player bomb-player--three"><span>👩</span><small>Bia</small></div>
          <div className="bomb-player bomb-player--four"><span>🧑‍🦱</span><small>Caio</small></div>
          <div className="bomb-demo__bomb">💣</div>
        </div>
      </div>
      <div className="bomb-demo__caption">
        <span>O tema é sorteado</span><span>O jogador escolhe uma letra</span><span>Responde e elimina a letra</span><span>A vez passa até explodir</span>
      </div>
    </div>
  );
}

export default function SupportHome() {
  useEffect(() => {
    document.title = "Ajude o TikJogos a criar novos jogos";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Conheça o Bomba!, o próximo jogo do TikJogos, e apoie voluntariamente seu desenvolvimento.");
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#1a1b2e] text-white selection:bg-purple-500/30">
      <MobileNav />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-12rem] right-[-8rem] h-96 w-96 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute bottom-[-12rem] left-[-8rem] h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 md:pt-16">
        <section className="mx-auto mb-8 max-w-3xl text-center animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-300">
            <Sparkles className="h-4 w-4" /> O próximo jogo está sendo criado
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">Ajude o TikJogos a criar <span className="text-purple-400">novos jogos.</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
            O TikJogos continua gratuito para todo mundo. Quem apoia ajuda nossa pequena equipe a transformar novas ideias em jogos para curtir com os amigos.
          </p>
        </section>

        <section className="support-game-card animate-fade-in" aria-labelledby="bomba-title">
          <div className="support-game-card__intro">
            <div className="support-game-card__icon" aria-hidden="true">💣</div>
            <div>
              <span className="text-sm font-black uppercase tracking-[0.18em] text-purple-300">Próximo lançamento</span>
              <h2 id="bomba-title" className="mt-1 text-4xl font-black sm:text-5xl">Bomba!</h2>
              <p className="mt-2 text-lg font-semibold text-slate-200">O jogo de palavras com timer explosivo para jogar com os amigos.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="space-y-5 text-slate-300">
              <h3 className="text-2xl font-black text-white">Como funciona?</h3>
              <p className="leading-relaxed">Um tema é sorteado — por exemplo, bebidas. Na sua vez, escolha uma letra ainda disponível e diga uma resposta do tema que comece com ela: C de Coca, S de Suco.</p>
              <p className="leading-relaxed">A letra usada é eliminada e a bomba passa para o próximo jogador. A rodada continua até completar o alfabeto ou o tempo acabar. Quem estiver com a bomba quando ela explodir perde a rodada.</p>
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">Esta é apenas uma prévia visual. O Bomba! poderá ser jogado quando for oficialmente lançado.</div>
            </div>
            <BombDemo />
          </div>
        </section>

        <section className="mt-8 grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <div className="support-panel" aria-labelledby="goal-title">
            <div className="flex items-start justify-between gap-4">
              <div><span className="text-sm font-black uppercase tracking-[0.16em] text-purple-300">Meta para o lançamento</span><h2 id="goal-title" className="mt-2 text-3xl font-black">R$ 50 <span className="text-lg text-slate-400">de R$ 300</span></h2></div>
              <Heart className="h-8 w-8 fill-amber-400 text-amber-400" />
            </div>
            <div className="mt-6 h-5 overflow-hidden rounded-full border-2 border-[#3b3e63] bg-[#151629] p-0.5" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={300}>
              <div className="h-full w-[16.67%] rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 shadow-[0_0_18px_rgba(192,132,252,0.45)]" />
            </div>
            <div className="mt-3 flex justify-between text-sm font-bold text-slate-400"><span>17% da meta</span><span>Faltam R$ 250</span></div>
            <p className="mt-5 text-sm leading-relaxed text-slate-300">O apoio é voluntário e ajuda no desenvolvimento, na arte e na infraestrutura. Todos os jogos continuarão gratuitos.</p>
            <Link href="/doacoes" className="btn-orange mt-6 w-full" data-testid="button-support-launch"><Heart className="h-5 w-5" /> Apoiar o lançamento</Link>
          </div>

          <div className="support-panel supporter-panel" aria-labelledby="supporters-title">
            <div className="flex items-center gap-3"><Users className="h-7 w-7 text-purple-400" /><h2 id="supporters-title" className="text-2xl font-black">Quem está ajudando a construir o TikJogos</h2></div>
            <p className="mt-3 text-sm text-slate-400">Um mural de assinaturas da nossa comunidade.</p>
            <div className="supporter-wall">
              {supporters.map((supporter, index) => <span key={supporter} className={`supporter-name supporter-name--${index % 6}`}>{supporter}</span>)}
              <span className="supporter-you">@você?</span>
            </div>
          </div>
        </section>

        <section className="support-play-cta mt-8 text-center">
          <Gamepad2 className="mx-auto h-10 w-10 text-cyan-300" />
          <h2 className="mt-3 text-3xl font-black">Prefere jogar?</h2>
          <p className="mt-2 font-medium text-slate-300">Os jogos continuam gratuitos.</p>
          <Link href="/jogos" className="btn-green mx-auto mt-6 inline-flex min-w-56 items-center justify-center gap-2 text-center" data-testid="button-go-to-games"><Gamepad2 className="h-5 w-5 shrink-0" aria-hidden="true" /><span>Quero jogar</span></Link>
        </section>
      </main>

      <footer className="relative z-10 w-full border-t-8 border-[#242642] bg-[#0f172a] py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:text-left">
          <div><img src={logoTikjogos} alt="TikJogos" className="h-12 w-auto" /><p className="mt-3 max-w-md text-sm font-medium text-slate-400">Jogos gratuitos feitos para reunir amigos, rir e criar boas histórias.</p></div>
          <div className="flex flex-wrap justify-center gap-5 text-sm font-bold text-slate-300">
            <Link href="/blog" className="hover:text-purple-400">Blog</Link><Link href="/comojogar" className="hover:text-purple-400">Como jogar</Link><Link href="/termos" className="hover:text-purple-400">Termos</Link><Link href="/privacidade" className="hover:text-purple-400">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
