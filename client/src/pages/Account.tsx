import { Link, useLocation } from "wouter";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";

export default function Account() {
  const { user, isLoading } = useAuth(); const [, navigate] = useLocation();
  if (isLoading) return <div className="min-h-screen bg-[#1a1b2e]"/>;
  if (!user) { navigate("/entrar"); return null; }
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); queryClient.setQueryData(['/api/auth/user'],null); navigate('/'); }
  return <div className="min-h-screen bg-[#1a1b2e] px-4 py-12 text-white"><div className="mx-auto max-w-xl rounded-[2rem] border-4 border-[#2f3252] bg-[#242642] p-8 text-center shadow-2xl">
    {user.profileImageUrl?<img src={user.profileImageUrl} alt="" className="mx-auto h-20 w-20 rounded-full"/>:<UserRound className="mx-auto h-20 w-20 rounded-full bg-purple-500/20 p-4 text-purple-300"/>}
    <h1 className="mt-4 text-3xl font-black">Olá, {user.firstName || 'jogador'}!</h1><p className="mt-2 text-slate-400">{user.email}</p>
    <div className="mt-7 rounded-xl bg-[#1a1b2e] p-4 text-left"><p className="font-black text-purple-300">Sua conta TikJogos</p><p className="mt-1 text-sm text-slate-400">Em breve, seus apoios e o benefício sem anúncios aparecerão aqui.</p></div>
    <div className="mt-6 flex gap-3"><Link href="/" className="btn-green flex-1 text-center">Voltar</Link><button onClick={logout} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-black hover:bg-slate-600"><LogOut className="h-5 w-5"/>Sair</button></div>
  </div></div>;
}
