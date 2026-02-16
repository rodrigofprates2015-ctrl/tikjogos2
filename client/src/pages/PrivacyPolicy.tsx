import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Youtube, Instagram, MessageCircle } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SideAds, BottomAd } from "@/components/AdSense";
import logoTikjogos from "@assets/logo_nova_tikjogos (1).png";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Política de Privacidade - TikJogos";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#1a1b2e' }}>
      {/* Navigation */}
      <MobileNav />

      {/* Side Ads */}
      <SideAds />

      {/* Bottom Ad */}
      <BottomAd />

      <main className="flex-grow pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-2xl border-2 border-blue-500/20 text-blue-400 font-black text-sm uppercase tracking-widest mb-6">
              <Shield className="w-5 h-5" /> PROTOCOLO DE SEGURANÇA
            </div>
            <h1 className="text-5xl md:text-7xl text-white font-black mb-4">
              Política de <span className="text-blue-500">Privacidade</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest">Última atualização: 04/02/2026</p>
          </header>

          <div className="bg-[#242642] rounded-[3rem] p-8 md:p-12 border-4 border-[#2f3252] shadow-2xl space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">1</span>
                Informações que Coletamos
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Este jogo não coleta informações pessoais identificáveis. Os apelidos inseridos são temporários e não são armazenados permanentemente em nossos servidores.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">2</span>
                Cookies e Tecnologias de Rastreamento
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Utilizamos cookies para melhorar a experiência do usuário e para fins de publicidade. Terceiros, incluindo o Google, podem usar cookies para exibir anúncios com base em visitas anteriores ao nosso site ou a outros sites.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">3</span>
                Google AdSense
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Este site utiliza o Google AdSense para exibir anúncios. O Google AdSense usa cookies para veicular anúncios com base nas visitas anteriores dos usuários ao nosso site e a outros sites na Internet.
                <br/><br/>
                Você pode desativar a publicidade personalizada visitando as Configurações de Anúncios do Google.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">4</span>
                Dados de Jogo
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                As salas de jogo e sessões são temporárias e armazenadas apenas na memória do servidor. Não mantemos registros permanentes de partidas, jogadores ou resultados.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">5</span>
                Seus Direitos
              </h2>
              <ul className="list-disc list-inside text-slate-400 text-lg space-y-2 ml-4">
                <li>Acessar informações sobre quais dados coletamos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Optar por não receber publicidade personalizada</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">6</span>
                Contato
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Para dúvidas sobre esta política de privacidade ou qualquer outro assunto, entre em contato conosco através do email:
                <br/>
                <a href="mailto:rodrigo.f.prates2033@gmail.com" className="text-blue-400 font-bold hover:underline">rodrigo.f.prates2033@gmail.com</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">7</span>
                Alterações nesta Política
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Podemos atualizar esta política periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre como protegemos suas informações.
              </p>
            </section>

            <div className="pt-10 border-t border-white/5 text-slate-500 text-sm font-medium space-y-4">
              <p>© 2026 TikJogos. Todos os direitos reservados.</p>
              <p className="italic leading-relaxed">
                O TikJogos é um projeto independente de fãs. Todas as marcas registradas (como nomes de personagens e franquias) pertencem aos seus respectivos proprietários e são usadas aqui apenas para fins de referência em contexto de jogo de palavras/trivia.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t-8 border-[#242642] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center cursor-pointer">
                <img 
                  src={logoTikjogos} 
                  alt="TikJogos Impostor" 
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-400 max-w-md text-lg font-medium">
                A experiência definitiva de dedução social no espaço. Junte-se a milhares de tripulantes e descubra quem é o traidor.
              </p>
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@RAPMUGEN?sub_confirmation=1" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Youtube className="w-6 h-6 text-white" />
                </a>
                <a href="https://www.instagram.com/jogodoimpostor/" target="_blank" rel="noopener noreferrer" title="Instagram" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" title="Discord" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <MessageCircle className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">NAVEGAÇÃO</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold text-left">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Início</Link></li>
                <li><Link href="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
                <li><Link href="/comojogar" className="hover:text-purple-400 transition-colors">Como Jogar</Link></li>
                <li><Link href="/jogo-do-impostor/temas" className="hover:text-purple-400 transition-colors">Temas</Link></li>
                <li><Link href="/modos" className="hover:text-purple-400 transition-colors">Modos de Jogo</Link></li>
                <li><Link href="/termos" className="hover:text-purple-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-purple-400 transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">SUPORTE</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold text-left">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Reportar Bug</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Contato</Link></li>
                <li>
                  <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                    Discord Oficial
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-slate-500 font-bold">© 2026 TikJogos Entertainment. Todos os direitos reservados.</p>
              <p className="text-slate-600 text-[10px] md:text-xs italic max-w-3xl leading-relaxed">
                O TikJogos é um projeto independente de fãs. Todas as marcas registradas (como nomes de personagens e franquias) pertencem aos seus respectivos proprietários e são usadas aqui apenas para fins de referência em contexto de jogo de palavras/trivia.
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold whitespace-nowrap">
              <span>Feito com 💜 na Galáxia TikJogos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
