import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen w-full bg-black text-white font-poppins p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#00f2ea] hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao jogo
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-[#00f2ea]">Termos de Uso</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            <strong className="text-white">Data de vigência:</strong> Outubro de 2024
          </p>

          <p>
            Bem-vindo ao TikJogos! Ao acessar e usar este site, você concorda com os seguintes termos e condições.
          </p>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao usar este site, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concorda com algum destes termos, não use este site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Descrição do Serviço</h2>
            <p>
              O TikJogos é um jogo online gratuito de dedução social inspirado em jogos como Spyfall. O site oferece:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>5 modos de jogo diferentes</li>
              <li>Suporte para 3-15 jogadores</li>
              <li>Interface em português</li>
              <li>Personalização de configurações</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Uso Adequado</h2>
            <p>
              Você concorda em usar o site apenas para fins legais e de acordo com estes termos. É proibido:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Usar o site de forma que viole leis locais, nacionais ou internacionais</li>
              <li>Tentar obter acesso não autorizado ao site ou sistemas relacionados</li>
              <li>Interferir ou interromper o funcionamento do site</li>
              <li>Transmitir vírus, malware ou qualquer código malicioso</li>
              <li>Usar bots, scrapers ou ferramentas automatizadas sem permissão</li>
              <li>Copiar, modificar ou distribuir o conteúdo do site sem autorização</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo do site, incluindo mas não se limitando a texto, gráficos, logos, ícones, imagens, código-fonte e software, é de propriedade do TikJogos ou de seus licenciadores e é protegido por leis de direitos autorais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Conteúdo do Usuário</h2>
            <p>
              Ao jogar, você pode criar salas com nomes de jogadores. Você é responsável pelo conteúdo que fornece e concorda em não usar:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Conteúdo ofensivo, obsceno ou ilegal</li>
              <li>Nomes que violem direitos de terceiros</li>
              <li>Informações falsas ou enganosas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Disponibilidade do Serviço</h2>
            <p>
              Embora nos esforcemos para manter o site disponível 24/7, não garantimos que o serviço será ininterrupto ou livre de erros. Podemos suspender, descontinuar ou modificar o serviço a qualquer momento sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Limitação de Responsabilidade</h2>
            <p>
              O site é fornecido "como está" e "conforme disponível". Não nos responsabilizamos por:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Danos diretos, indiretos, incidentais ou consequentes</li>
              <li>Perda de dados ou lucros</li>
              <li>Interrupção de negócios</li>
              <li>Erros ou omissões no conteúdo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Links Externos</h2>
            <p>
              O site pode conter links para sites de terceiros (Google AdSense, redes sociais). Não somos responsáveis pelo conteúdo ou práticas de privacidade desses sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Anúncios</h2>
            <p>
              O site exibe anúncios do Google AdSense para manter o serviço gratuito. Ao usar o site, você concorda com a exibição desses anúncios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Doações</h2>
            <p>
              Doações são voluntárias e não reembolsáveis. Não oferecem benefícios especiais ou vantagens no jogo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso contínuo do site após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.
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
