import { useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { PALAVRA_SECRETA_SUBMODES, type PalavraSuperSecretaSubmode } from "@/lib/palavra-secreta-submodes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Palette, Gamepad2, Rocket, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PalavraSuperSecretaSubmodeScreen = () => {
  const { startGame, backToLobby, user, room } = useGameStore();
  const isHost = room && user && room.hostId === user.uid;
  const [themeCode, setThemeCode] = useState('');

  const handleSelectSubmode = (submode: PalavraSuperSecretaSubmode) => {
    if (isHost) {
      // Store submode for startGame to use
      localStorage.setItem('selectedSubmode', submode);
      startGame(themeCode || undefined);
    }
  };

  const handleStartWithCustomTheme = () => {
    if (isHost && themeCode.length === 6) {
      localStorage.setItem('selectedSubmode', 'classico');
      startGame(themeCode);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 relative">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative z-10">
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 text-white mb-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">Escolha um Tema</h1>
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-base md:text-lg font-medium">Selecione a categoria de palavras para jogar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(Object.entries(PALAVRA_SECRETA_SUBMODES) as Array<[PalavraSuperSecretaSubmode, typeof PALAVRA_SECRETA_SUBMODES['classico']]>).map(([submodeId, submode], index) => {
            const isRecommended = index === 0;
            
            return (
              <button
                key={submodeId}
                onClick={() => handleSelectSubmode(submodeId)}
                disabled={!isHost}
                className={cn(
                  "relative p-5 rounded-3xl cursor-pointer transition-all duration-200 flex flex-col gap-4 h-full border-4",
                  !isHost 
                    ? "bg-slate-700 border-slate-800 opacity-50 cursor-not-allowed"
                    : "bg-slate-800 border-slate-900 hover:bg-slate-750 hover:-translate-y-1 hover:border-slate-700 shadow-lg"
                )}
                data-testid={`button-submode-${submodeId}`}
              >
                {/* Badge Recomendado */}
                {isRecommended && isHost && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full border-2 border-yellow-600 shadow-sm z-10 flex items-center gap-1 w-max">
                    <Star size={12} fill="currentColor" /> RECOMENDADO
                  </div>
                )}

                {/* Image Container */}
                {submode.image ? (
                  <div className="w-full h-40 overflow-hidden rounded-2xl bg-black/50 flex items-center justify-center">
                    <img 
                      src={submode.image} 
                      alt={submode.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border-2 border-black/10">
                    <span className="text-4xl">🎯</span>
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="font-black text-xl leading-tight text-slate-100">
                    {submode.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-400 flex-1">
                    {submode.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-slate-400 border-2 border-black/10">
                      {submode.words.length} PALAVRAS
                    </span>
                  </div>
                </div>

                {!isHost && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-3xl backdrop-blur-sm">
                    <div className="text-center">
                      <div className="flex gap-2 justify-center mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <p className="text-slate-300 text-sm font-bold">Aguardando o host...</p>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isHost && (
          <div className="bg-slate-800/50 rounded-3xl p-6 border-4 border-slate-900 space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-yellow-400">
              <div className="p-2 bg-yellow-500/10 rounded-xl border-2 border-yellow-500/20">
                <Palette className="w-5 h-5" />
              </div>
              <p className="text-base font-black text-white">Ou use um tema personalizado:</p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="CÓDIGO DO TEMA (ex: ABC123)"
                value={themeCode}
                onChange={(e) => setThemeCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-4 text-center text-white text-lg font-black tracking-widest uppercase focus:border-yellow-500 focus:outline-none transition-colors"
                data-testid="input-theme-code"
              />
              <button
                onClick={handleStartWithCustomTheme}
                disabled={themeCode.length !== 6}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl whitespace-nowrap",
                  themeCode.length === 6
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2' 
                    : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
                )}
                data-testid="button-start-custom-theme"
              >
                JOGAR
              </button>
            </div>
            <p className="text-sm text-slate-400 text-center font-medium">
              💡 Adquira temas personalizados na Oficina de Temas
            </p>
          </div>
        )}

        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={backToLobby}
            className="flex-1 p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white flex items-center justify-center gap-2 font-bold"
            data-testid="button-back-to-lobby"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            VOLTAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default PalavraSuperSecretaSubmodeScreen;
