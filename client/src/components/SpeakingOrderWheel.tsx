import { useState, useEffect } from 'react';
import { Player } from '@/lib/gameStore';
import { Crown } from 'lucide-react';
import { OrderWheelIcon } from './OrderWheelIcon';

interface SpeakingOrderWheelProps {
  players: Player[];
  onComplete: (order: string[]) => void;
  isSpinning?: boolean;
  serverOrder?: string[] | null;
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

    const timeout = setTimeout(() => {
      clearInterval(interval);
      
      const order = serverOrder && serverOrder.length > 0 
        ? serverOrder 
        : [...players].sort(() => Math.random() - 0.5).map(p => p.uid);
      
      setSpeakingOrder(order);
      setIsComplete(true);
      setRotation(0);
      
      setTimeout(() => {
        onComplete(order);
      }, 4000);
    }, 2500);

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
        {!isComplete && (
          <>
            <div className="relative w-48 h-48">
              <OrderWheelIcon 
                className="w-full h-full drop-shadow-2xl"
                rotation={rotation}
              />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Definindo Ordem de Fala
              </h2>
              <p className="text-gray-400 text-sm animate-pulse">Sorteando ordem para {players.length} jogadores...</p>
            </div>
          </>
        )}

        {isComplete && displayOrder.length > 0 && (
          <div className="animate-fade-in space-y-4 text-center w-full max-w-md">
            <div className="text-lg font-bold text-gray-400 uppercase tracking-wider">Ordem de Fala</div>
            <div className="space-y-2">
              {displayOrder.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-900/40 border border-gray-700/50 rounded-xl text-white font-semibold"
                  style={{
                    animation: `slideIn 0.4s ease-out ${idx * 0.1}s backwards`,
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700/40 border border-gray-600 flex items-center justify-center">
                    <span className="text-gray-300 font-bold text-sm">{idx + 1}</span>
                  </div>
                  <span className="flex-1 text-left">{name}</span>
                  {idx === 0 && <Crown className="w-5 h-5 text-yellow-600" />}
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
