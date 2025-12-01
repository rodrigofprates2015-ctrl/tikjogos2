import { useState, useEffect } from 'react';
import { Player } from '@/lib/gameStore';
import { Crown } from 'lucide-react';

interface SpeakingOrderWheelProps {
  players: Player[];
  onComplete: (order: string[]) => void;
  isSpinning?: boolean;
  serverOrder?: string[] | null; // Order received from server (same for all clients)
}

export function SpeakingOrderWheel({ players, onComplete, isSpinning = true, serverOrder }: SpeakingOrderWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [speakingOrder, setSpeakingOrder] = useState<string[]>([]);

  useEffect(() => {
    if (!isSpinning || isComplete) return;

    let currentRotation = 0;
    const interval = setInterval(() => {
      currentRotation += 15;
      setRotation(currentRotation);
    }, 30);

    // Spin for 3 seconds then stop and show result for 4 more seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      
      // Use server-provided order (same for all clients) or fallback to local generation
      const order = serverOrder && serverOrder.length > 0 
        ? serverOrder 
        : [...players].sort(() => Math.random() - 0.5).slice(0, 3).map(p => p.uid);
      
      setSpeakingOrder(order);
      setIsComplete(true);
      
      // Final rotation to a specific position (same seed for visual consistency)
      setRotation(360 * 3 + 45);
      
      // Show result for 4 seconds then close
      setTimeout(() => {
        onComplete(order);
      }, 4000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isSpinning, isComplete, players, onComplete, serverOrder]);

  const displayOrder = speakingOrder.length > 0 
    ? speakingOrder.map(uid => players.find(p => p.uid === uid)?.name || 'Desconhecido')
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Wheel Container */}
        <div className="relative w-80 h-80">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 flex flex-col items-center">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-[#00f2ea]" 
                 style={{ filter: 'drop-shadow(0 0 10px rgba(0, 242, 234, 0.8))' }}>
            </div>
          </div>

          {/* Wheel */}
          <div
            className="w-full h-full rounded-full border-8 border-[#00f2ea]/50 flex items-center justify-center transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(from 0deg, #ff0050 0%, #00f2ea 25%, #ff0050 50%, #00f2ea 75%, #ff0050 100%)',
              boxShadow: '0 0 40px rgba(0, 242, 234, 0.5), inset 0 0 40px rgba(255, 0, 80, 0.3)'
            }}
          >
            {/* Center Circle */}
            <div className="absolute w-24 h-24 rounded-full bg-[#0a0a0a] border-4 border-[#00f2ea] flex items-center justify-center"
                 style={{ boxShadow: '0 0 20px rgba(0, 242, 234, 0.5)' }}>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Sorteio</div>
                <div className="text-2xl font-bold text-[#00f2ea]">🎲</div>
              </div>
            </div>
          </div>

          {/* Player Names around wheel */}
          {players.map((player, index) => {
            const angle = (index / players.length) * 360;
            const radius = 140;
            const x = radius * Math.cos((angle - 90) * Math.PI / 180);
            const y = radius * Math.sin((angle - 90) * Math.PI / 180);
            
            return (
              <div
                key={player.uid}
                className="absolute w-20 h-20 flex items-center justify-center"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <div className="bg-black/90 border-2 border-[#00f2ea] rounded-lg px-2 py-1 text-center text-xs font-bold text-[#00f2ea] truncate"
                     style={{ boxShadow: '0 0 15px rgba(0, 242, 234, 0.4)' }}>
                  {player.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ea] to-[#ff0050] mb-2">
            Definindo Ordem de Fala
          </h2>
          <p className="text-gray-400 text-sm">Preparando os 3 primeiros a falar...</p>
        </div>

        {/* Results */}
        {isComplete && displayOrder.length > 0 && (
          <div className="animate-fade-in space-y-4 text-center">
            <div className="text-lg font-bold text-[#00f2ea]">Ordem de Fala:</div>
            <div className="space-y-2">
              {displayOrder.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#00f2ea]/20 to-[#ff0050]/20 border border-[#00f2ea]/50 rounded-lg text-white font-semibold"
                  style={{
                    animation: `slideIn 0.5s ease-out ${idx * 0.1}s backwards`,
                  }}
                >
                  <Crown className="w-5 h-5 text-[#00f2ea]" />
                  <span>{idx + 1}º lugar: <span className="text-[#00f2ea]">{name}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
