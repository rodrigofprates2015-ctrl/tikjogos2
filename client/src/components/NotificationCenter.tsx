import { useGameStore } from "@/lib/gameStore";
import { useEffect } from "react";
import { AlertCircle, Crown } from "lucide-react";

export function NotificationCenter() {
  const { notifications, removeNotification } = useGameStore();

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border animate-fade-in bg-gray-800/80 border-gray-600/50 backdrop-blur-sm"
        >
          {notification.type === 'host-changed' ? (
            <Crown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <span className="text-sm text-gray-200">
            {notification.message}
          </span>
        </div>
      ))}
    </div>
  );
}
