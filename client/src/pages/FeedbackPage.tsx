import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Star, Send, CheckCircle2, Gamepad2 } from 'lucide-react';

const GAME_MODES = [
  { value: 'impostor', label: '🕵️ Impostor' },
  { value: 'desenho', label: '🎨 Desenho Impostor' },
  { value: 'desafioPalavra', label: '📝 Desafio da Palavra' },
  { value: 'sincronia', label: '🧠 Respostas em Comum' },
  { value: 'palavraBR', label: '⚡ Sincronia Battle Royale' },
];

const RATING_LABELS: Record<number, { text: string; emoji: string }> = {
  1: { text: 'Muito ruim', emoji: '😞' },
  2: { text: 'Ruim', emoji: '😕' },
  3: { text: 'Ok', emoji: '😐' },
  4: { text: 'Bom', emoji: '😊' },
  5: { text: 'Incrível!', emoji: '🤩' },
};

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [gameMode, setGameMode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const activeRating = hovered || rating;
  const alreadyDone = typeof window !== 'undefined' && localStorage.getItem('tikjogos_feedback_done') === '1';

  const submit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/analytics/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          gameMode: gameMode || null,
        }),
      });
      if (!res.ok) throw new Error('Erro ao enviar');
      localStorage.setItem('tikjogos_feedback_done', '1');
      setDone(true);
    } catch {
      setError('Algo deu errado. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-2xl mx-auto w-full">
        <Link href="/">
          <a className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
            <ArrowLeft size={16} />
            Voltar
          </a>
        </Link>
        <div className="flex items-center gap-2 text-white/20 text-sm">
          <Gamepad2 size={16} />
          TikJogos
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {done || alreadyDone ? (
            /* ── Thank you state ── */
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-3">
                Obrigado! 🎉
              </h1>
              <p className="text-white/50 text-lg mb-8">
                Seu feedback nos ajuda a melhorar o TikJogos para todo mundo.
              </p>
              <Link href="/">
                <a className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-lg border-b-4 border-indigo-800 hover:brightness-110 transition-all active:border-b-0 active:translate-y-1">
                  <Gamepad2 size={20} />
                  Jogar mais
                </a>
              </Link>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Title */}
              <div className="text-center mb-10">
                <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">
                  Sua opinião importa
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                  O que você acha<br />
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    do TikJogos?
                  </span>
                </h1>
                <p className="text-white/40 text-base">
                  Leva menos de 1 minuto e nos ajuda muito.
                </p>
              </div>

              {/* Card */}
              <div className="bg-[#1a1d2e] border border-white/[0.07] rounded-3xl p-8 shadow-2xl space-y-8">

                {/* Stars */}
                <div>
                  <p className="text-white/50 text-sm font-semibold mb-4 text-center">
                    Sua nota geral
                  </p>
                  <div className="flex justify-center gap-3 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform duration-100 hover:scale-110 active:scale-95 focus:outline-none"
                      >
                        <Star
                          size={52}
                          className={`transition-all duration-150 drop-shadow-lg ${
                            star <= activeRating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'fill-white/[0.06] text-white/10'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className={`text-center transition-all duration-200 h-8 flex items-center justify-center gap-2 ${activeRating > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-2xl">{RATING_LABELS[activeRating]?.emoji}</span>
                    <span className="text-amber-400 font-bold text-lg">{RATING_LABELS[activeRating]?.text}</span>
                  </div>
                </div>

                {/* Game mode */}
                <div>
                  <p className="text-white/50 text-sm font-semibold mb-3">
                    Qual modo você mais joga? <span className="text-white/25 font-normal">(opcional)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {GAME_MODES.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setGameMode(prev => prev === m.value ? '' : m.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border ${
                          gameMode === m.value
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-white/[0.04] border-white/[0.07] text-white/50 hover:border-white/20 hover:text-white/70'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-white/50 text-sm font-semibold mb-3">
                    Quer falar mais alguma coisa? <span className="text-white/25 font-normal">(opcional)</span>
                  </p>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="O que você mais gosta? O que poderia melhorar? Algum bug?"
                    maxLength={500}
                    rows={4}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-white text-sm placeholder:text-white/25 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors leading-relaxed"
                  />
                  <p className="text-white/20 text-xs text-right mt-1">{comment.length}/500</p>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                {/* Submit */}
                <button
                  onClick={submit}
                  disabled={rating === 0 || submitting}
                  className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-200 border-b-4 ${
                    rating === 0
                      ? 'bg-white/[0.06] text-white/25 border-white/[0.04] cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  <Send size={20} />
                  {submitting ? 'Enviando...' : 'Enviar avaliação'}
                </button>

                {rating === 0 && (
                  <p className="text-white/25 text-xs text-center -mt-4">
                    Selecione uma nota para continuar
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
