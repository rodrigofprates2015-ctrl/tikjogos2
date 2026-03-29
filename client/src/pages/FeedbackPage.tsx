import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Star, ArrowLeft, RefreshCw, MessageSquare, Trophy, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GAME_MODE_LABELS: Record<string, string> = {
  impostor: '🕵️ Impostor',
  desenho: '🎨 Desenho Impostor',
  desafioPalavra: '📝 Desafio da Palavra',
  sincronia: '🧠 Respostas em Comum',
  palavraBR: '⚡ Sincronia BR',
};

type FeedbackEntry = {
  id: string;
  rating: number;
  comment: string | null;
  gameMode: string | null;
  createdAt: string;
};

type FeedbackData = {
  total: number;
  avgRating: number | null;
  distribution: Array<{ rating: number; count: number }>;
  responses: FeedbackEntry[];
};

function StarRow({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-14 flex-shrink-0">
        <span className="text-white/60 text-sm font-bold">{rating}</span>
        <Star size={13} className="fill-amber-400 text-amber-400" />
      </div>
      <div className="flex-1 bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white/40 text-xs w-16 text-right tabular-nums">{count} ({pct}%)</span>
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-white/10 text-white/10'}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);

  const fetchData = async (t: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/feedback', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) { setToken(null); localStorage.removeItem('adminToken'); return; }
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData(token);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success && json.token) {
        localStorage.setItem('adminToken', json.token);
        setToken(json.token);
      } else {
        setLoginError('Credenciais inválidas');
      }
    } catch {
      setLoginError('Erro de conexão');
    } finally {
      setLoggingIn(false);
    }
  };

  // ── Login screen ──
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <Star size={28} className="fill-amber-400 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Feedback dos Jogadores</h1>
            <p className="text-white/40 text-sm mt-1">Acesso restrito a administradores</p>
          </div>
          <form onSubmit={handleLogin} className="bg-[#1a1d2e] border border-white/[0.07] rounded-3xl p-6 space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
              required
            />
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-sm border-b-4 border-indigo-800 hover:brightness-110 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-50"
            >
              {loggingIn ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = filter ? data?.responses.filter(r => r.rating === filter) : data?.responses;

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Fixed background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="text-white/30 hover:text-white/60 transition-colors">
                <ArrowLeft size={20} />
              </a>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Feedback dos Jogadores</h1>
              <p className="text-white/40 text-sm">{data?.total ?? 0} avaliações recebidas</p>
            </div>
          </div>
          <button
            onClick={() => token && fetchData(token)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {loading && !data ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />)}
          </div>
        ) : !data || data.total === 0 ? (
          <div className="text-center py-24 text-white/30">
            <Star size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold">Nenhuma avaliação ainda</p>
            <p className="text-sm mt-1">As respostas aparecerão aqui após os jogadores avaliarem.</p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: String(data.total), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: 'Nota Média', value: data.avgRating != null ? `${data.avgRating} ★` : '—', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Com Comentário', value: String(data.responses.filter(r => r.comment).length), icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Nota 5 ⭐', value: String(data.distribution.find(d => d.rating === 5)?.count ?? 0), icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-[#1a1d2e] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-medium">{label}</p>
                    <p className="text-white font-black text-xl leading-tight">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Distribution */}
            <div className="bg-[#1a1d2e] border border-white/[0.06] rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <TrendingUp size={16} className="text-amber-400" />
                Distribuição de Notas
              </h2>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => (
                  <StarRow
                    key={star}
                    rating={star}
                    count={data.distribution.find(d => d.rating === star)?.count ?? 0}
                    total={data.total}
                  />
                ))}
              </div>
            </div>

            {/* Responses table */}
            <div className="bg-[#1a1d2e] border border-white/[0.06] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-white font-bold text-base flex items-center gap-2">
                  <MessageSquare size={16} className="text-purple-400" />
                  Respostas
                </h2>
                {/* Filter by star */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === null ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Todas
                  </button>
                  {[5, 4, 3, 2, 1].map(s => (
                    <button
                      key={s}
                      onClick={() => setFilter(filter === s ? null : s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === s ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {s}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filtered && filtered.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">Nenhuma resposta com esse filtro.</p>
                ) : (
                  filtered?.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <StarDisplay rating={r.rating} />
                        <div className="flex items-center gap-3 text-xs text-white/30">
                          {r.gameMode && (
                            <span className="bg-white/[0.05] px-2 py-0.5 rounded-full">
                              {GAME_MODE_LABELS[r.gameMode] ?? r.gameMode}
                            </span>
                          )}
                          <span>{r.createdAt ? format(new Date(r.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR }) : ''}</span>
                        </div>
                      </div>
                      {r.comment ? (
                        <p className="text-white/70 text-sm leading-relaxed">{r.comment}</p>
                      ) : (
                        <p className="text-white/20 text-xs italic">Sem comentário</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
