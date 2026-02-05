
import React from 'react';
import { GAME_MODES } from '../constants';
import * as LucideIcons from 'lucide-react';
import { Rocket, Star, Shield, Layout as LayoutIcon } from 'lucide-react';

const GameModes: React.FC = () => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Fácil': return 'bg-emerald-500 text-white border-emerald-700';
      case 'Médio': return 'bg-orange-500 text-white border-orange-700';
      case 'Difícil': return 'bg-rose-500 text-white border-rose-700';
      default: return 'bg-slate-700 text-white border-slate-900';
    }
  };

  const getIconColor = (diff: string) => {
    switch (diff) {
      case 'Fácil': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Médio': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Difícil': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="animate-fade-in pb-20 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-2xl border-2 border-purple-500/20 text-purple-400 font-black text-sm uppercase tracking-widest mb-6">
            <Rocket className="w-5 h-5" /> PREPARE SUA TRIPULAÇÃO
          </div>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-none">
            Modos de <span className="text-purple-500">Jogo</span>
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium">
            Escolha sua missão. Cada modo oferece uma dinâmica única de dedução e estratégia.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GAME_MODES.map((mode) => {
            const IconComponent = (LucideIcons as any)[mode.iconName] || LucideIcons.HelpCircle;
            
            return (
              <div
                key={mode.id}
                className="group relative p-8 rounded-[3rem] bg-[#242642] border-4 border-[#2f3252] shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-3xl border-2 transition-all group-hover:scale-110 ${getIconColor(mode.difficulty)}`}>
                    <IconComponent size={32} strokeWidth={2.5} />
                  </div>
                  
                  <div className={`text-xs font-black px-4 py-1.5 rounded-full border-2 uppercase tracking-widest ${getDifficultyColor(mode.difficulty)}`}>
                    {mode.difficulty}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="space-y-4">
                  <h3 className="font-heading text-3xl text-white leading-tight group-hover:text-purple-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                {/* Bottom Decor */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#242642] bg-slate-700 flex items-center justify-center text-[10px] font-black text-white">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    ))}
                  </div>
                  <button className="px-6 py-2 bg-slate-800 hover:bg-purple-600 rounded-xl font-black text-xs text-white uppercase tracking-wider transition-all">
                    Selecionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Footer Section */}
        <section className="mt-24 p-12 rounded-[4rem] bg-gradient-to-br from-purple-600 to-indigo-900 border-4 border-white/10 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">PRONTO PARA A SABOTAGEM?</h2>
              <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto mb-10">
                A nave está prestes a decolar. Reúna seus amigos e descubra quem é o impostor agora mesmo!
              </p>
              <button className="px-12 py-5 bg-white text-purple-900 rounded-3xl font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-8 border-purple-200">
                LANÇAR NAVE
              </button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default GameModes;
