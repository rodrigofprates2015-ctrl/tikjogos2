import { useEffect } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Eye, 
  MapPin, 
  Swords, 
  Target, 
  HelpCircle,
  Users,
  AlertTriangle,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import backgroundImg from "@assets/background_natal_1764991979853.webp";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import logoImpostorMobile from "@assets/logo2_1764619562643.png";

const gameModes = [
  {
    id: "palavra-secreta",
    title: "Palavra Secreta",
    icon: Eye,
    color: "#e8a045",
    description: "O modo clássico do jogo! Todos os tripulantes recebem a mesma palavra secreta, exceto o impostor que não sabe qual é.",
    howToPlay: [
      "Todos os jogadores recebem uma palavra, exceto o impostor",
      "Os tripulantes devem dar dicas sobre a palavra sem revelá-la diretamente",
      "O impostor deve fingir que conhece a palavra e tentar descobrir qual é",
      "Após as rodadas de dicas, todos votam em quem acham que é o impostor"
    ],
    tips: [
      "Tripulantes: dêem dicas sutis, não muito óbvias",
      "Impostor: preste atenção nas dicas dos outros para descobrir a palavra",
      "Cuidado com dicas muito específicas que podem entregar a palavra ao impostor"
    ]
  },
  {
    id: "locais-funcoes",
    title: "Locais & Funções",
    icon: MapPin,
    color: "#4a90a4",
    description: "Cada jogador recebe um local e uma função específica. O impostor não sabe o local, mas precisa fingir que sabe!",
    howToPlay: [
      "Tripulantes recebem um local (ex: Hospital) e uma função (ex: Médico)",
      "O impostor não sabe qual é o local",
      "Os jogadores fazem perguntas uns aos outros sobre o local",
      "O impostor deve tentar descobrir o local pelas respostas dos outros"
    ],
    tips: [
      "Faça perguntas que só quem conhece o local saberia responder",
      "Impostor: evite dar respostas muito genéricas ou muito específicas",
      "Observe quem parece confuso com as perguntas"
    ]
  },
  {
    id: "duas-faccoes",
    title: "Duas Facções",
    icon: Swords,
    color: "#c44536",
    description: "Os jogadores são divididos em dois times, cada um com uma palavra diferente. O impostor não pertence a nenhum time!",
    howToPlay: [
      "Metade dos jogadores recebe a Palavra A, outra metade a Palavra B",
      "O impostor não sabe nenhuma das duas palavras",
      "Cada time tenta identificar quem são seus aliados",
      "O impostor tenta se infiltrar em um dos times"
    ],
    tips: [
      "Tente descobrir quem tem a mesma palavra que você",
      "Cuidado para não revelar sua palavra ao time adversário",
      "O impostor pode tentar criar confusão entre os times"
    ]
  },
  {
    id: "categoria-item",
    title: "Categoria + Item",
    icon: Target,
    color: "#3d8b5f",
    description: "Todos sabem a categoria, mas só os tripulantes conhecem o item específico. O impostor sabe a categoria mas não o item!",
    howToPlay: [
      "Uma categoria é revelada para todos (ex: Frutas)",
      "Tripulantes recebem um item específico da categoria (ex: Maçã)",
      "O impostor sabe a categoria mas não o item",
      "Os jogadores devem dar dicas sobre o item sem revelá-lo"
    ],
    tips: [
      "Use características específicas do item para suas dicas",
      "Impostor: tente dar dicas genéricas que se apliquem a vários itens da categoria",
      "Atenção aos jogadores que parecem adivinhar demais"
    ]
  },
  {
    id: "perguntas-diferentes",
    title: "Perguntas Diferentes",
    icon: HelpCircle,
    color: "#9b59b6",
    description: "Tripulantes e impostor recebem perguntas diferentes sobre o mesmo tema. As respostas revelarão quem é o impostor!",
    howToPlay: [
      "Tripulantes recebem uma pergunta (ex: 'Qual seu animal favorito?')",
      "O impostor recebe uma pergunta diferente sobre tema similar",
      "Cada jogador responde sua pergunta em voz alta",
      "As respostas que não fazem sentido revelam o impostor"
    ],
    tips: [
      "Preste atenção se as respostas fazem sentido com o tema",
      "Impostor: tente dar respostas que se encaixem em várias perguntas possíveis",
      "Compare as respostas entre os jogadores"
    ]
  }
];

