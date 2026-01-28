import { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Phone, PhoneOff, Users, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useGameStore } from '@/lib/gameStore';
import { cn } from '@/lib/utils';

export function VoiceChat() {
  const { room, user } = useGameStore();
  const {
    isConnected,
    isConnecting,
    isMuted,
    localVolume,
    speakingUsers,
    error,
    join,
    leave,
    toggleMute
  } = useVoiceChat();

  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't auto-join - let user click to join
  
  // Auto-leave when room is gone
  useEffect(() => {
    if (!room && isConnected) {
      leave();
    }
  }, [room, isConnected, leave]);

  // Don't render if not in a room
  if (!room) return null;

  const players = room.players || [];
  const isSpeaking = localVolume > 5;

  const handleJoin = () => {
    if (room?.code && user?.uid && user?.name) {
      join(`tikjogos-${room.code}`, user.name, user.uid);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isExpanded ? (
        <div className="w-80 bg-[#1e1f22] rounded-lg shadow-2xl border border-[#2b2d31] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#2b2d31]">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500 animate-pulse" : "bg-gray-500"
              )} />
              <span className="text-sm font-semibold text-white">
                {isConnecting ? 'Conectando...' : isConnected ? 'Chat de Voz' : 'Chat de Voz (Offline)'}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="h-7 w-7 hover:bg-[#3b3d44] text-[#949ba4] hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Error message - persistent */}
          {error && !dismissed && (
            <div className="px-4 py-3 bg-red-500/20 border-b border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-400 text-xs font-medium">Erro ao conectar:</p>
                  <p className="text-red-300 text-xs mt-1 break-all">{error}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                  className="h-5 w-5 hover:bg-red-500/30 text-red-400"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Players list */}
          <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
            {/* Current user */}
            {isConnected && (
              <div className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all",
                isSpeaking && !isMuted ? "bg-green-500/20 ring-2 ring-green-500/50" : "bg-[#2b2d31]"
              )}>
                <div className="relative">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold",
                    "bg-[#5865f2] text-white"
                  )}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  {isSpeaking && !isMuted && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Volume2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Você'} <span className="text-[#949ba4]">(você)</span>
                  </p>
                  <p className="text-xs text-[#949ba4]">
                    {isMuted ? 'Microfone desligado' : 'Microfone ligado'}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    isMuted 
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  )}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            )}

            {/* Other players */}
            {isConnected && players
              .filter(p => p.uid !== user?.uid)
              .map(player => {
                const playerSpeaking = speakingUsers.has(Math.abs(hashCode(player.uid)) % 1000000);
                
                return (
                  <div
                    key={player.uid}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all",
                      playerSpeaking ? "bg-green-500/20 ring-2 ring-green-500/50" : "bg-[#2b2d31]"
                    )}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-[#3b3d44] text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      {playerSpeaking && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <Volume2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-[#949ba4]">
                        {playerSpeaking ? 'Falando...' : 'No canal'}
                      </p>
                    </div>
                  </div>
                );
              })}

            {/* Not connected message */}
            {!isConnected && !isConnecting && (
              <div className="text-center py-6">
                <Volume2 className="w-10 h-10 text-[#3b3d44] mx-auto mb-3" />
                <p className="text-[#949ba4] text-sm font-medium mb-1">Chat de voz disponível</p>
                <p className="text-[#6d6f78] text-xs mb-4">Clique em "Entrar" para conversar com os jogadores</p>
              </div>
            )}

            {/* Connecting message */}
            {isConnecting && (
              <div className="text-center py-6">
                <Loader2 className="w-10 h-10 text-[#5865f2] mx-auto mb-3 animate-spin" />
                <p className="text-[#949ba4] text-sm font-medium">Conectando ao chat de voz...</p>
                <p className="text-[#6d6f78] text-xs mt-1">Aguarde um momento</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-3 bg-[#1a1b1e] border-t border-[#2b2d31]">
            <div className="flex items-center gap-2 text-xs text-[#949ba4]">
              <Users className="w-4 h-4" />
              <span>{players.length} na sala</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDismissed(false);
                if (isConnected) {
                  leave();
                } else {
                  handleJoin();
                }
              }}
              disabled={isConnecting}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium",
                isConnected 
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
              )}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isConnected ? (
                <>
                  <PhoneOff className="w-4 h-4 mr-1" />
                  Sair
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-1" />
                  Entrar
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "relative h-14 w-14 rounded-full shadow-lg transition-all",
            isConnected 
              ? isMuted 
                ? "bg-[#3b3d44] hover:bg-[#4b4d54]" 
                : isSpeaking 
                  ? "bg-green-500 hover:bg-green-600 ring-4 ring-green-500/50 animate-pulse" 
                  : "bg-green-600 hover:bg-green-700"
              : "bg-[#5865f2] hover:bg-[#4752c4]"
          )}
        >
          {isConnecting ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : isConnected ? (
            isMuted ? (
              <MicOff className="w-6 h-6 text-red-400" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
          
          {/* Connection indicator */}
          <span className={cn(
            "absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-[#1e1f22]",
            isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500 animate-pulse" : "bg-gray-500"
          )} />
          
          {/* Error indicator */}
          {error && !isConnected && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
            </span>
          )}
        </Button>
      )}
    </div>
  );
}

// Simple hash function to convert string to number
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
