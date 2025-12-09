import { useGameStore } from "@/lib/gameStore";
import { AlertCircle, Crown, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const { notifications, removeNotification } = useGameStore();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg border animate-fade-in backdrop-blur-sm",
            notification.type === 'disconnected' 
              ? "bg-[#c44536]/90 border-[#c44536] text-white"
              : "bg-gray-800/80 border-gray-600/50"
          )}
        >
          {notification.type === 'host-changed' ? (
            <Crown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : notification.type === 'disconnected' ? (
            <WifiOff className="w-4 h-4 text-white flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <span className={cn(
            "text-sm flex-1",
            notification.type === 'disconnected' ? "text-white" : "text-gray-200"
          )}>
            {notification.message}
          </span>
          {notification.type === 'disconnected' && (
            <button
              onClick={handleReload}
              className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Recarregar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
