import { Crown, Plus } from "lucide-react";
import { Link } from "wouter";

export const PremiumBanner = () => {
  return (
    <Link href="/criar-tema">
      <div className="relative group overflow-hidden rounded-2xl border-2 border-purple-700 shadow-lg cursor-pointer hover:border-purple-500 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 z-0"></div>
        
        {/* Decorative crown element */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
          <Crown size={60} className="text-white rotate-12" />
        </div>

        <div className="relative z-10 px-4 py-3 md:px-6 md:py-4 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/50 flex-shrink-0">
              <Crown size={20} className="text-yellow-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-black text-white leading-tight truncate">
                Crie seu Próprio Tema
              </h2>
              <p className="text-indigo-200 font-medium text-xs md:text-sm truncate hidden sm:block">
                Animes, séries, memes ou aquela piada interna da galera? Crie um tema 100% seu e leve a diversão para outro nível!
              </p>
            </div>
          </div>

          <div 
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-black font-black text-sm md:text-base shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all hover:brightness-110"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-bold opacity-80">APENAS</span>
              <span>R$ 3,00</span>
            </div>
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PremiumBanner;
