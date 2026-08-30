import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Gamepad2, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import logoTikjogos from "@assets/logo_nova_tikjogos (1).png";

export default function Login() {
  const [, navigate] = useLocation();
  const requestedReturnTo = new URLSearchParams(window.location.search).get("returnTo") || "/conta";
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//") ? requestedReturnTo : "/conta";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const googleStatus = new URLSearchParams(window.location.search).get("google");
    if (googleStatus === "unavailable") setError("O login com Google não está configurado neste ambiente. No site público, ele usa as credenciais salvas no Render.");
    if (googleStatus === "error") setError("O Google não conseguiu concluir o login. Confira as credenciais e a URL de retorno.");
    if (googleStatus === "unverified") setError("A conta Google precisa ter um e-mail verificado.");
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível continuar.");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate(returnTo);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return <div className="min-h-screen bg-[#1a1b2e] px-4 py-10 text-white">
    <div className="mx-auto w-full max-w-md">
      <Link href="/" className="mb-8 flex justify-center"><img src={logoTikjogos} alt="TikJogos" className="h-12 w-auto" /></Link>
      <div className="rounded-[2rem] border-4 border-[#2f3252] bg-[#242642] p-6 shadow-2xl sm:p-8">
        <div className="text-center"><UserRound className="mx-auto h-10 w-10 text-purple-400" /><h1 className="mt-3 text-3xl font-black">{mode === "login" ? "Entrar" : "Criar conta"}</h1><p className="mt-2 text-sm text-slate-400">Salve suas preferências e vincule seus apoios.</p></div>
        <a href={`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-600 bg-white px-4 py-3 font-black text-slate-900 hover:bg-slate-100"><span className="text-xl font-bold text-blue-600">G</span> Continuar com Google</a>
        <div className="my-5 flex items-center gap-3 text-xs font-bold text-slate-500"><span className="h-px flex-1 bg-slate-700" />OU<span className="h-px flex-1 bg-slate-700" /></div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && <label className="block"><span className="mb-1 block text-sm font-bold text-slate-300">Nome</span><div className="relative"><UserRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-500"/><input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border-2 border-slate-600 bg-[#1a1b2e] py-3 pl-11 pr-3 outline-none focus:border-purple-400" required /></div></label>}
          <label className="block"><span className="mb-1 block text-sm font-bold text-slate-300">E-mail</span><div className="relative"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border-2 border-slate-600 bg-[#1a1b2e] py-3 pl-11 pr-3 outline-none focus:border-purple-400" required /></div></label>
          <label className="block"><span className="mb-1 block text-sm font-bold text-slate-300">Senha</span><div className="relative"><LockKeyhole className="absolute left-3 top-3.5 h-5 w-5 text-slate-500"/><input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border-2 border-slate-600 bg-[#1a1b2e] py-3 pl-11 pr-3 outline-none focus:border-purple-400" required /></div></label>
          {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-bold text-rose-300">{error}</p>}
          <button disabled={loading} className="btn-green mt-2 flex w-full items-center justify-center gap-2">{loading?<Loader2 className="h-5 w-5 animate-spin"/>:<Gamepad2 className="h-5 w-5"/>}{mode === "login" ? "Entrar" : "Criar conta"}</button>
        </form>
        <button onClick={()=>{setMode(mode === "login" ? "register" : "login");setError("")}} className="mt-5 w-full text-sm font-bold text-purple-300 hover:text-purple-200">{mode === "login" ? "Ainda não tenho conta" : "Já tenho uma conta"}</button>
      </div>
    </div>
  </div>;
}
