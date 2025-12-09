import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen w-full bg-black text-white font-poppins p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#00f2ea] hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao jogo
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-[#00f2ea]">Política de Privacidade</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            <strong className="text-white">Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Informações que Coletamos</h2>
            <p>
              Este jogo não coleta informações pessoais identificáveis. Os apelidos inseridos 
              são temporários e não são armazenados permanentemente em nossos servidores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Cookies e Tecnologias de Rastreamento</h2>
            <p>
              Utilizamos cookies para melhorar a experiência do usuário e para fins de publicidade. 
              Terceiros, incluindo o Google, podem usar cookies para exibir anúncios com base em 
              visitas anteriores ao nosso site ou a outros sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Google AdSense</h2>
            <p>
              Este site utiliza o Google AdSense para exibir anúncios. O Google AdSense usa cookies 
              para veicular anúncios com base nas visitas anteriores dos usuários ao nosso site e a 
              outros sites na Internet.
            </p>
            <p className="mt-2">
              Você pode desativar a publicidade personalizada visitando as{" "}
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00f2ea] hover:underline"
              >
                Configurações de Anúncios do Google
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Dados de Jogo</h2>
            <p>
              As salas de jogo e sessões são temporárias e armazenadas apenas na memória do servidor. 
              Não mantemos registros permanentes de partidas, jogadores ou resultados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Seus Direitos</h2>
            <p>
              Você tem o direito de:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Acessar informações sobre quais dados coletamos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Optar por não receber publicidade personalizada</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contato</h2>
            <p>
              Para dúvidas sobre esta política de privacidade, entre em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Recomendamos que você revise 
              esta página regularmente para se manter informado sobre como protegemos suas informações.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} TikJogos. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