export default function ComoJogar() {
  useEffect(() => {
    document.title = "Como Jogar - TikJogos Impostor | Regras e Modalidades";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Aprenda como jogar TikJogos Impostor! Descubra as regras de cada modalidade: Palavra Secreta, Locais & Funções, Duas Facções, Categoria + Item e Perguntas Diferentes. Jogue online com amigos!");
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-[#4a90a4] hover:text-[#5aa0b4] transition-colors" data-testid="link-back-home">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao Jogo</span>
          </Link>
          <img src={logoTikjogos} alt="TikJogos" className="h-8" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <img 
            src={logoImpostorMobile} 
            alt="Impostor - Jogo de Dedução Social" 
            className="h-32 md:h-40 mx-auto mb-6"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="heading-main">
            Como Jogar TikJogos Impostor
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Um jogo de dedução social online para jogar com amigos! Descubra quem é o impostor 
            entre os tripulantes através de dicas, perguntas e muita estratégia.
          </p>
        </section>

        {/* Quick Start */}
        <section className="card-retro p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#e8a045]" />
            Início Rápido
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#16213e]/50 rounded-lg p-4 border border-[#3d4a5c]">
              <div className="text-2xl font-bold text-[#e8a045] mb-2">1</div>
              <h3 className="font-semibold text-white mb-1">Crie uma Sala</h3>
              <p className="text-gray-400 text-sm">Digite seu nickname e clique em "Criar Sala"</p>
            </div>
            <div className="bg-[#16213e]/50 rounded-lg p-4 border border-[#3d4a5c]">
              <div className="text-2xl font-bold text-[#e8a045] mb-2">2</div>
              <h3 className="font-semibold text-white mb-1">Convide Amigos</h3>
              <p className="text-gray-400 text-sm">Compartilhe o código da sala com 3 ou mais jogadores</p>
            </div>
            <div className="bg-[#16213e]/50 rounded-lg p-4 border border-[#3d4a5c]">
              <div className="text-2xl font-bold text-[#e8a045] mb-2">3</div>
              <h3 className="font-semibold text-white mb-1">Escolha o Modo</h3>
              <p className="text-gray-400 text-sm">O host seleciona a modalidade e inicia o jogo</p>
            </div>
          </div>
        </section>

        {/* Basic Rules */}
        <section className="card-retro p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4a90a4]" />
            Regras Básicas
          </h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-[#3d8b5f] flex-shrink-0 mt-0.5" />
              <p><strong className="text-white">Tripulantes:</strong> Recebem informações secretas e devem descobrir quem é o impostor através de votação.</p>
            </div>
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-[#c44536] flex-shrink-0 mt-0.5" />
              <p><strong className="text-white">Impostor:</strong> Não recebe a informação secreta e deve fingir que a conhece para não ser descoberto.</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-[#3d8b5f] flex-shrink-0 mt-0.5" />
              <p><strong className="text-white">Votação:</strong> Após a discussão, todos votam em quem acham que é o impostor. O mais votado é eliminado!</p>
            </div>
          </div>
        </section>

        {/* Game Modes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Modalidades de Jogo
          </h2>
          <div className="space-y-6">
            {gameModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <article 
                  key={mode.id} 
                  id={mode.id}
                  className="card-retro p-6"
                  data-testid={`section-mode-${mode.id}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${mode.color}20`, border: `2px solid ${mode.color}` }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: mode.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{mode.title}</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{mode.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#16213e]/50 rounded-lg p-4 border border-[#3d4a5c]">
                      <h4 className="font-semibold text-white mb-2 text-sm uppercase tracking-wide">Como Jogar</h4>
                      <ol className="space-y-2">
                        {mode.howToPlay.map((step, index) => (
                          <li key={index} className="flex gap-2 text-gray-400 text-sm">
                            <span className="text-[#e8a045] font-bold">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-[#16213e]/50 rounded-lg p-4 border border-[#3d4a5c]">
                      <h4 className="font-semibold text-white mb-2 text-sm uppercase tracking-wide">Dicas</h4>
                      <ul className="space-y-2">
                        {mode.tips.map((tip, index) => (
                          <li key={index} className="flex gap-2 text-gray-400 text-sm">
                            <Lightbulb className="w-4 h-4 text-[#e8a045] flex-shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-xl font-bold text-white mb-4">Pronto para Jogar?</h2>
          <p className="text-gray-400 mb-6">Reúna seus amigos e descubra quem é o impostor!</p>
          <Link href="/" className="btn-orange inline-flex items-center gap-2 text-lg px-8 py-3" data-testid="button-play-now">
            Jogar Agora
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a1628]/90 border-t border-[#3d4a5c] py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>TikJogos Impostor - Jogo de Dedução Social Online</p>
          <p className="mt-2">
            <Link href="/privacidade" className="hover:text-gray-300 transition-colors">Privacidade</Link>
            {" | "}
            <Link href="/termos" className="hover:text-gray-300 transition-colors">Termos</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
