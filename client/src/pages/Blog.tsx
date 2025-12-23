import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, User } from "lucide-react";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import { AdBlockTop, AdBlockInContent, AdBlockBottom } from "@/components/AdBlocks";

export default function Blog() {
  useEffect(() => {
    document.title = "Blog - TikJogos Impostor | Estratégias e Dicas";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Leia artigos, estratégias e dicas sobre o TikJogos Impostor. Aprenda técnicas avançadas para melhorar seu desempenho no jogo de dedução social!");
    }
  }, []);

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Ad Block */}
      <AdBlockTop />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-[#4a90a4] hover:text-[#5aa0b4] transition-colors" data-testid="link-back-home">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </Link>
          <img src={logoTikjogos} alt="TikJogos" className="h-8" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Hero */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="heading-main">
            Blog TikJogos Impostor
          </h1>
          <p className="text-gray-300 text-lg">
            Estratégias, dicas e histórias da comunidade de jogadores
          </p>
        </section>

        {/* Blog Post */}
        <article className="bg-[#16213e]/80 border border-[#3d4a5c] rounded-lg overflow-hidden mb-8">
          {/* Featured Image */}
          <div 
            className="w-full h-80 object-cover bg-gradient-to-r from-[#4a90a4] to-[#e8a045] flex items-center justify-center"
            data-testid="img-blog-featured"
          >
            <h3 className="text-white text-2xl font-bold text-center px-4">
              Estratégias Avançadas para Vencer no TikJogos Impostor
            </h3>
          </div>
          
          {/* Post Content */}
          <div className="p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap gap-6 mb-6 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span data-testid="text-publish-date">21 de Dezembro de 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span data-testid="text-author">Rodrigo Freitas</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" data-testid="heading-post-title">
              5 Estratégias Avançadas para Vencer no TikJogos Impostor
            </h2>

            {/* Content */}
            <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
              <p>
                O TikJogos Impostor é mais do que apenas um jogo de sorte — é um jogo de estratégia, 
                leitura de comportamento e comunicação. Neste artigo, vamos compartilhar 5 estratégias 
                avançadas que podem transformar sua forma de jogar e aumentar significativamente suas 
                chances de vitória.
              </p>

              <div>
                <h3 className="text-xl font-bold text-[#4a90a4] mb-3">1. Domine a Leitura de Dicas</h3>
                <p>
                  A chave para identificar o impostor está em analisar cuidadosamente as dicas que 
                  são dadas. No modo "Palavra Secreta", observe não apenas o que é dito, mas também 
                  como é dito. Uma dica muito genérica ou muito específica pode ser um sinal de que 
                  o impostor está tentando se disfarçar. Preste atenção aos detalhes e padrões.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#4a90a4] mb-3">2. Use a Tática do Silêncio Estratégico</h3>
                <p>
                  Nem sempre você precisa falar muito. Às vezes, ficar quieto e observar pode ser 
                  mais produtivo. Se você é um tripulante com conhecimento, deixe que os outros falem 
                  primeiro. Isso ajuda você a entender quem está fazendo sentido e quem está apenas 
                  fingindo conhecimento. Se você é o impostor, um silêncio estratégico pode evitar 
                  que você diga algo que revele sua identidade.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#4a90a4] mb-3">3. Crie Conexões Verdadeiras com Outros Jogadores</h3>
                <p>
                  Observe quem parece estar "sincronizado" com você nas respostas. Se dois jogadores 
                  estão consistentemente alinhados em suas dicas e interpretações, é provável que 
                  estejam juntos no jogo. O impostor terá dificuldade em manter essa sincronização 
                  porque não tem a mesma informação que os tripulantes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#4a90a4] mb-3">4. Controle Seus Comportamentos Contos</h3>
                <p>
                  Se você é o impostor, evite padrões óbvios. Não fale sempre na mesma ordem ou 
                  sempre com a mesma extensão de dicas. Se você é um tripulante, observe padrões 
                  comportamentais consistentes que possam indicar a falta de conhecimento genuíno.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#4a90a4] mb-3">5. Gerencie Suas Emoções e Comunique-se Efetivamente</h3>
                <p>
                  Por fim, lembre-se de que a comunicação é fundamental. Seja respeitoso, divirta-se 
                  e não leve o jogo para o lado pessoal. Os melhores jogadores são aqueles que conseguem 
                  manter a compostura, analisar informações objetivamente e se comunicar de forma clara 
                  e convincente. A confiança genuína é construída através de consistência nas suas 
                  respostas e comportamento durante o jogo.
                </p>
              </div>

              <p className="text-base">
                <strong>Conclusão:</strong> O TikJogos Impostor recompensa aqueles que conseguem equilibrar 
                observação cuidadosa, estratégia inteligente e comunicação efetiva. Pratique essas estratégias, 
                adapte-as ao seu estilo de jogo e veja como suas vitórias aumentam!
              </p>
            </div>

            {/* CTA */}
            <div className="mt-10 pt-6 border-t border-[#3d4a5c]">
              <Link 
                href="/" 
                className="btn-orange inline-flex items-center gap-2 px-6 py-2"
                data-testid="button-play-now"
              >
                Jogar Agora
              </Link>
            </div>
          </div>
        </article>

        {/* Ad Block In Content */}
        <AdBlockInContent />

        {/* Additional Articles Hint */}
        <section className="text-center py-8">
          <p className="text-gray-400">
            Mais artigos em breve... Acompanhe nosso blog para novas estratégias e dicas!
          </p>
        </section>
      </main>

      {/* Bottom Ad Block */}
      <AdBlockBottom />

      {/* Footer */}
      <footer className="bg-[#0a1628]/90 border-t border-[#3d4a5c] py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>TikJogos Impostor - Jogo de Dedução Social Online</p>
          <p className="mt-2">
            <Link href="/blog" className="hover:text-gray-300 transition-colors">Blog</Link>
            {" | "}
            <Link href="/privacidade" className="hover:text-gray-300 transition-colors">Privacidade</Link>
            {" | "}
            <Link href="/termos" className="hover:text-gray-300 transition-colors">Termos</Link>
          </p>
          <p className="mt-3 text-xs text-gray-600 max-w-2xl mx-auto">
            O TikJogos é um projeto independente de fãs. Todas as marcas registradas (como nomes de personagens e franquias) pertencem aos seus respectivos proprietários e são usadas aqui apenas para fins de referência em contexto de jogo de palavras/trivia.
          </p>
        </div>
      </footer>
    </div>
  );
}
