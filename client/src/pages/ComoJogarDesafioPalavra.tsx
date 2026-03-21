import { useEffect } from "react";
import { Link } from "wouter";
import { Gamepad2, Rocket, Swords, CheckCircle2, HelpCircle, Lightbulb, Trophy, Users } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SideAds, BottomAd } from "@/components/AdSense";
import { useLanguage } from "@/hooks/useLanguage";
import logoDesafio from "@assets/logo_desafio_palavra_forms.webp";

const CONTENT = {
  pt: {
    badge: 'GUIA DO JOGADOR',
    heroTitle: 'Como jogar',
    heroHighlight: 'Desafio da Palavra',
    heroDesc: 'Um jogo de letras multiplayer onde cada jogador adiciona uma letra por vez para formar uma palavra — mas cuidado com os blefes!',
    quickStart: 'Início Rápido',
    steps: [
      { num: '1', title: 'Crie uma Sala', desc: 'Digite seu nickname e clique em "Criar Sala" na home' },
      { num: '2', title: 'Convide Amigos', desc: 'Compartilhe o código de 3 letras com 2 a 8 jogadores' },
      { num: '3', title: 'Adicione Letras', desc: 'Na sua vez, adicione uma letra ao fragmento na mesa' },
    ],
    rulesTitle: 'Como Funciona',
    rules: [
      { color: 'violet', label: 'ADICIONAR LETRA', desc: 'Na sua vez, escolha uma letra pelo teclado. Ela é adicionada ao fragmento atual. Você deve ter uma palavra real em mente que comece com esse fragmento.' },
      { color: 'yellow', label: 'DESAFIAR', desc: 'Em vez de adicionar uma letra, você pode desafiar o jogador anterior. Isso significa que você acha que o fragmento atual não leva a nenhuma palavra válida.' },
      { color: 'emerald', label: 'DEFENDER', desc: 'Quando desafiado, você deve revelar a palavra que tinha em mente. Se for válida, o desafiante perde uma vida. Se não existir, você perde.' },
    ],
    exampleTitle: 'Exemplo de Rodada',
    exampleWord: 'Fragmento na mesa: "TRAN"',
    examplePlays: [
      { player: 'João', action: 'Adiciona "Q" → "TRANQ"', note: 'Tem "TRANQUILO" em mente', ok: true },
      { player: 'Maria', action: 'Desafia João!', note: 'Acha que "TRANQ" não leva a nada', ok: false },
      { player: 'João', action: 'Revela "TRANQUILO"', note: 'Palavra válida → Maria perde ❤️', ok: true },
    ],
    exampleNote: 'O fragmento não precisa ser o início da palavra — pode ser qualquer posição, desde que você tenha uma palavra real em mente!',
    livesTitle: 'Sistema de Vidas',
    livesItems: [
      { label: 'Cada jogador começa com 3 ❤️', desc: 'Perder um duelo = perder uma vida' },
      { label: 'Sem vidas = eliminado', desc: 'O jogo continua com os jogadores restantes' },
      { label: 'Último vivo vence', desc: 'O jogador que sobrar com pelo menos 1 vida ganha a partida' },
    ],
    tipsTitle: 'Estratégias para Ganhar',
    tips: [
      { title: 'Blefe com cuidado', desc: 'Adicione letras que parecem difíceis mas você tem uma palavra em mente. Isso pressiona os outros a desafiar.' },
      { title: 'Desafie na hora certa', desc: 'Desafie quando o fragmento parecer impossível de completar — mas tenha certeza, pois errar custa uma vida.' },
      { title: 'Palavras longas são seguras', desc: 'Quanto mais longa a palavra que você tem em mente, mais letras pode adicionar sem medo de ser desafiado.' },
      { title: 'Observe os adversários', desc: 'Jogadores hesitantes ou que adicionam letras incomuns provavelmente estão blefando.' },
    ],
    turnTitle: 'Ordem dos Turnos',
    turnDesc: 'A ordem é definida no início e nunca muda: 1→2→3→1→2→3. Mesmo que alguém perca uma vida, a sequência continua igual — o jogador eliminado é simplesmente pulado.',
    faqTitle: 'Perguntas Frequentes',
    faqs: [
      { q: 'O fragmento precisa ser o início da palavra?', a: 'Sim! A palavra revelada no desafio deve começar com o fragmento exato que está na mesa.' },
      { q: 'Posso usar nomes próprios?', a: 'Não. Apenas palavras comuns do dicionário português são válidas.' },
      { q: 'O que acontece se eu não conseguir revelar uma palavra?', a: 'Você perde uma vida e o fragmento é zerado para a próxima rodada.' },
      { q: 'Quantos jogadores precisam para jogar?', a: 'Mínimo 2, máximo 8 jogadores.' },
    ],
    playNow: 'Jogar Agora',
  },
  en: {
    badge: 'PLAYER GUIDE',
    heroTitle: 'How to play',
    heroHighlight: 'Word Challenge',
    heroDesc: 'A multiplayer letter game where each player adds one letter at a time to build a word — but watch out for bluffs!',
    quickStart: 'Quick Start',
    steps: [
      { num: '1', title: 'Create a Room', desc: 'Enter your nickname and click "Create Room" on the home page' },
      { num: '2', title: 'Invite Friends', desc: 'Share the 3-letter code with 2 to 8 players' },
      { num: '3', title: 'Add Letters', desc: 'On your turn, add a letter to the fragment on the table' },
    ],
    rulesTitle: 'How It Works',
    rules: [
      { color: 'violet', label: 'ADD A LETTER', desc: 'On your turn, choose a letter from the keyboard. It is added to the current fragment. You must have a real word in mind that starts with this fragment.' },
      { color: 'yellow', label: 'CHALLENGE', desc: 'Instead of adding a letter, you can challenge the previous player. This means you think the current fragment cannot lead to any valid word.' },
      { color: 'emerald', label: 'DEFEND', desc: 'When challenged, you must reveal the word you had in mind. If it\'s valid, the challenger loses a life. If it doesn\'t exist, you lose.' },
    ],
    exampleTitle: 'Round Example',
    exampleWord: 'Fragment on table: "TRAN"',
    examplePlays: [
      { player: 'João', action: 'Adds "Q" → "TRANQ"', note: 'Has "TRANQUIL" in mind', ok: true },
      { player: 'Maria', action: 'Challenges João!', note: 'Thinks "TRANQ" leads nowhere', ok: false },
      { player: 'João', action: 'Reveals "TRANQUIL"', note: 'Valid word → Maria loses ❤️', ok: true },
    ],
    exampleNote: 'The fragment must be the start of the word — the revealed word must begin with the exact fragment on the table.',
    livesTitle: 'Lives System',
    livesItems: [
      { label: 'Each player starts with 3 ❤️', desc: 'Losing a duel = losing a life' },
      { label: 'No lives = eliminated', desc: 'The game continues with remaining players' },
      { label: 'Last one standing wins', desc: 'The player left with at least 1 life wins the match' },
    ],
    tipsTitle: 'Strategies to Win',
    tips: [
      { title: 'Bluff carefully', desc: 'Add letters that seem hard but you have a word in mind. This pressures others to challenge.' },
      { title: 'Challenge at the right time', desc: 'Challenge when the fragment seems impossible to complete — but be sure, because being wrong costs a life.' },
      { title: 'Long words are safe', desc: 'The longer the word you have in mind, the more letters you can add without fear of being challenged.' },
      { title: 'Watch your opponents', desc: 'Hesitant players or those adding unusual letters are probably bluffing.' },
    ],
    turnTitle: 'Turn Order',
    turnDesc: 'The order is set at the start and never changes: 1→2→3→1→2→3. Even if someone loses a life, the sequence stays the same — eliminated players are simply skipped.',
    faqTitle: 'FAQ',
    faqs: [
      { q: 'Does the fragment need to be the start of the word?', a: 'Yes! The word revealed in a challenge must begin with the exact fragment on the table.' },
      { q: 'Can I use proper nouns?', a: 'No. Only common dictionary words are valid.' },
      { q: 'What if I can\'t reveal a word?', a: 'You lose a life and the fragment resets for the next round.' },
      { q: 'How many players are needed?', a: 'Minimum 2, maximum 8 players.' },
    ],
    playNow: 'Play Now',
  },
  es: {
    badge: 'GUÍA DEL JUGADOR',
    heroTitle: 'Cómo jugar',
    heroHighlight: 'Desafío de la Palabra',
    heroDesc: 'Un juego de letras multijugador donde cada jugador añade una letra a la vez para formar una palabra — ¡pero cuidado con los faros!',
    quickStart: 'Inicio Rápido',
    steps: [
      { num: '1', title: 'Crea una Sala', desc: 'Escribe tu nickname y haz clic en "Crear Sala" en la página principal' },
      { num: '2', title: 'Invita Amigos', desc: 'Comparte el código de 3 letras con 2 a 8 jugadores' },
      { num: '3', title: 'Añade Letras', desc: 'En tu turno, añade una letra al fragmento en la mesa' },
    ],
    rulesTitle: 'Cómo Funciona',
    rules: [
      { color: 'violet', label: 'AÑADIR LETRA', desc: 'En tu turno, elige una letra del teclado. Se añade al fragmento actual. Debes tener una palabra real en mente que comience con ese fragmento.' },
      { color: 'yellow', label: 'DESAFIAR', desc: 'En lugar de añadir una letra, puedes desafiar al jugador anterior. Esto significa que crees que el fragmento actual no lleva a ninguna palabra válida.' },
      { color: 'emerald', label: 'DEFENDER', desc: 'Cuando te desafían, debes revelar la palabra que tenías en mente. Si es válida, el desafiante pierde una vida. Si no existe, pierdes tú.' },
    ],
    exampleTitle: 'Ejemplo de Ronda',
    exampleWord: 'Fragmento en la mesa: "TRAN"',
    examplePlays: [
      { player: 'João', action: 'Añade "Q" → "TRANQ"', note: 'Tiene "TRANQUILO" en mente', ok: true },
      { player: 'Maria', action: '¡Desafía a João!', note: 'Cree que "TRANQ" no lleva a nada', ok: false },
      { player: 'João', action: 'Revela "TRANQUILO"', note: 'Palabra válida → Maria pierde ❤️', ok: true },
    ],
    exampleNote: 'El fragmento debe ser el inicio de la palabra — la palabra revelada debe comenzar con el fragmento exacto en la mesa.',
    livesTitle: 'Sistema de Vidas',
    livesItems: [
      { label: 'Cada jugador empieza con 3 ❤️', desc: 'Perder un duelo = perder una vida' },
      { label: 'Sin vidas = eliminado', desc: 'El juego continúa con los jugadores restantes' },
      { label: 'El último en pie gana', desc: 'El jugador que quede con al menos 1 vida gana la partida' },
    ],
    tipsTitle: 'Estrategias para Ganar',
    tips: [
      { title: 'Farolea con cuidado', desc: 'Añade letras que parezcan difíciles pero tengas una palabra en mente. Esto presiona a los demás a desafiar.' },
      { title: 'Desafía en el momento correcto', desc: 'Desafía cuando el fragmento parezca imposible de completar — pero asegúrate, porque equivocarte cuesta una vida.' },
      { title: 'Las palabras largas son seguras', desc: 'Cuanto más larga sea la palabra que tienes en mente, más letras puedes añadir sin miedo a ser desafiado.' },
      { title: 'Observa a tus rivales', desc: 'Los jugadores que dudan o añaden letras inusuales probablemente están faroleando.' },
    ],
    turnTitle: 'Orden de Turnos',
    turnDesc: 'El orden se define al inicio y nunca cambia: 1→2→3→1→2→3. Aunque alguien pierda una vida, la secuencia sigue igual — los jugadores eliminados simplemente se saltan.',
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      { q: '¿El fragmento debe ser el inicio de la palabra?', a: 'Sí. La palabra revelada en el desafío debe comenzar con el fragmento exacto en la mesa.' },
      { q: '¿Puedo usar nombres propios?', a: 'No. Solo son válidas palabras comunes del diccionario.' },
      { q: '¿Qué pasa si no puedo revelar una palabra?', a: 'Pierdes una vida y el fragmento se reinicia para la siguiente ronda.' },
      { q: '¿Cuántos jugadores se necesitan?', a: 'Mínimo 2, máximo 8 jugadores.' },
    ],
    playNow: 'Jugar Ahora',
  },
};

