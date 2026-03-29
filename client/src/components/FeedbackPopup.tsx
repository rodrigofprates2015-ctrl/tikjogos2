import { useState } from 'react';
import { X, Star, Send } from 'lucide-react';

interface FeedbackPopupProps {
  onClose: () => void;
}

export default function FeedbackPopup({ onClose }: FeedbackPopupProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const submit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/analytics/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      localStorage.setItem('tikjogos_feedback_done', '1');
      setDone(true);
      setTimeout(dismiss, 2000);
    } catch {
      setSubmitting(false);
    }
  };

  const skip = () => {
    // Mark as done locally so we don't ask again this session
    sessionStorage.setItem('tikjogos_feedback_skipped', '1');
    dismiss();
  };

  const activeRating = hovered || rating;

  const ratingLabel: Record<number, string> = {
    1: 'Muito ruim',
    2: 'Ruim',
    3: 'Ok',
    4: 'Bom',
    5: 'Incrível!',
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'opacity-100 bg-black/70 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
      onClick={skip}
    >
      <div
        className={`w-full max-w-sm bg-[#1e2340] border border-white/10 rounded-3xl shadow-2xl p-6 transition-all duration-300 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          /* ── Thank you state ── */
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-white font-black text-xl">Obrigado!</p>
            <p className="text-white/50 text-sm mt-1">Seu feedback nos ajuda muito.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                  Você jogou bastante!
                </p>
                <h2 className="text-white font-black text-xl leading-tight">
                  O que você acha do TikJogos?
                </h2>
              </div>
              <button
                onClick={skip}
                className="text-white/30 hover:text-white/60 transition-colors ml-3 mt-0.5 flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform duration-100 hover:scale-110 active:scale-95"
                >
                  <Star
                    size={40}
                    className={`transition-colors duration-150 ${
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-white/10 text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Rating label */}
            <p className={`text-center text-sm font-bold mb-4 h-5 transition-all duration-150 ${
              activeRating > 0 ? 'text-amber-400' : 'text-transparent'
            }`}>
              {ratingLabel[activeRating] ?? ''}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Conta mais (opcional)..."
              maxLength={500}
              rows={3}
              className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-indigo-500/60 transition-colors"
            />

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={skip}
                className="flex-1 py-3 rounded-2xl text-white/40 text-sm font-semibold hover:text-white/60 hover:bg-white/[0.04] transition-all"
              >
                Pular
              </button>
              <button
                onClick={submit}
                disabled={rating === 0 || submitting}
                className={`flex-[2] py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 border-b-4 ${
                  rating === 0
                    ? 'bg-white/10 text-white/30 border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1'
                }`}
              >
                <Send size={16} />
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
