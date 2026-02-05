
import React, { useState, useEffect } from 'react';
import { LogIn, Monitor, Check, ShoppingBag, Heart } from 'lucide-react';

const Home: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [saveNickname, setSaveNickname] = useState(true);

  // Load saved nickname on mount
  useEffect(() => {
    const saved = localStorage.getItem('tikjogos_nickname');
    if (saved) {
      setNickname(saved);
    }
    const pref = localStorage.getItem('tikjogos_save_pref');
    if (pref !== null) {
      setSaveNickname(pref === 'true');
    }
  }, []);

  const handleCreateRoom = () => {
    if (saveNickname) {
      localStorage.setItem('tikjogos_nickname', nickname);
      localStorage.setItem('tikjogos_save_pref', 'true');
    } else {
      localStorage.removeItem('tikjogos_nickname');
      localStorage.setItem('tikjogos_save_pref', 'false');
    }
    navigateTo('#/modos');
  };

  const navigateTo = (path: string) => {
    window.location.hash = path;
    window.scrollTo(0, 0);
  };

  const logoUrl = "https://tikjogos.com.br/assets/logo_site_impostor_1765071990526-D5j7bYDx.png";
  const crewmateImg = "https://tikjogos.com.br/assets/personagem_tripulante_1765071990526-C0H3j5Dk.png";
  const impostorImg = "https://tikjogos.com.br/assets/personagem_impostor_1765071990526-B8m9lPzX.png";

  return (
    <div className="animate-fade-in min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10">
        
        {/* Left Character - Tripulante */}
        <div className="hidden lg:block w-1/4 animate-bounce-soft">
          <img 
            src={crewmateImg} 
            alt="Personagem Tripulante do Jogo do Impostor - TikJogos" 
            className="w-full drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-transform hover:scale-105" 
          />
        </div>

        {/* Center - Main Action Card */}
        <div className="w-full max-w-lg space-y-8">
          {/* Logo Section */}
          <div className="text-center space-y-4">
            <img 
              src={logoUrl} 
              alt="Logo Jogo do Impostor Online - TikJogos" 
              className="h-24 md:h-32 mx-auto drop-shadow-2xl hover:scale-105 transition-transform cursor-pointer" 
              onClick={() => navigateTo('#/')}
            />
            <h1 className="sr-only">TikJogos Impostor</h1>
          </div>

          {/* Create Room Box */}
          <div className="bg-[#242642] p-8 rounded-[3rem] border-4 border-[#2f3252] shadow-2xl space-y-6 relative">
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Seu nickname" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-8 py-5 bg-slate-900 border-4 border-slate-700 rounded-2xl text-xl font-black text-white placeholder:text-slate-600 focus:border-purple-500 outline-none transition-all shadow-inner"
              />
              
              <button 
                onClick={handleCreateRoom}
                className="w-full px-8 py-5 bg-purple-600 hover:bg-purple-500 border-b-[6px] border-purple-800 rounded-2xl font-black text-2xl text-white flex items-center justify-center gap-3 transition-all active:translate-y-1 active:border-b-0 shadow-lg"
              >
                CRIAR SALA
              </button>

              <label className="flex items-center gap-3 cursor-pointer group w-fit mx-auto">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={saveNickname} 
                  onChange={() => setSaveNickname(!saveNickname)} 
                />
                <div 
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveNickname ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-800 border-slate-700'}`}
                >
                  {saveNickname && <Check size={16} className="text-white" strokeWidth={4} />}
                </div>
                <span className="text-slate-400 font-bold text-sm group-hover:text-slate-200 transition-colors">Guardar nickname</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-1 flex-1 bg-slate-700/50 rounded-full"></div>
              <span className="text-slate-500 font-black text-sm">OU</span>
              <div className="h-1 flex-1 bg-slate-700/50 rounded-full"></div>
            </div>

            {/* Enter Room Box */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="CÓDIGO" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 px-6 py-4 bg-slate-900 border-4 border-slate-700 rounded-2xl text-xl font-black text-white text-center placeholder:text-slate-600 outline-none uppercase tracking-widest"
              />
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 border-b-[6px] border-blue-800 rounded-2xl font-black text-xl text-white transition-all active:translate-y-1 active:border-b-0">
                ENTRAR
              </button>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-4 text-slate-400 hover:text-white font-black transition-colors">
              <Monitor size={20} /> MODO LOCAL
            </button>
          </div>

          {/* Custom Theme Promotion */}
          <div className="bg-gradient-to-br from-orange-500 to-rose-600 p-1 rounded-[3rem] shadow-xl group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="bg-[#242642] p-8 rounded-[2.8rem] flex flex-col sm:flex-row items-center gap-6">
              <div className="p-4 bg-orange-500/20 rounded-3xl border-2 border-orange-500/30 text-orange-400">
                <ShoppingBag size={40} />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h3 className="text-white font-black text-xl leading-tight uppercase">Crie seu Próprio Tema</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Animes, séries, memes ou aquela piada interna da galera? Crie um tema 100% seu!</p>
              </div>
              <div className="text-center sm:text-right shrink-0">
                <p className="text-xs font-black text-orange-400 uppercase tracking-tighter">APENAS</p>
                <p className="text-3xl font-black text-white">R$ 3,00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Character - Impostor */}
        <div className="hidden lg:block w-1/4 animate-bounce-soft [animation-delay:0.5s]">
          <img 
            src={impostorImg} 
            alt="Personagem Impostor do Jogo - TikJogos" 
            className="w-full drop-shadow-[0_20px_50px_rgba(244,63,94,0.3)] transition-transform hover:scale-105" 
          />
        </div>
      </div>

      {/* Footer Game Brand Info - Matches snippet request */}
      <div className="mt-16 text-center space-y-6 pb-12 w-full max-w-4xl px-4">
        <div className="space-y-2">
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">TikJogos - Jogos Online Grátis</p>
          <p className="text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5">
            Desenvolvido com <Heart size={12} className="text-rose-500 fill-current" /> por Rodrigo Freitas
          </p>
        </div>

        {/* Specific Snippet Links */}
        <div className="flex items-center justify-center gap-4 text-slate-500 font-black text-sm uppercase">
          <button onClick={() => navigateTo('#/blog')} className="hover:text-purple-400 transition-colors">Blog</button>
          <span className="text-slate-700">|</span>
          <button onClick={() => navigateTo('#/privacidade')} className="hover:text-blue-400 transition-colors">Privacidade</button>
          <span className="text-slate-700">|</span>
          <button onClick={() => navigateTo('#/termos')} className="hover:text-purple-400 transition-colors">Termos</button>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-slate-600 text-[10px] md:text-xs italic leading-relaxed max-w-3xl mx-auto">
          O TikJogos é um projeto independente de fãs. Todas as marcas registradas (como nomes de personagens e franquias) pertencem aos seus respectivos proprietários e são usadas aqui apenas para fins de referência em contexto de jogo de palavras/trivia.
        </p>
      </div>
    </div>
  );
};

export default Home;
