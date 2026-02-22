import { useEffect } from "react";
import { Link } from "wouter";
import { Gamepad2, Rocket, CheckCircle2, HelpCircle, Lightbulb, Palette, Users, Eye } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SideAds, BottomAd } from "@/components/AdSense";
import { useLanguage } from "@/hooks/useLanguage";
import logoImpostorArt from "@/assets/logo_impostor_art.png";

const CONTENT = {
  pt: {
    badge: 'GUIA DO JOGADOR',
    heroTitle: 'Como jogar',
    heroHighlight: 'Desenho do Impostor',
    heroDesc: 'Uma variante do Jogo do Impostor onde todos desenham a mesma palavra — menos o impostor, que não sabe qual é!',
    quickStart: 'Início Rápido',
    steps: [
      { num: '1', title: 'Crie uma Sala', desc: 'Digite seu nickname e clique em "Criar Sala" no modo Desenho' },
      { num: '2', title: 'Convide Amigos', desc: 'Compartilhe o código da sala com 4 a 10 jogadores' },
      { num: '3', title: 'Desenhe e Descubra', desc: 'Todos desenham a palavra secreta. Descubra quem é o impostor pelo desenho!' },
    ],
    rulesTitle: 'Como Funciona',
    rules: [
      { color: 'purple', label: 'SORTEIO', desc: 'Um jogador é escolhido aleatoriamente como impostor. Todos os outros recebem a mesma palavra secreta para desenhar.' },
      { color: 'blue', label: 'DESENHO', desc: 'Cada jogador tem um tempo limitado para desenhar. O impostor precisa blefar — ele não sabe a palavra, mas precisa fingir que sabe!' },
      { color: 'amber', label: 'DISCUSSÃO', desc: 'Após todos desenharem, os jogadores analisam os desenhos e discutem quem parece não saber a palavra.' },
      { color: 'red', label: 'VOTAÇÃO', desc: 'Todos votam em quem acham que é o impostor. Se a maioria acertar, a tripulação vence. Se errarem, o impostor vence!' },
    ],
    tipsTitle: 'Estratégias',
    tipsCrewTitle: 'Para a Tripulação',
    tipsCrew: [
      { title: 'Observe os traços', desc: 'Procure por desenhos que não fazem sentido com a palavra. Traços vagos ou genéricos podem indicar o impostor.' },
      { title: 'Compare os desenhos', desc: 'Se todos desenharam algo parecido e um desenho destoa, esse jogador pode ser o impostor.' },
      { title: 'Cuidado com pistas demais', desc: 'Não desenhe algo tão óbvio que o impostor consiga adivinhar a palavra pelo seu desenho.' },
    ],
    tipsImpostorTitle: 'Para o Impostor',
    tipsImpostor: [
      { title: 'Desenhe vagamente', desc: 'Linhas abstratas e formas genéricas são menos reveladoras do que tentar adivinhar a palavra.' },
      { title: 'Observe os outros', desc: 'Preste atenção nos desenhos dos outros jogadores para tentar descobrir a palavra e adaptar seu desenho.' },
      { title: 'Finja confiança', desc: 'Na discussão, aja como se soubesse a palavra. Acuse outros jogadores para desviar a atenção.' },
    ],
    exampleTitle: 'Exemplo de Rodada',
    exampleWord: 'Palavra secreta: "GATO"',
    examplePlayers: [
      { name: 'João (Tripulante)', desc: 'Desenhou um gato com bigodes e rabo', ok: true },
      { name: 'Maria (Tripulante)', desc: 'Desenhou um gato dormindo', ok: true },
      { name: 'Pedro (IMPOSTOR)', desc: 'Desenhou um animal genérico com 4 patas', ok: false },
      { name: 'Ana (Tripulante)', desc: 'Desenhou um gato com bola de lã', ok: true },
    ],
    exampleResult: 'Os jogadores perceberam que o desenho de Pedro era genérico demais e votaram nele. Tripulação venceu!',
    faqTitle: 'Perguntas Frequentes',
    faqs: [
      { q: 'O impostor pode ver os desenhos dos outros?', a: 'Depende do modo! Em alguns modos os desenhos são revelados ao final, em outros durante a rodada.' },
      { q: 'E se eu não sei desenhar?', a: 'Não precisa ser artista! Desenhos simples funcionam. O importante é que faça sentido com a palavra.' },
      { q: 'O impostor pode chutar a palavra?', a: 'Sim! Se o impostor adivinhar a palavra durante a discussão, ele pode ganhar pontos extras.' },
      { q: 'Quantos jogadores são necessários?', a: 'Mínimo 4 jogadores para uma boa experiência. Máximo 10.' },
    ],
    playNow: 'Jogar Agora',
  },
  en: {
    badge: 'PLAYER GUIDE',
    heroTitle: 'How to play',
    heroHighlight: 'Impostor Drawing',
    heroDesc: 'A variant of the Impostor Game where everyone draws the same word — except the impostor, who doesn\'t know what it is!',
    quickStart: 'Quick Start',
    steps: [
      { num: '1', title: 'Create a Room', desc: 'Enter your nickname and click "Create Room" in Drawing mode' },
      { num: '2', title: 'Invite Friends', desc: 'Share the room code with 4 to 10 players' },
      { num: '3', title: 'Draw and Discover', desc: 'Everyone draws the secret word. Find out who the impostor is by their drawing!' },
    ],
    rulesTitle: 'How It Works',
    rules: [
      { color: 'purple', label: 'DRAW', desc: 'One player is randomly chosen as the impostor. All others receive the same secret word to draw.' },
      { color: 'blue', label: 'DRAWING', desc: 'Each player has limited time to draw. The impostor must bluff — they don\'t know the word but must pretend they do!' },
      { color: 'amber', label: 'DISCUSSION', desc: 'After everyone draws, players analyze the drawings and discuss who seems not to know the word.' },
      { color: 'red', label: 'VOTING', desc: 'Everyone votes on who they think is the impostor. If the majority is right, the crew wins. If wrong, the impostor wins!' },
    ],
    tipsTitle: 'Strategies',
    tipsCrewTitle: 'For the Crew',
    tipsCrew: [
      { title: 'Watch the strokes', desc: 'Look for drawings that don\'t make sense with the word. Vague or generic strokes may indicate the impostor.' },
      { title: 'Compare drawings', desc: 'If everyone drew something similar and one drawing stands out, that player might be the impostor.' },
      { title: 'Don\'t give too many clues', desc: 'Don\'t draw something so obvious that the impostor can guess the word from your drawing.' },
    ],
    tipsImpostorTitle: 'For the Impostor',
    tipsImpostor: [
      { title: 'Draw vaguely', desc: 'Abstract lines and generic shapes are less revealing than trying to guess the word.' },
      { title: 'Watch others', desc: 'Pay attention to other players\' drawings to try to figure out the word and adapt yours.' },
      { title: 'Fake confidence', desc: 'During discussion, act like you know the word. Accuse other players to divert attention.' },
    ],
    exampleTitle: 'Round Example',
    exampleWord: 'Secret word: "CAT"',
    examplePlayers: [
      { name: 'João (Crew)', desc: 'Drew a cat with whiskers and tail', ok: true },
      { name: 'Maria (Crew)', desc: 'Drew a sleeping cat', ok: true },
      { name: 'Pedro (IMPOSTOR)', desc: 'Drew a generic 4-legged animal', ok: false },
      { name: 'Ana (Crew)', desc: 'Drew a cat with a yarn ball', ok: true },
    ],
    exampleResult: 'Players noticed Pedro\'s drawing was too generic and voted for him. Crew wins!',
    faqTitle: 'FAQ',
    faqs: [
      { q: 'Can the impostor see others\' drawings?', a: 'It depends on the mode! In some modes drawings are revealed at the end, in others during the round.' },
      { q: 'What if I can\'t draw?', a: 'You don\'t need to be an artist! Simple drawings work. What matters is that it makes sense with the word.' },
      { q: 'Can the impostor guess the word?', a: 'Yes! If the impostor guesses the word during discussion, they can earn extra points.' },
      { q: 'How many players are needed?', a: 'Minimum 4 players for a good experience. Maximum 10.' },
    ],
    playNow: 'Play Now',
  },
  es: {
    badge: 'GUÍA DEL JUGADOR',
    heroTitle: 'Cómo jugar',
    heroHighlight: 'Dibujo del Impostor',
    heroDesc: '¡Una variante del Juego del Impostor donde todos dibujan la misma palabra — excepto el impostor, que no sabe cuál es!',
    quickStart: 'Inicio Rápido',
    steps: [
      { num: '1', title: 'Crea una Sala', desc: 'Escribe tu nickname y haz clic en "Crear Sala" en modo Dibujo' },
      { num: '2', title: 'Invita Amigos', desc: 'Comparte el código de la sala con 4 a 10 jugadores' },
      { num: '3', title: 'Dibuja y Descubre', desc: '¡Todos dibujan la palabra secreta. Descubre quién es el impostor por su dibujo!' },
    ],
    rulesTitle: 'Cómo Funciona',
    rules: [
      { color: 'purple', label: 'SORTEO', desc: 'Un jugador es elegido aleatoriamente como impostor. Todos los demás reciben la misma palabra secreta para dibujar.' },
      { color: 'blue', label: 'DIBUJO', desc: 'Cada jugador tiene tiempo limitado para dibujar. ¡El impostor debe farolear — no sabe la palabra pero debe fingir que sí!' },
      { color: 'amber', label: 'DISCUSIÓN', desc: 'Después de que todos dibujen, los jugadores analizan los dibujos y discuten quién parece no saber la palabra.' },
      { color: 'red', label: 'VOTACIÓN', desc: '¡Todos votan a quién creen que es el impostor. Si la mayoría acierta, la tripulación gana. Si se equivocan, el impostor gana!' },
    ],
    tipsTitle: 'Estrategias',
    tipsCrewTitle: 'Para la Tripulación',
    tipsCrew: [
      { title: 'Observa los trazos', desc: 'Busca dibujos que no tengan sentido con la palabra. Trazos vagos o genéricos pueden indicar al impostor.' },
      { title: 'Compara los dibujos', desc: 'Si todos dibujaron algo parecido y un dibujo desentona, ese jugador puede ser el impostor.' },
      { title: 'Cuidado con dar muchas pistas', desc: 'No dibujes algo tan obvio que el impostor pueda adivinar la palabra por tu dibujo.' },
    ],
    tipsImpostorTitle: 'Para el Impostor',
    tipsImpostor: [
      { title: 'Dibuja vagamente', desc: 'Líneas abstractas y formas genéricas son menos reveladoras que intentar adivinar la palabra.' },
      { title: 'Observa a los demás', desc: 'Presta atención a los dibujos de otros jugadores para intentar descubrir la palabra y adaptar el tuyo.' },
      { title: 'Finge confianza', desc: 'En la discusión, actúa como si supieras la palabra. Acusa a otros jugadores para desviar la atención.' },
    ],
    exampleTitle: 'Ejemplo de Ronda',
    exampleWord: 'Palabra secreta: "GATO"',
    examplePlayers: [
      { name: 'João (Tripulante)', desc: 'Dibujó un gato con bigotes y cola', ok: true },
      { name: 'Maria (Tripulante)', desc: 'Dibujó un gato durmiendo', ok: true },
      { name: 'Pedro (IMPOSTOR)', desc: 'Dibujó un animal genérico con 4 patas', ok: false },
      { name: 'Ana (Tripulante)', desc: 'Dibujó un gato con bola de lana', ok: true },
    ],
    exampleResult: '¡Los jugadores notaron que el dibujo de Pedro era demasiado genérico y votaron por él. La tripulación ganó!',
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      { q: '¿El impostor puede ver los dibujos de los demás?', a: '¡Depende del modo! En algunos modos los dibujos se revelan al final, en otros durante la ronda.' },
      { q: '¿Y si no sé dibujar?', a: '¡No necesitas ser artista! Los dibujos simples funcionan. Lo importante es que tenga sentido con la palabra.' },
      { q: '¿El impostor puede adivinar la palabra?', a: '¡Sí! Si el impostor adivina la palabra durante la discusión, puede ganar puntos extras.' },
      { q: '¿Cuántos jugadores se necesitan?', a: 'Mínimo 4 jugadores para una buena experiencia. Máximo 10.' },
    ],
    playNow: 'Jugar Ahora',
  },
};

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400' },
  blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
  amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400' },
  red: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-400' },
};

