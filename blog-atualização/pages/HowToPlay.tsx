
import React from 'react';
import { 
  Rocket, 
  Users, 
  Gamepad2, 
  MessageSquare, 
  Vote, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Layers, 
  Package, 
  HelpCircle 
} from 'lucide-react';

const HowToPlay: React.FC = () => {
  const navigateTo = (path: string) => {
    window.location.hash = path;
    window.scrollTo(0, 0);
  };

  return (
    <div className="animate-fade-in pt-12 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-2xl border-2 border-purple-500/20 text-purple-400 font-black text-sm uppercase tracking-widest mb-6">
            <Gamepad2 className="w-5 h-5" /> MANUAL DO TRIPULANTE
          </div>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-none">
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
                <h4 className="text-emerald-400 font-black mb-2 flex items-center gap-2">
                   TRIPULANTES
                </h4>
                <p className="text-slate-300 font-medium">Recebem informações secretas e devem descobrir quem é o impostor através de votação.</p>
              </div>
              <div className="bg-rose-500/5 p-6 rounded-3xl border-2 border-rose-500/20">
                <h4 className="text-rose-400 font-black mb-2 flex items-center gap-2">
                   IMPOSTOR
                </h4>
                <p className="text-slate-300 font-medium">Não recebe a informação secreta e deve fingir que a conhece para não ser descoberto.</p>
              </div>
              <div className="bg-blue-500/5 p-6 rounded-3xl border-2 border-blue-500/20">
                <h4 className="text-blue-400 font-black mb-2 flex items-center gap-2">
                   VOTAÇÃO
                </h4>
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
            <h2 className="text-4xl md:text-6xl font-heading text-white mb-4">Modalidades de Jogo</h2>
            <p className="text-slate-400 text-xl font-medium">Cada missão tem seus próprios perigos e estratégias.</p>
          </div>

          <div className="space-y-24">
            {/* Palavra Secreta */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/20 w-fit">
                  <Layers className="text-emerald-500 w-8 h-8" />
                </div>
                <h3 className="text-4xl font-black text-white">Palavra Secreta</h3>
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  O modo clássico do jogo! Todos os tripulantes recebem a mesma palavra secreta, exceto o impostor que não sabe qual é.
                </p>
                <div className="space-y-4 pt-4">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-500" /> Como Jogar
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Todos os jogadores recebem uma palavra, exceto o impostor',
                      'Os tripulantes devem dar dicas sobre a palavra sem revelá-la diretamente',
                      'O impostor deve fingir que conhece a palavra e tentar descobrir qual é',
                      'Após as rodadas de dicas, todos votam em quem acham que é o impostor'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 font-medium">
                        <span className="text-purple-500 font-black">{i+1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-slate-700 space-y-6">
                <h4 className="text-yellow-400 font-black uppercase tracking-widest text-sm">Dicas Galácticas</h4>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Tripulantes: dêem dicas sutis, não muito óbvias</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Impostor: preste atenção nas dicas dos outros para descobrir a palavra</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Cuidado com dicas muito específicas que podem entregar a palavra ao impostor</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Locais & Funções */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-12 border-t border-white/5">
               <div className="order-2 lg:order-1 bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-slate-700 space-y-6">
                <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm">Dicas Galácticas</h4>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Faça perguntas que só quem conhece o local saberia responder</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Impostor: evite dar respostas muito genéricas ou muito específicas</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Observe quem parece confuso com as perguntas</p>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="p-4 bg-blue-500/10 rounded-2xl border-2 border-blue-500/20 w-fit">
                  <MapPin className="text-blue-500 w-8 h-8" />
                </div>
                <h3 className="text-4xl font-black text-white">Locais & Funções</h3>
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  Cada jogador recebe um local e uma função específica. O impostor não sabe o local, mas precisa fingir que sabe!
                </p>
                <div className="space-y-4 pt-4">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-500" /> Como Jogar
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Tripulantes recebem um local (ex: Hospital) e uma função (ex: Médico)',
                      'O impostor não sabe qual é o local',
                      'Os jogadores fazem perguntas uns aos outros sobre o local',
                      'O impostor deve tentar descobrir o local pelas respostas dos outros'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 font-medium">
                        <span className="text-purple-500 font-black">{i+1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Duas Facções */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-12 border-t border-white/5">
              <div className="space-y-6">
                <div className="p-4 bg-orange-500/10 rounded-2xl border-2 border-orange-500/20 w-fit">
                  <Users className="text-orange-500 w-8 h-8" />
                </div>
                <h3 className="text-4xl font-black text-white">Duas Facções</h3>
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  Os jogadores são divididos em dois times, cada um com uma palavra diferente. O impostor não pertence a nenhum time!
                </p>
                <div className="space-y-4 pt-4">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-500" /> Como Jogar
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Metade dos jogadores recebe a Palavra A, outra metade a Palavra B',
                      'O impostor não sabe nenhuma das duas palavras',
                      'Cada time tenta identificar quem são seus aliados',
                      'O impostor tenta se infiltrar em um dos times'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 font-medium">
                        <span className="text-purple-500 font-black">{i+1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-slate-700 space-y-6">
                <h4 className="text-orange-400 font-black uppercase tracking-widest text-sm">Dicas Galácticas</h4>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Tente descobrir quem tem a mesma palavra que você</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Cuidado para não revelar sua palavra ao time adversário</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">O impostor pode tentar criar confusão entre os times</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Categoria + Item */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-12 border-t border-white/5">
               <div className="order-2 lg:order-1 bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-slate-700 space-y-6">
                <h4 className="text-purple-400 font-black uppercase tracking-widest text-sm">Dicas Galácticas</h4>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Use características específicas do item para suas dicas</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Impostor: tente dar dicas genéricas que se apliquem a vários itens da categoria</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Atenção aos jogadores que parecem adivinhar demais</p>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="p-4 bg-purple-500/10 rounded-2xl border-2 border-purple-500/20 w-fit">
                  <Package className="text-purple-500 w-8 h-8" />
                </div>
                <h3 className="text-4xl font-black text-white">Categoria + Item</h3>
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  Todos sabem a categoria, mas só os tripulantes conhecem o item específico. O impostor sabe a categoria mas não o item!
                </p>
                <div className="space-y-4 pt-4">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-500" /> Como Jogar
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Uma categoria é revealed para todos (ex: Frutas)',
                      'Tripulantes recebem um item específico da categoria (ex: Maçã)',
                      'O impostor sabe a categoria mas não o item',
                      'Os jogadores devem dar dicas sobre o item sem revelá-lo'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 font-medium">
                        <span className="text-purple-500 font-black">{i+1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

             {/* Perguntas Diferentes */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-12 border-t border-white/5">
              <div className="space-y-6">
                <div className="p-4 bg-rose-500/10 rounded-2xl border-2 border-rose-500/20 w-fit">
                  <HelpCircle className="text-rose-500 w-8 h-8" />
                </div>
                <h3 className="text-4xl font-black text-white">Perguntas Diferentes</h3>
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  Tripulantes e impostor recebem perguntas diferentes sobre o mesmo tema. As respostas revelarão quem é o impostor!
                </p>
                <div className="space-y-4 pt-4">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-500" /> Como Jogar
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "Tripulantes recebem uma pergunta (ex: 'Qual seu animal favorito?')",
                      'O impostor recebe uma pergunta diferente sobre tema similar',
                      'Cada jogador responde sua pergunta em voz alta',
                      'As respostas que não fazem sentido revelam o impostor'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 font-medium">
                        <span className="text-purple-500 font-black">{i+1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-slate-700 space-y-6">
                <h4 className="text-rose-400 font-black uppercase tracking-widest text-sm">Dicas Galácticas</h4>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Preste atenção se as respostas fazem sentido com o tema</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Impostor: tente dar respostas que se encaixem em várias perguntas possíveis</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0"></div>
                    <p className="text-slate-300 font-medium">Compare as respostas entre os jogadores</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-32 p-16 rounded-[4rem] bg-gradient-to-br from-[#242642] to-[#1a1b2e] border-4 border-purple-500 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="font-heading text-5xl md:text-7xl text-white mb-6 uppercase">Pronto para Jogar?</h2>
              <p className="text-slate-400 text-2xl font-medium max-w-2xl mx-auto mb-12">
                Reúna seus amigos e descubra quem é o impostor!
              </p>
              <button 
                onClick={() => window.location.href = 'https://tikjogos.com.br/'}
                className="px-16 py-6 bg-purple-600 hover:bg-purple-500 border-b-8 border-purple-900 rounded-[2rem] font-black text-3xl text-white transition-all active:translate-y-2 active:border-b-0 shadow-[0_20px_50px_rgba(139,92,246,0.3)]"
              >
                JOGAR AGORA
              </button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default HowToPlay;
