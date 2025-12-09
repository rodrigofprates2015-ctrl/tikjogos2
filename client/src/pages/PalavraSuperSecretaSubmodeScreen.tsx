import { useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { PALAVRA_SECRETA_SUBMODES, type PalavraSuperSecretaSubmode } from "@/lib/palavra-secreta-submodes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Palette } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[#00f2ea] mb-4">
          <Sparkles className="w-5 h-5" />
          <h1 className="text-3xl font-bold">Escolha um Tema</h1>
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-gray-400 text-sm">Selecione a categoria de palavras para jogar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(PALAVRA_SECRETA_SUBMODES) as Array<[PalavraSuperSecretaSubmode, typeof PALAVRA_SECRETA_SUBMODES['classico']]>).map(([submodeId, submode]) => (
          <button
            key={submodeId}
            onClick={() => handleSelectSubmode(submodeId)}
            disabled={!isHost}
            className="group relative flex flex-col rounded-xl border border-gray-700 bg-[#0f0f1e] hover:border-[#00f2ea] hover:bg-[#1a1a2e] transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
            }}
            data-testid={`button-submode-${submodeId}`}
          >
            {/* Image Container */}
            {submode.image ? (
              <div className="w-full h-40 overflow-hidden bg-black/50 flex items-center justify-center">
                <img 
                  src={submode.image} 
                  alt={submode.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-[#00f2ea]/20 to-[#ff0050]/20 flex items-center justify-center">
                <span className="text-gray-400 font-medium">{submode.title}</span>
              </div>
            )}

            {/* Content Container */}
            <div className="p-4 space-y-2 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-[#00f2ea] group-hover:text-[#ff0050] transition-colors">
                {submode.title}
              </h3>
              <p className="text-sm text-gray-400 flex-1">{submode.desc}</p>
              <p className="text-xs text-gray-600">{submode.words.length} palavras</p>
            </div>

            {!isHost && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                <p className="text-gray-300 text-sm font-medium">Aguardando o host...</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {isHost && (
        <div className="bg-[#0f0f1e] rounded-xl p-4 border border-gray-700 space-y-3">
          <div className="flex items-center gap-2 text-[#00f2ea]">
            <Palette className="w-4 h-4" />
            <p className="text-sm font-medium">Ou use um tema personalizado:</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Codigo do tema (ex: ABC123)"
              value={themeCode}
              onChange={(e) => setThemeCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-2 text-center text-white tracking-widest uppercase focus:border-[#00f2ea] focus:outline-none transition-colors"
              data-testid="input-theme-code"
            />
            <Button
              onClick={handleStartWithCustomTheme}
              disabled={themeCode.length !== 6}
              className="bg-gradient-to-r from-[#00f2ea] to-[#ff0050] text-white font-bold disabled:opacity-50"
              data-testid="button-start-custom-theme"
            >
              Jogar
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Adquira temas personalizados na Oficina de Temas
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={backToLobby}
          variant="outline"
          className="flex-1 border border-gray-700 text-gray-400 hover:text-[#00f2ea]"
          data-testid="button-back-to-lobby"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    </div>
  );
};

export default PalavraSuperSecretaSubmodeScreen;
