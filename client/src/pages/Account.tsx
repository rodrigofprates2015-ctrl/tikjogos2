import { Link, useLocation } from "wouter";
import { Gamepad2, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

type AccountTheme = { id: string; titulo: string; autor: string; palavrasCount: number; accessCode: string; isPublic: boolean; approved: boolean; isOwner: boolean };

export default function Account() {
  const { user, isLoading } = useAuth(); const [, navigate] = useLocation();
  const { data: themes = [], isLoading: themesLoading } = useQuery<AccountTheme[]>({
    queryKey: ['/api/themes/mine'],
    enabled: Boolean(user),
  });
  if (isLoading) return <div className="min-h-screen bg-[#1a1b2e]"/>;
  if (!user) { navigate("/entrar"); return null; }
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); queryClient.setQueryData(['/api/auth/user'],null); navigate('/'); }
  return <div className="min-h-screen bg-[#1a1b2e] px-4 py-12 text-white"><div className="mx-auto max-w-xl rounded-[2rem] border-4 border-[#2f3252] bg-[#242642] p-8 text-center shadow-2xl">
    {user.profileImageUrl?<img src={user.profileImageUrl} alt="" className="mx-auto h-20 w-20 rounded-full"/>:<UserRound className="mx-auto h-20 w-20 rounded-full bg-purple-500/20 p-4 text-purple-300"/>}
    <h1 className="mt-4 text-3xl font-black">Olá, {user.firstName || 'jogador'}!</h1><p className="mt-2 text-slate-400">{user.email}</p>
    <div className="mt-7 rounded-xl bg-[#1a1b2e] p-4 text-left"><p className="font-black text-purple-300">Sua conta TikJogos</p><p className="mt-1 text-sm text-slate-400">Seus temas ficam vinculados a esta conta e aparecem automaticamente ao criar uma partida.</p></div>
    <section className="mt-5 text-left">
      <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><Gamepad2 className="h-5 w-5 text-violet-300"/> Meus temas</h2><Link href="/criar-tema" className="text-xs font-black text-violet-300 hover:text-violet-200">Criar tema</Link></div>
      {themesLoading ? <p className="text-sm text-slate-400">Carregando...</p> : themes.length === 0 ? <p className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">Você ainda não criou nem adicionou temas à sua conta.</p> : <div className="space-y-2">{themes.map(theme => <article key={theme.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3"><div className="flex items-start justify-between gap-3"><div><strong className="block text-white">{theme.titulo}</strong><span className="text-xs text-slate-400">{theme.palavrasCount} palavras · {theme.isPublic ? (theme.approved ? 'Público' : 'Aguardando aprovação pública') : 'Privado'}</span></div><code className="rounded-lg bg-violet-500/15 px-2 py-1 text-xs font-black text-violet-200">{theme.accessCode}</code></div></article>)}</div>}
    </section>
    <div className="mt-6 flex gap-3"><Link href="/" className="btn-green flex-1 text-center">Voltar</Link><button onClick={logout} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-black hover:bg-slate-600"><LogOut className="h-5 w-5"/>Sair</button></div>
  </div></div>;
}
