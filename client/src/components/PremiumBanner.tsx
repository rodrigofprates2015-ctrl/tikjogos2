import { Crown, Plus } from "lucide-react";
import { Link } from "wouter";

export const PremiumBanner = () => {
  return (
    <Link href="/criar-tema">
      <div className="hidden md:block relative group overflow-hidden rounded-2xl border-2 border-purple-700 shadow-lg cursor-pointer hover:border-purple-500 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 z-0"></div>
        
        {/* Decorative crown element */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
          <Crown size={60} className="text-white rotate-12" />
        </div>

        <div className="relative z-10 px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-black text-white leading-tight truncate">
                Crie seu Próprio Tema
              </h2>
              <p className="text-indigo-200 font-medium text-xs md:text-sm mt-1 leading-snug">
                Animes, séries, memes ou aquela piada interna da galera?<br />Crie um tema 100% seu e leve a diversão para outro nível!
              </p>
            </div>
          </div>

          <div 
            className="w-full sm:w-auto flex-shrink-0 flex items-center justify-between sm:justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-black font-black text-base md:text-lg shadow-xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all hover:brightness-110 hover:scale-105"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-bold opacity-80">APENAS</span>
              <span className="text-lg md:text-xl">R$ 3,00</span>
            </div>
            <Plus className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-90 transition-transform" strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PremiumBanner;