const colorMap: Record<string, string> = {
  violet: 'bg-violet-500/20 border-violet-500 text-violet-300',
  yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
  emerald: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
  blue: 'bg-blue-500/20 border-blue-500 text-blue-300',
  amber: 'bg-amber-500/20 border-amber-500 text-amber-300',
};

export default function ComoJogarDesafioPalavra() {
  const { lang, langPath } = useLanguage();
  const c = CONTENT[lang as keyof typeof CONTENT] || CONTENT.pt;

  useEffect(() => {
    document.title = `${c.heroTitle} ${c.heroHighlight} - TikJogos`;
    window.scrollTo(0, 0);
  }, [lang]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#1a1b2e]">
      <MobileNav />
      <SideAds />
      <BottomAd />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-10 space-y-12">

        {/* Hero */}
        <section className="text-center space-y-4">
          <span className="inline-block text-violet-400 font-black uppercase tracking-widest text-xs border border-violet-500/40 rounded-full px-3 py-1">
            {c.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            {c.heroTitle}{' '}
            <span className="text-violet-400">{c.heroHighlight}</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">{c.heroDesc}</p>
          <div className="flex justify-center pt-2">
            <img src={logoDesafio} alt="Desafio da Palavra" className="h-20 object-contain" />
          </div>
        </section>

        {/* Quick Start */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Rocket className="text-violet-400 w-6 h-6" /> {c.quickStart}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {c.steps.map(s => (
              <div key={s.num} className="bg-[#242642] rounded-2xl p-5 border border-[#2f3252] flex flex-col gap-2">
                <span className="text-3xl font-black text-violet-400">{s.num}</span>
                <p className="font-black text-white">{s.title}</p>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="text-violet-400 w-6 h-6" /> {c.rulesTitle}
          </h2>
          <div className="space-y-3">
            {c.rules.map(r => (
              <div key={r.label} className={`rounded-2xl p-4 border ${colorMap[r.color]} flex gap-4 items-start`}>
                <span className="font-black text-xs mt-0.5 whitespace-nowrap">{r.label}</span>
                <p className="text-sm text-slate-300">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Swords className="text-yellow-400 w-6 h-6" /> {c.exampleTitle}
          </h2>
          <div className="bg-[#242642] rounded-2xl border border-[#2f3252] overflow-hidden">
            <div className="bg-[#1a1c2e] px-5 py-3 text-violet-300 font-black text-sm">{c.exampleWord}</div>
            <div className="divide-y divide-[#2f3252]">
              {c.examplePlays.map((p, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${p.ok ? 'text-emerald-400' : 'text-yellow-400'}`} />
                  <div>
                    <p className="text-white font-bold text-sm">{p.player}: <span className="text-slate-300 font-normal">{p.action}</span></p>
                    <p className="text-slate-500 text-xs">{p.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-slate-400 text-sm bg-[#1a1c2e] rounded-xl px-4 py-3 border border-[#2f3252]">{c.exampleNote}</p>
        </section>

        {/* Lives */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="text-yellow-400 w-6 h-6" /> {c.livesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {c.livesItems.map((item, i) => (
              <div key={i} className="bg-[#242642] rounded-2xl p-4 border border-[#2f3252] space-y-1">
                <p className="font-black text-white text-sm">{item.label}</p>
                <p className="text-slate-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Turn order */}
        <section className="space-y-3">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-violet-400 w-6 h-6" /> {c.turnTitle}
          </h2>
          <p className="text-slate-400 text-sm bg-[#242642] rounded-2xl px-5 py-4 border border-[#2f3252]">{c.turnDesc}</p>
        </section>

        {/* Tips */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-400 w-6 h-6" /> {c.tipsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {c.tips.map(tip => (
              <div key={tip.title} className="bg-[#242642] rounded-2xl p-4 border border-[#2f3252] space-y-1">
                <p className="font-black text-white text-sm">{tip.title}</p>
                <p className="text-slate-400 text-xs">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <HelpCircle className="text-violet-400 w-6 h-6" /> {c.faqTitle}
          </h2>
          <div className="space-y-3">
            {c.faqs.map(faq => (
              <div key={faq.q} className="bg-[#242642] rounded-2xl p-4 border border-[#2f3252]">
                <p className="font-black text-white text-sm mb-1">{faq.q}</p>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex justify-center pb-6">
          <Link href={langPath('/')}>
            <button className="px-10 py-5 rounded-2xl font-black text-xl border-b-[6px] bg-gradient-to-r from-violet-600 to-purple-600 border-violet-900 text-white hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all shadow-2xl">
              {c.playNow}
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
}
