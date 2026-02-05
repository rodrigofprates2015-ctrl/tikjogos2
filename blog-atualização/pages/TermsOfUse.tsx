
import React from 'react';
import { FileText, ChevronLeft } from 'lucide-react';

const TermsOfUse: React.FC = () => {
  return (
    <div className="animate-fade-in pt-12 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-2xl border-2 border-purple-500/20 text-purple-400 font-black text-sm uppercase tracking-widest mb-6">
            <FileText className="w-5 h-5" /> REGRAS DA TRIPULAÇÃO
          </div>
          <h1 className="font-heading text-5xl md:text-7xl text-white mb-4">
            Termos de <span className="text-purple-500">Uso</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest">Data de vigência: Outubro de 2024</p>
          
          <button 
            onClick={() => window.location.hash = '#/modos'}
            className="mt-8 inline-flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black border-b-4 border-slate-900 transition-all active:translate-y-1 active:border-b-0"
          >
            <ChevronLeft size={20} /> VOLTAR AO JOGO
          </button>
        </header>

        <div className="bg-[#242642] rounded-[3rem] p-8 md:p-12 border-4 border-[#2f3252] shadow-2xl space-y-12">
          <p className="text-slate-300 text-xl font-medium leading-relaxed italic text-center">
            Bem-vindo ao TikJogos! Ao acessar e usar este site, você concorda com os seguintes termos e condições.
          </p>

          <div className="grid grid-cols-1 gap-10">
            {[
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
            ].map((section) => (
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
    </div>
  );
};

export default TermsOfUse;
