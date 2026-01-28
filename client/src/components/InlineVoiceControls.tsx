import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { useVoiceChatContext } from '@/hooks/VoiceChatContext';
import { useGameStore } from '@/lib/gameStore';
import { cn } from '@/lib/utils';

interface VoiceControlButtonProps {
  playerId: string;
  isCurrentUser: boolean;
}

export function VoiceControlButton({ playerId, isCurrentUser }: VoiceControlButtonProps) {
  const { room, user } = useGameStore();
  const {
    isConnected,
    isMuted,
    speakingUsers,
    localVolume,
    toggleMute,
    toggleMuteRemoteUser,
    isRemoteUserMuted,
    getNumericUid
  } = useVoiceChatContext();

  if (!isConnected) return null;

  const numericUid = getNumericUid(playerId);
  const isSpeaking = isCurrentUser 
    ? localVolume > 5 && !isMuted
    : speakingUsers.has(numericUid);

  if (isCurrentUser) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className={cn(
          "p-2 rounded-xl transition-all border-b-3 active:border-b-0 active:translate-y-1 ml-2",
          isMuted 
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-700/50" 
            : isSpeaking
              ? "bg-green-500 text-white border-green-700 ring-2 ring-green-400/50 animate-pulse"
              : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-700/50"
        )}
        title={isMuted ? "Ativar microfone" : "Desativar microfone"}
      >
        {isMuted ? (
          <MicOff className="w-5 h-5" strokeWidth={2.5} />
        ) : (
          <Mic className="w-5 h-5" strokeWidth={2.5} />
        )}
      </button>
    );
  }

  const isUserMuted = isRemoteUserMuted(playerId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleMuteRemoteUser(playerId);
      }}
      className={cn(
        "p-2 rounded-xl transition-all border-b-3 active:border-b-0 active:translate-y-1 ml-2",
        isUserMuted 
          ? "bg-slate-700 text-slate-400 hover:bg-slate-600 border-slate-800" 
          : isSpeaking
            ? "bg-green-500/30 text-green-400 border-green-700/50 ring-2 ring-green-400/30"
            : "bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-900"
      )}
      title={isUserMuted ? "Ativar áudio deste jogador" : "Silenciar este jogador"}
    >
      {isUserMuted ? (
        <VolumeX className="w-5 h-5" strokeWidth={2.5} />
      ) : (
        <Volume2 className="w-5 h-5" strokeWidth={2.5} />
      )}
    </button>
  );
}

export function VoiceChatJoinButton() {
  const { room, user } = useGameStore();
  const {
    isConnected,
    isConnecting,
    error,
    join,
    leave
  } = useVoiceChatContext();

  const handleToggleVoice = () => {
    if (isConnected) {
      leave();
    } else if (room?.code && user?.uid && user?.name) {
      join(`tikjogos-${room.code}`, user.name, user.uid);
    }
  };

  return (
    <button
      onClick={handleToggleVoice}
      disabled={isConnecting}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border-b-3 active:border-b-0 active:translate-y-1",
        isConnected 
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-700/50" 
          : error
            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-700/50"
            : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-700/50"
      )}
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Conectando...</span>
        </>
      ) : isConnected ? (
        <>
          <PhoneOff className="w-4 h-4" />
          <span>Sair do Chat de Voz</span>
        </>
      ) : (
        <>
          <Phone className="w-4 h-4" />
          <span>{error ? 'Tentar Novamente' : 'Entrar no Chat de Voz'}</span>
        </>
      )}
    </button>
  );
}

export function SpeakingIndicator({ playerId, isCurrentUser }: { playerId: string; isCurrentUser: boolean }) {
  const {
    isConnected,
    isMuted,
    speakingUsers,
    localVolume,
    getNumericUid
  } = useVoiceChatContext();

  if (!isConnected) return null;

  const numericUid = getNumericUid(playerId);
  const isSpeaking = isCurrentUser 
    ? localVolume > 5 && !isMuted
    : speakingUsers.has(numericUid);

  if (!isSpeaking) return null;

  return (
    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse border-2 border-slate-900">
      <Volume2 className="w-3 h-3 text-white" />
    </div>
  );
}
