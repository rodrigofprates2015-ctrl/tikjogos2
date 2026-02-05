
import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="animate-fade-in pt-12 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-2xl border-2 border-blue-500/20 text-blue-400 font-black text-sm uppercase tracking-widest mb-6">
            <Shield className="w-5 h-5" /> PROTOCOLO DE SEGURANÇA
          </div>
          <h1 className="font-heading text-5xl md:text-7xl text-white mb-4">
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
    </div>
  );
};

export default PrivacyPolicy;
