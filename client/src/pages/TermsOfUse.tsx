import { useEffect } from "react";
import { Link } from "wouter";
import { FileText, ChevronLeft, Youtube, Instagram, MessageCircle } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SideAds, BottomAd } from "@/components/AdSense";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

const termsData = [
  { id: 1, title: 'Aceitação dos Termos', content: 'Ao usar este site, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concorda com algum destes termos, não use este site.' },
  { id: 2, title: 'Descrição do Serviço', content: 'O TikJogos é um jogo online gratuito de dedução social. O site oferece: 5 modos de jogo diferentes, suporte para 3-15 jogadores, interface em português e personalização de configurações.' },
  { id: 3, title: 'Uso Adequado', content: 'Você concorda em usar o site apenas para fins legais e de acordo com estes termos. É proibido: Usar o site de forma que viole leis locais, nacionais ou internacionais; Tentar obter acesso não autorizado; Interferir ou interromper o funcionamento; Transmitir vírus ou malware; Usar bots ou scrapers sem permissão; Copiar conteúdo sem autorização.' },
  { id: 4, title: 'Propriedade Intelectual', content: 'Todo o conteúdo original do site, incluindo mas não se limitando a texto, gráficos, logos, imagens, código-fonte e software, é de propriedade do TikJogos ou de seus licenciadores e é protegido por leis de direitos autorais.' },
  { id: 5, title: 'Conteúdo do Usuário', content: 'Ao jogar, você pode criar salas com nomes de jogadores. Você é responsável pelo conteúdo que fornece e concorda em não usar conteúdo ofensivo, obsceno, ilegal ou que viole direitos de terceiros.' },
  { id: 6, title: 'Disponibilidade do Serviço', content: 'Embora nos esforcemos para manter o site disponível 24/7, não garantimos que o serviço será ininterrupto ou livre de erros. Podemos suspender ou modificar o serviço a qualquer momento.' },
  { id: 7, title: 'Limitação de Responsabilidade', content: 'O site é fornecido "como está". Não nos responsabilizamos por danos diretos, indiretos, perda de dados ou lucros, interrupção de negócios ou erros no conteúdo.' },
  { id: 8, title: 'Links Externos', content: 'O site pode conter links para sites de terceiros. Não somos responsáveis pelo conteúdo ou práticas de privacidade desses sites.' },
  { id: 9, title: 'Anúncios', content: 'O site exibe anúncios do Google AdSense para manter o serviço gratuito. Ao usar o site, você concorda com a exibição desses anúncios.' },
  { id: 10, title: 'Doações', content: 'Doações são voluntárias e não reembolsáveis. Não oferecem benefícios especiais ou vantagens no jogo.' },
  { id: 11, title: 'Contato', content: 'Para dúvidas sobre estes termos, entre em contato através do email: rodrigo.f.prates2033@gmail.com' },
  { id: 12, title: 'Modificações dos Termos', content: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso contínuo do site após alterações constitui aceitação dos novos termos.' },
  { id: 13, title: 'Lei Aplicável', content: 'Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.' }
];

export default function TermsOfUse() {
  useEffect(() => {
    document.title = "Termos de Uso - TikJogos";
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-2xl border-2 border-purple-500/20 text-purple-400 font-black text-sm uppercase tracking-widest mb-6">
              <FileText className="w-5 h-5" /> REGRAS DA TRIPULAÇÃO
            </div>
            <h1 className="text-5xl md:text-7xl text-white font-black mb-4">
              Termos de <span className="text-purple-500">Uso</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest">Data de vigência: Outubro de 2024</p>
            
            <Link 
              href="/modos"
              className="mt-8 inline-flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black border-b-4 border-slate-900 transition-all active:translate-y-1 active:border-b-0"
            >
              <ChevronLeft size={20} /> VOLTAR AO JOGO
            </Link>
          </header>

          <div className="bg-[#242642] rounded-[3rem] p-8 md:p-12 border-4 border-[#2f3252] shadow-2xl space-y-12">
            <p className="text-slate-300 text-xl font-medium leading-relaxed italic text-center">
              Bem-vindo ao TikJogos! Ao acessar e usar este site, você concorda com os seguintes termos e condições.
            </p>

            <div className="grid grid-cols-1 gap-10">
              {termsData.map((section) => (
                <section key={section.id} className="space-y-4">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-sm shrink-0">{section.id}</span>
                    {section.title}
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed ml-11">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

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
