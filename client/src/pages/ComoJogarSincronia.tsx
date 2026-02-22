import { useEffect } from "react";
import { Link } from "wouter";
import { Gamepad2, Rocket, CheckCircle2, HelpCircle, Lightbulb, Trophy, Users } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SideAds, BottomAd } from "@/components/AdSense";
import { useLanguage } from "@/hooks/useLanguage";
import sincroniaLogo from "@/assets/Sincronia.png";

const CONTENT = {
  pt: {
    badge: 'GUIA DO JOGADOR',
    heroTitle: 'Como jogar',
    heroHighlight: 'Sincronia',
    heroDesc: 'Um jogo multiplayer onde você ganha pontos ao dar a MESMA resposta que outros jogadores. Pense como a maioria!',
    quickStart: 'Início Rápido',
    steps: [
      { num: '1', title: 'Crie uma Sala', desc: 'Digite seu nickname e clique em "Criar Sala"' },
      { num: '2', title: 'Convide Amigos', desc: 'Compartilhe o código da sala com 2 a 10 jogadores' },
      { num: '3', title: 'Responda Junto', desc: 'O host inicia e todos respondem perguntas ao mesmo tempo' },
    ],
    rulesTitle: 'Como Funciona',
    rules: [
      { color: 'emerald', label: 'PERGUNTA', desc: 'Uma pergunta aparece na tela para todos os jogadores ao mesmo tempo.' },
      { color: 'blue', label: 'RESPOSTA', desc: 'Você tem 30 segundos para digitar sua resposta. Ninguém vê a resposta dos outros.' },
      { color: 'amber', label: 'RESULTADO', desc: 'Respostas iguais são agrupadas. Quem respondeu igual a outra pessoa ganha +1 ponto. Respostas únicas não pontuam.' },
    ],
    exampleTitle: 'Exemplo de Rodada',
    exampleQuestion: '"Onde todo brasileiro já foi?"',
    exampleGroups: [
      { answer: 'ESCOLA', count: 3, players: ['João', 'Maria', 'Pedro'], points: '+1 pt cada', ok: true },
      { answer: 'PRAIA', count: 2, players: ['Ana', 'Carlos'], points: '+1 pt cada', ok: true },
      { answer: 'SHOPPING', count: 1, players: ['Você'], points: '0 pts', ok: false },
    ],
    exampleNote: 'O jogo entende que "Escola", "escola" e "ESCOLA!!!" são a mesma resposta! Ele remove acentos, maiúsculas e pontuação automaticamente.',
    smartTitle: 'Sistema Inteligente',
    smartItems: [
      { label: 'Maiúsculas/Minúsculas', example: '"Escola" = "escola" = "ESCOLA"' },
      { label: 'Acentos', example: '"São Paulo" = "Sao Paulo" = "sao paulo"' },
      { label: 'Pontuação', example: '"Pizza!!!" = "Pizza?" = "Pizza"' },
      { label: 'Espaços extras', example: '"  escola  " = "escola"' },
    ],
    tipsTitle: 'Estratégias para Ganhar',
    tips: [
      { title: 'Pense como a maioria', desc: 'A resposta mais óbvia geralmente é a melhor. Não tente ser criativo!' },
      { title: 'Respostas genéricas', desc: 'Quanto mais específico, menor a chance de alguém responder igual.' },
      { title: 'Primeira coisa na cabeça', desc: 'A primeira resposta que você pensa é a que outros também vão pensar.' },
      { title: 'Conheça seu grupo', desc: 'Pense no que seus amigos responderiam, não no que você acha certo.' },
    ],
    scoringTitle: 'Pontuação',
    scoringRules: [
      '1 pessoa (resposta única) → 0 pontos',
      '2+ pessoas (resposta em comum) → +1 ponto cada',
    ],
    faqTitle: 'Perguntas Frequentes',
    faqs: [
      { q: 'E se eu errar a digitação?', a: 'Se escrever "Esola" em vez de "Escola", o jogo NÃO vai considerar igual. Cuidado ao digitar!' },
      { q: 'Posso mudar minha resposta?', a: 'Sim! Você pode editar até o tempo acabar ou clicar em "Enviar".' },
      { q: 'O que acontece se não responder?', a: 'Sua resposta será vazia e você não pontuará naquela rodada.' },
      { q: '"Arroz e feijão" é igual a "Feijão e arroz"?', a: 'Não! A ordem das palavras importa. O jogo só normaliza maiúsculas, acentos e pontuação.' },
    ],
    playNow: 'Jogar Agora',
  },
  en: {
    badge: 'PLAYER GUIDE',
    heroTitle: 'How to play',
    heroHighlight: 'Sincronia',
    heroDesc: 'A multiplayer game where you score points by giving the SAME answer as other players. Think like the majority!',
    quickStart: 'Quick Start',
    steps: [
      { num: '1', title: 'Create a Room', desc: 'Enter your nickname and click "Create Room"' },
      { num: '2', title: 'Invite Friends', desc: 'Share the room code with 2 to 10 players' },
      { num: '3', title: 'Answer Together', desc: 'The host starts and everyone answers questions at the same time' },
    ],
    rulesTitle: 'How It Works',
    rules: [
      { color: 'emerald', label: 'QUESTION', desc: 'A question appears on screen for all players at the same time.' },
      { color: 'blue', label: 'ANSWER', desc: 'You have 30 seconds to type your answer. Nobody sees other answers.' },
      { color: 'amber', label: 'RESULT', desc: 'Matching answers are grouped. If someone answered the same as you, you both get +1 point. Unique answers score nothing.' },
    ],
    exampleTitle: 'Round Example',
    exampleQuestion: '"Where has every Brazilian been?"',
    exampleGroups: [
      { answer: 'SCHOOL', count: 3, players: ['João', 'Maria', 'Pedro'], points: '+1 pt each', ok: true },
      { answer: 'BEACH', count: 2, players: ['Ana', 'Carlos'], points: '+1 pt each', ok: true },
      { answer: 'MALL', count: 1, players: ['You'], points: '0 pts', ok: false },
    ],
    exampleNote: 'The game understands that "School", "school" and "SCHOOL!!!" are the same answer! It removes accents, capitalization and punctuation automatically.',
    smartTitle: 'Smart System',
    smartItems: [
      { label: 'Upper/Lowercase', example: '"School" = "school" = "SCHOOL"' },
      { label: 'Accents', example: '"São Paulo" = "Sao Paulo" = "sao paulo"' },
      { label: 'Punctuation', example: '"Pizza!!!" = "Pizza?" = "Pizza"' },
      { label: 'Extra spaces', example: '"  school  " = "school"' },
    ],
    tipsTitle: 'Strategies to Win',
    tips: [
      { title: 'Think like the majority', desc: 'The most obvious answer is usually the best. Don\'t try to be creative!' },
      { title: 'Generic answers', desc: 'The more specific you are, the less likely someone will answer the same.' },
      { title: 'First thing in mind', desc: 'The first answer you think of is what others will think too.' },
      { title: 'Know your group', desc: 'Think about what your friends would answer, not what you think is right.' },
    ],
    scoringTitle: 'Scoring',
    scoringRules: [
      '1 person (unique answer) → 0 points',
      '2+ people (common answer) → +1 point each',
    ],
    faqTitle: 'FAQ',
    faqs: [
      { q: 'What if I make a typo?', a: 'If you write "Scool" instead of "School", the game will NOT match them. Be careful typing!' },
      { q: 'Can I change my answer?', a: 'Yes! You can edit until time runs out or you click "Submit".' },
      { q: 'What if I don\'t answer?', a: 'Your answer will be empty and you won\'t score that round.' },
      { q: 'Is "Rice and beans" the same as "Beans and rice"?', a: 'No! Word order matters. The game only normalizes capitalization, accents and punctuation.' },
    ],
    playNow: 'Play Now',
  },
  es: {
    badge: 'GUÍA DEL JUGADOR',
    heroTitle: 'Cómo jugar',
    heroHighlight: 'Sincronia',
    heroDesc: 'Un juego multijugador donde ganas puntos al dar la MISMA respuesta que otros jugadores. ¡Piensa como la mayoría!',
    quickStart: 'Inicio Rápido',
    steps: [
      { num: '1', title: 'Crea una Sala', desc: 'Escribe tu nickname y haz clic en "Crear Sala"' },
      { num: '2', title: 'Invita Amigos', desc: 'Comparte el código de la sala con 2 a 10 jugadores' },
      { num: '3', title: 'Responde Junto', desc: 'El host inicia y todos responden preguntas al mismo tiempo' },
    ],
    rulesTitle: 'Cómo Funciona',
    rules: [
      { color: 'emerald', label: 'PREGUNTA', desc: 'Una pregunta aparece en pantalla para todos los jugadores al mismo tiempo.' },
      { color: 'blue', label: 'RESPUESTA', desc: 'Tienes 30 segundos para escribir tu respuesta. Nadie ve las respuestas de los demás.' },
      { color: 'amber', label: 'RESULTADO', desc: 'Las respuestas iguales se agrupan. Si alguien respondió igual que tú, ambos ganan +1 punto. Las respuestas únicas no puntúan.' },
    ],
    exampleTitle: 'Ejemplo de Ronda',
    exampleQuestion: '"¿Dónde ha ido todo brasileño?"',
    exampleGroups: [
      { answer: 'ESCUELA', count: 3, players: ['João', 'Maria', 'Pedro'], points: '+1 pt c/u', ok: true },
      { answer: 'PLAYA', count: 2, players: ['Ana', 'Carlos'], points: '+1 pt c/u', ok: true },
      { answer: 'CENTRO COMERCIAL', count: 1, players: ['Tú'], points: '0 pts', ok: false },
    ],
    exampleNote: '¡El juego entiende que "Escuela", "escuela" y "ESCUELA!!!" son la misma respuesta! Elimina acentos, mayúsculas y puntuación automáticamente.',
    smartTitle: 'Sistema Inteligente',
    smartItems: [
      { label: 'Mayúsculas/Minúsculas', example: '"Escuela" = "escuela" = "ESCUELA"' },
      { label: 'Acentos', example: '"São Paulo" = "Sao Paulo" = "sao paulo"' },
      { label: 'Puntuación', example: '"Pizza!!!" = "Pizza?" = "Pizza"' },
      { label: 'Espacios extras', example: '"  escuela  " = "escuela"' },
    ],
    tipsTitle: 'Estrategias para Ganar',
    tips: [
      { title: 'Piensa como la mayoría', desc: 'La respuesta más obvia suele ser la mejor. ¡No intentes ser creativo!' },
      { title: 'Respuestas genéricas', desc: 'Cuanto más específico seas, menos probable que alguien responda igual.' },
      { title: 'Lo primero que pienses', desc: 'La primera respuesta que piensas es la que otros también pensarán.' },
      { title: 'Conoce a tu grupo', desc: 'Piensa en lo que tus amigos responderían, no en lo que crees correcto.' },
    ],
    scoringTitle: 'Puntuación',
    scoringRules: [
      '1 persona (respuesta única) → 0 puntos',
      '2+ personas (respuesta en común) → +1 punto c/u',
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      { q: '¿Y si cometo un error al escribir?', a: 'Si escribes "Escuea" en vez de "Escuela", el juego NO lo considerará igual. ¡Cuidado al escribir!' },
      { q: '¿Puedo cambiar mi respuesta?', a: 'Sí, puedes editar hasta que se acabe el tiempo o hagas clic en "Enviar".' },
      { q: '¿Qué pasa si no respondo?', a: 'Tu respuesta será vacía y no puntuarás en esa ronda.' },
      { q: '¿"Arroz con frijoles" es igual a "Frijoles con arroz"?', a: 'No. El orden de las palabras importa. El juego solo normaliza mayúsculas, acentos y puntuación.' },
    ],
    playNow: 'Jugar Ahora',
  },
};

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
  amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400' },
};

