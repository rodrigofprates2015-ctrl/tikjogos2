import { useEffect } from "react";
import { Link } from "wouter";
import { 
  Rocket, 
  Users, 
  Gamepad2, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Layers, 
  Package, 
  HelpCircle,
  Youtube,
  Instagram,
  MessageCircle
} from "lucide-react";
import { MobileNav } from "@/components/MobileNav";

export default function ComoJogar() {
  useEffect(() => {
    document.title = "Como Jogar - TikJogos Impostor";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#1a1b2e' }}>
      {/* Navigation */}
      <MobileNav />

      <main className="flex-grow pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <header className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-2xl border-2 border-purple-500/20 text-purple-400 font-black text-sm uppercase tracking-widest mb-6">
              <Gamepad2 className="w-5 h-5" /> MANUAL DO TRIPULANTE
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-black mb-6 leading-none">
              Como Jogar <span className="text-purple-500">TikJogos</span>
            </h1>
            <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium">
              Um jogo de dedução social online para jogar com amigos! Descubra quem é o impostor através de dicas, perguntas e muita estratégia.
            </p>
          </header>

          {/* Quick Start Steps */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4 uppercase tracking-tighter">
              <Rocket className="text-purple-500" /> Início Rápido
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Crie uma Sala', desc: 'Digite seu nickname e clique em "Criar Sala"' },
                { num: '2', title: 'Convide Amigos', desc: 'Compartilhe o código da sala com 3 ou mais jogadores' },
                { num: '3', title: 'Escolha o Modo', desc: 'O host seleciona a modalidade e inicia o jogo' }
              ].map((step, i) => (
                <div key={i} className="bg-[#242642] p-8 rounded-[3rem] border-4 border-[#2f3252] relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                  <span className="absolute -top-4 -right-4 text-9xl font-black text-white/5 group-hover:text-purple-500/10 transition-colors leading-none">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-xl font-black text-white mb-6 relative z-10">
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 relative z-10">{step.title}</h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Basic Rules */}
          <section className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                <CheckCircle2 className="text-emerald-500" /> Regras Básicas
              </h2>
              <div className="space-y-6">
                <div className="bg-emerald-500/5 p-6 rounded-3xl border-2 border-emerald-500/20">
                  <h4 className="text-emerald-400 font-black mb-2">TRIPULANTES</h4>
                  <p className="text-slate-300 font-medium">Recebem informações secretas e devem descobrir quem é o impostor através de votação.</p>
                </div>
                <div className="bg-rose-500/5 p-6 rounded-3xl border-2 border-rose-500/20">
                  <h4 className="text-rose-400 font-black mb-2">IMPOSTOR</h4>
                  <p className="text-slate-300 font-medium">Não recebe a informação secreta e deve fingir que a conhece para não ser descoberto.</p>
                </div>
                <div className="bg-blue-500/5 p-6 rounded-3xl border-2 border-blue-500/20">
                  <h4 className="text-blue-400 font-black mb-2">VOTAÇÃO</h4>
                  <p className="text-slate-300 font-medium">Após a discussão, todos votam em quem acham que é o impostor. O mais votado é eliminado!</p>
                </div>
              </div>
            </div>
            <div className="bg-[#242642] rounded-[3rem] border-4 border-[#2f3252] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-purple-500 to-rose-500"></div>
              <Users size={80} className="text-slate-700 mb-8" />
              <p className="text-white text-2xl font-black mb-4">A união faz a força... ou a traição perfeita.</p>
              <p className="text-slate-400 font-medium">Um jogo para 3 a 15 jogadores em tempo real.</p>
            </div>
          </section>

          {/* Modalidades Section */}
          <section className="space-y-16">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4">Modalidades de Jogo</h2>
              <p className="text-slate-400 text-xl font-medium">Cada missão tem seus próprios perigos e estratégias.</p>
            </div>

            <div className="space-y-24">
              {/* Palavra Secreta */}
              <GameModeSection
                icon={<Layers className="text-emerald-500 w-8 h-8" />}
                iconBg="bg-emerald-500/10 border-emerald-500/20"
                title="Palavra Secreta"
                description="O modo clássico do jogo! Todos os tripulantes recebem a mesma palavra secreta, exceto o impostor que não sabe qual é."
                steps={[
                  'Todos os jogadores recebem uma palavra, exceto o impostor',
                  'Os tripulantes devem dar dicas sobre a palavra sem revelá-la diretamente',
                  'O impostor deve fingir que conhece a palavra e tentar descobrir qual é',
                  'Após as rodadas de dicas, todos votam em quem acham que é o impostor'
                ]}
                tips={[
                  { color: 'yellow', text: 'Tripulantes: dêem dicas sutis, não muito óbvias' },
                  { color: 'yellow', text: 'Impostor: preste atenção nas dicas dos outros para descobrir a palavra' },
                  { color: 'rose', text: 'Cuidado com dicas muito específicas que podem entregar a palavra ao impostor' }
                ]}
                tipsColor="yellow"
              />

              {/* Locais & Funções */}
              <GameModeSection
                icon={<MapPin className="text-blue-500 w-8 h-8" />}
                iconBg="bg-blue-500/10 border-blue-500/20"
                title="Locais & Funções"
                description="Cada jogador recebe um local e uma função específica. O impostor não sabe o local, mas precisa fingir que sabe!"
                steps={[
                  'Tripulantes recebem um local (ex: Hospital) e uma função (ex: Médico)',
                  'O impostor não sabe qual é o local',
                  'Os jogadores fazem perguntas uns aos outros sobre o local',
                  'O impostor deve tentar descobrir o local pelas respostas dos outros'
                ]}
                tips={[
                  { color: 'blue', text: 'Faça perguntas que só quem conhece o local saberia responder' },
                  { color: 'rose', text: 'Impostor: evite dar respostas muito genéricas ou muito específicas' },
                  { color: 'blue', text: 'Observe quem parece confuso com as perguntas' }
                ]}
                tipsColor="blue"
                reverse
              />

              {/* Duas Facções */}
              <GameModeSection
                icon={<Users className="text-orange-500 w-8 h-8" />}
                iconBg="bg-orange-500/10 border-orange-500/20"
                title="Duas Facções"
                description="Os jogadores são divididos em dois times, cada um com uma palavra diferente. O impostor não pertence a nenhum time!"
                steps={[
                  'Metade dos jogadores recebe a Palavra A, outra metade a Palavra B',
                  'O impostor não sabe nenhuma das duas palavras',
                  'Cada time tenta identificar quem são seus aliados',
                  'O impostor tenta se infiltrar em um dos times'
                ]}
                tips={[
                  { color: 'orange', text: 'Tente descobrir quem tem a mesma palavra que você' },
                  { color: 'rose', text: 'Cuidado para não revelar sua palavra ao time adversário' },
                  { color: 'orange', text: 'O impostor pode tentar criar confusão entre os times' }
                ]}
                tipsColor="orange"
              />

              {/* Categoria + Item */}
              <GameModeSection
                icon={<Package className="text-purple-500 w-8 h-8" />}
                iconBg="bg-purple-500/10 border-purple-500/20"
                title="Categoria + Item"
                description="Todos sabem a categoria, mas só os tripulantes conhecem o item específico. O impostor sabe a categoria mas não o item!"
                steps={[
                  'Uma categoria é revelada para todos (ex: Frutas)',
                  'Tripulantes recebem um item específico da categoria (ex: Maçã)',
                  'O impostor sabe a categoria mas não o item',
                  'Os jogadores devem dar dicas sobre o item sem revelá-lo'
                ]}
                tips={[
                  { color: 'purple', text: 'Use características específicas do item para suas dicas' },
                  { color: 'purple', text: 'Impostor: tente dar dicas genéricas que se apliquem a vários itens da categoria' },
                  { color: 'rose', text: 'Atenção aos jogadores que parecem adivinhar demais' }
                ]}
                tipsColor="purple"
                reverse
              />

              {/* Perguntas Diferentes */}
              <GameModeSection
                icon={<HelpCircle className="text-rose-500 w-8 h-8" />}
                iconBg="bg-rose-500/10 border-rose-500/20"
                title="Perguntas Diferentes"
                description="Tripulantes e impostor recebem perguntas diferentes sobre o mesmo tema. As respostas revelarão quem é o impostor!"
                steps={[
                  "Tripulantes recebem uma pergunta (ex: 'Qual seu animal favorito?')",
                  'O impostor recebe uma pergunta diferente sobre tema similar',
                  'Cada jogador responde sua pergunta em voz alta',
                  'As respostas que não fazem sentido revelam o impostor'
                ]}
                tips={[
                  { color: 'rose', text: 'Preste atenção se as respostas fazem sentido com o tema' },
                  { color: 'rose', text: 'Impostor: tente dar respostas que se encaixem em várias perguntas possíveis' },
                  { color: 'purple', text: 'Compare as respostas entre os jogadores' }
                ]}
                tipsColor="rose"
              />
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-32 p-16 rounded-[4rem] bg-gradient-to-br from-[#242642] to-[#1a1b2e] border-4 border-purple-500 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl text-white font-black mb-6 uppercase">Pronto para Jogar?</h2>
              <p className="text-slate-400 text-2xl font-medium max-w-2xl mx-auto mb-12">
                Reúna seus amigos e descubra quem é o impostor!
              </p>
              <Link 
                href="/"
                className="inline-block px-16 py-6 bg-purple-600 hover:bg-purple-500 border-b-8 border-purple-900 rounded-[2rem] font-black text-3xl text-white transition-all active:translate-y-2 active:border-b-0 shadow-[0_20px_50px_rgba(139,92,246,0.3)]"
              >
                JOGAR AGORA
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t-8 border-[#242642] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center cursor-pointer">
                <img src={logoTikjogos} alt="TikJogos Impostor" className="h-16 w-auto object-contain" />
              </Link>
              <p className="text-slate-400 max-w-md text-lg font-medium">
                A experiência definitiva de dedução social no espaço. Junte-se a milhares de tripulantes e descubra quem é o traidor.
              </p>
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@RAPMUGEN?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Youtube className="w-6 h-6 text-white" />
                </a>
                <a href="https://www.instagram.com/jogodoimpostor/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <MessageCircle className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">NAVEGAÇÃO</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Início</Link></li>
                <li><Link href="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
                <li><Link href="/comojogar" className="hover:text-purple-400 transition-colors">Como Jogar</Link></li>
                <li><Link href="/modos" className="hover:text-purple-400 transition-colors">Modos de Jogo</Link></li>
                <li><Link href="/termos" className="hover:text-purple-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-purple-400 transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">SUPORTE</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Reportar Bug</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Contato</Link></li>
                <li><a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Discord Oficial</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-slate-500 font-bold">© 2026 TikJogos Entertainment. Todos os direitos reservados.</p>
              <p className="text-slate-600 text-[10px] md:text-xs italic max-w-3xl leading-relaxed">
                O TikJogos é um projeto independente de fãs. Todas as marcas registradas pertencem aos seus respectivos proprietários.
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold whitespace-nowrap">
              <span>Feito com 💜 na Galáxia TikJogos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface GameModeSectionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  steps: string[];
  tips: { color: string; text: string }[];
  tipsColor: string;
  reverse?: boolean;
}

function GameModeSection({ icon, iconBg, title, description, steps, tips, tipsColor, reverse }: GameModeSectionProps) {
  const content = (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl border-2 w-fit ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-4xl font-black text-white">{title}</h3>
      <p className="text-slate-400 text-xl leading-relaxed font-medium">{description}</p>
      <div className="space-y-4 pt-4">
        <h4 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
          <Search className="w-4 h-4 text-purple-500" /> Como Jogar
        </h4>
        <ul className="space-y-3">
          {steps.map((item, i) => (
            <li key={i} className="flex gap-3 text-slate-300 font-medium">
              <span className="text-purple-500 font-black">{i+1}.</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const tipsBox = (
    <div className="bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-slate-700 space-y-6">
      <h4 className={`text-${tipsColor}-400 font-black uppercase tracking-widest text-sm`}>Dicas Galácticas</h4>
      <ul className="space-y-4">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-4">
            <div className={`w-2 h-2 rounded-full bg-${tip.color}-400 mt-2 shrink-0`}></div>
            <p className="text-slate-300 font-medium">{tip.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-12 border-t border-white/5 first:border-t-0 first:pt-0">
      {reverse ? (
        <>
          <div className="order-2 lg:order-1">{tipsBox}</div>
          <div className="order-1 lg:order-2">{content}</div>
        </>
      ) : (
        <>
          {content}
          {tipsBox}
        </>
      )}
    </div>
  );
}