export default function ComoJogarDesenho() {
  const { lang, langPath } = useLanguage();
  const c = CONTENT[lang as keyof typeof CONTENT] || CONTENT.pt;

  useEffect(() => {
    document.title = `${c.heroTitle} ${c.heroHighlight} - TikJogos`;
    window.scrollTo(0, 0);
  }, [lang]);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#1a1b2e' }}>
      <MobileNav />
      <SideAds />
      <BottomAd />

      <main className="flex-grow pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <header className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-2xl border-2 border-purple-500/20 text-purple-400 font-black text-sm uppercase tracking-widest mb-6">
              <Palette className="w-5 h-5" /> {c.badge}
            </div>
            <div className="flex justify-center mb-4">
              <img src={logoImpostorArt} alt="Logo Desenho do Impostor" width={200} height={200} className="h-20 md:h-28 object-contain" />
            </div>
            <h1 className="text-4xl md:text-6xl text-white font-black mb-6 leading-none">
              {c.heroTitle} <span className="text-purple-500">{c.heroHighlight}</span>
            </h1>
            <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium">{c.heroDesc}</p>
          </header>

          {/* Quick Start */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <Rocket className="text-purple-500" /> {c.quickStart}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {c.steps.map((step, i) => (
                <div key={i} className="bg-[#242642] p-8 rounded-[3rem] border-4 border-[#2f3252] relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                  <span className="absolute -top-4 -right-4 text-9xl font-black text-white/5 group-hover:text-purple-500/10 transition-colors leading-none">{step.num}</span>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-xl font-black text-white mb-6 relative z-10">{step.num}</div>
                  <h3 className="text-2xl font-black text-white mb-4 relative z-10">{step.title}</h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Rules */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <CheckCircle2 className="text-purple-500" /> {c.rulesTitle}
            </h2>
            <div className="space-y-6">
              {c.rules.map((rule, i) => {
                const cm = colorMap[rule.color] || colorMap.purple;
                return (
                  <div key={i} className={`${cm.bg} p-6 rounded-3xl border-2 ${cm.border}`}>
                    <h4 className={`${cm.text} font-black mb-2`}>{rule.label}</h4>
                    <p className="text-slate-300 font-medium">{rule.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Example */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <Eye className="text-amber-500" /> {c.exampleTitle}
            </h2>
            <div className="bg-[#242642] p-6 md:p-8 rounded-[2rem] border-4 border-[#2f3252]">
              <p className="text-xl font-black text-purple-400 mb-6">{c.exampleWord}</p>
              <div className="space-y-3">
                {c.examplePlayers.map((p, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${p.ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{p.ok ? '✅' : '❌'}</span>
                      <span className="font-black text-white">{p.name}</span>
                    </div>
                    <p className="text-slate-400 text-sm ml-8">{p.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-emerald-400 font-medium">{c.exampleResult}</p>
            </div>
          </section>

          {/* Tips - Crew */}
          <section className="mb-12">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <Lightbulb className="text-purple-500" /> {c.tipsTitle}
            </h2>
            <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-2"><Users size={20} /> {c.tipsCrewTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {c.tipsCrew.map((tip, i) => (
                <div key={i} className="bg-[#242642] p-6 rounded-[2rem] border-4 border-[#2f3252] hover:border-emerald-500/50 transition-colors">
                  <h4 className="text-lg font-black text-white mb-2">{tip.title}</h4>
                  <p className="text-slate-400 font-medium text-sm">{tip.desc}</p>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-black text-red-400 mb-6 flex items-center gap-2"><Eye size={20} /> {c.tipsImpostorTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {c.tipsImpostor.map((tip, i) => (
                <div key={i} className="bg-[#242642] p-6 rounded-[2rem] border-4 border-[#2f3252] hover:border-red-500/50 transition-colors">
                  <h4 className="text-lg font-black text-white mb-2">{tip.title}</h4>
                  <p className="text-slate-400 font-medium text-sm">{tip.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-24 mt-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <HelpCircle className="text-purple-500" /> {c.faqTitle}
            </h2>
            <div className="space-y-4">
              {c.faqs.map((faq, i) => (
                <div key={i} className="bg-[#242642] p-6 rounded-2xl border-2 border-[#2f3252]">
                  <h4 className="text-white font-black mb-2">{faq.q}</h4>
                  <p className="text-slate-400 font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <Link href={langPath("/desenho-impostor")}>
              <button className="px-12 py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white border-b-[6px] border-purple-800 hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all shadow-2xl">
                {c.playNow}
              </button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