export default function ComoJogarSincronia() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/10 rounded-2xl border-2 border-emerald-500/20 text-emerald-400 font-black text-sm uppercase tracking-widest mb-6">
              <Gamepad2 className="w-5 h-5" /> {c.badge}
            </div>
            <div className="flex justify-center mb-4">
              <img src={sincroniaLogo} alt="Logo Sincronia" width={500} height={120} className="h-20 md:h-28 object-contain" />
            </div>
            <h1 className="text-4xl md:text-6xl text-white font-black mb-6 leading-none">
              {c.heroTitle} <span className="text-emerald-500">{c.heroHighlight}</span>
            </h1>
            <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium">{c.heroDesc}</p>
          </header>

          {/* Quick Start */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <Rocket className="text-emerald-500" /> {c.quickStart}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {c.steps.map((step, i) => (
                <div key={i} className="bg-[#242642] p-8 rounded-[3rem] border-4 border-[#2f3252] relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                  <span className="absolute -top-4 -right-4 text-9xl font-black text-white/5 group-hover:text-emerald-500/10 transition-colors leading-none">{step.num}</span>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-xl font-black text-white mb-6 relative z-10">{step.num}</div>
                  <h3 className="text-2xl font-black text-white mb-4 relative z-10">{step.title}</h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Rules */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <CheckCircle2 className="text-emerald-500" /> {c.rulesTitle}
            </h2>
            <div className="space-y-6">
              {c.rules.map((rule, i) => {
                const cm = colorMap[rule.color] || colorMap.emerald;
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
              <Lightbulb className="text-amber-500" /> {c.exampleTitle}
            </h2>
            <div className="bg-[#242642] p-6 md:p-8 rounded-[2rem] border-4 border-[#2f3252]">
              <p className="text-xl font-black text-white mb-6">{c.exampleQuestion}</p>
              <div className="space-y-3">
                {c.exampleGroups.map((g, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${g.ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-white text-lg">{g.ok ? '✅' : '❌'} {g.answer} ({g.count} {g.count === 1 ? 'pessoa' : 'pessoas'})</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{g.points}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {g.players.map((p, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-lg text-xs font-bold bg-[#1a2a3a] text-gray-400">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-emerald-400 font-medium">{c.exampleNote}</p>
            </div>
          </section>

          {/* Smart System */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <CheckCircle2 className="text-blue-500" /> {c.smartTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {c.smartItems.map((item, i) => (
                <div key={i} className="bg-[#242642] p-5 rounded-2xl border-2 border-[#2f3252]">
                  <h4 className="text-blue-400 font-black mb-1 text-sm">{item.label}</h4>
                  <p className="text-white font-mono text-sm">{item.example}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Scoring */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <Trophy className="text-yellow-500" /> {c.scoringTitle}
            </h2>
            <div className="bg-[#242642] p-6 rounded-[2rem] border-4 border-[#2f3252] space-y-3">
              {c.scoringRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">{i === 0 ? '❌' : '✅'}</span>
                  <span className="text-white font-bold">{rule}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <Lightbulb className="text-emerald-500" /> {c.tipsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {c.tips.map((tip, i) => (
                <div key={i} className="bg-[#242642] p-6 rounded-[2rem] border-4 border-[#2f3252] hover:border-emerald-500/50 transition-colors">
                  <h3 className="text-xl font-black text-white mb-2">{tip.title}</h3>
                  <p className="text-slate-400 font-medium">{tip.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-24">
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
            <Link href={langPath("/")}>
              <button className="px-12 py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-[6px] border-emerald-800 hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all shadow-2xl">
                {c.playNow}
              </button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
