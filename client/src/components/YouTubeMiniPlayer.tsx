import { useState, useEffect } from "react";
import { Volume2, VolumeX, ChevronDown, X } from "lucide-react";
import { SiYoutube } from "react-icons/si";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@RAPMUGEN";
const YOUTUBE_PLAYLIST_ID = "RDJoU9TKojDl8";
const YOUTUBE_VIDEO_ID = "JoU9TKojDl8";

export function YouTubeMiniPlayer() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem("ytplayer_hidden_until");
    if (hiddenUntil) {
      const hiddenTime = parseInt(hiddenUntil, 10);
      if (Date.now() < hiddenTime) {
        setIsVisible(false);
      } else {
        localStorage.removeItem("ytplayer_hidden_until");
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("ytplayer_hidden_until", String(Date.now() + 24 * 60 * 60 * 1000));
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSubscribe = () => {
    window.open(`${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 transition-all duration-300 ease-in-out"
      style={{ width: isMinimized ? "280px" : "320px" }}
      data-testid="youtube-mini-player"
    >
      <div className="rounded-xl overflow-hidden shadow-2xl border border-purple-500/30 bg-[#1a1a2e]">
        <div 
          className="flex items-center justify-between px-3 py-2"
          style={{ background: "linear-gradient(90deg, #4a1942 0%, #2d1f3d 100%)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <SiYoutube className="text-red-500 w-4 h-4" />
            <span className="text-white font-bold text-sm tracking-wide">RAP MUGEN</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMute}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              data-testid="button-mute-player"
              title={isMuted ? "Ativar som" : "Mutar"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-300" />
              )}
            </button>
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              data-testid="button-minimize-player"
              title={isMinimized ? "Expandir" : "Minimizar"}
            >
              <ChevronDown 
                className={`w-4 h-4 text-gray-300 transition-transform ${isMinimized ? "rotate-180" : ""}`} 
              />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              data-testid="button-close-player"
              title="Fechar"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        <div 
          className="transition-all duration-300 overflow-hidden"
          style={{ height: isMinimized ? "0px" : "180px" }}
        >
          <iframe
            width="100%"
            height="180"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?list=${YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${YOUTUBE_VIDEO_ID}`}
            title="RAP MUGEN"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="bg-black"
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-[#1a1a2e]">
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            data-testid="link-youtube-channel"
          >
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <SiYoutube className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold">@RAPMUGEN</span>
              <span className="text-gray-400 text-[10px]">Inscreva-se no canal!</span>
            </div>
          </a>
          <button
            onClick={handleSubscribe}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
            data-testid="button-subscribe"
          >
            INSCREVER
            <SiYoutube className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
