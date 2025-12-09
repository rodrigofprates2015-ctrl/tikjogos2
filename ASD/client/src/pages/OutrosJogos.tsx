import { Link } from "wouter";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

const games = [
  {
    id: "wordle",
    name: "Termo",
    description: "Adivinhe a palavra do dia em 6 tentativas",
    href: "/termo",
    color: "from-green-500 to-green-700",
    emoji: "🟩"
  }
];

export default function OutrosJogos() {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center relative py-8 px-4"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Link 
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#1a2a3a] border-2 border-[#3a5a7a] rounded-xl text-white hover:bg-[#2a3a4a] transition-all font-semibold shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Voltar</span>
      </Link>

      <div className="mt-16 mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Gamepad2 className="w-8 h-8 text-[#e8a045]" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Outros Jogos</h1>
        </div>
        <p className="text-[#8aa0b0] text-sm md:text-base">Escolha um jogo para se divertir!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {games.map((game) => (
          <Link
            key={game.id}
            href={game.href}
            className="group relative overflow-hidden rounded-2xl bg-[#1a2a3a] border-2 border-[#3a5a7a] p-6 hover:border-[#e8a045] transition-all duration-300 hover:scale-105"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative z-10">
              <span className="text-4xl mb-3 block">{game.emoji}</span>
              <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
              <p className="text-[#8aa0b0] text-sm">{game.description}</p>
            </div>
          </Link>
        ))}

        <div className="relative overflow-hidden rounded-2xl bg-[#1a2a3a]/50 border-2 border-dashed border-[#3a5a7a] p-6 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl mb-2 block opacity-50">🎮</span>
            <p className="text-[#6a8aaa] text-sm">Em breve mais jogos!</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        <img src={logoTikjogos} alt="TikJogos" className="h-4 md:h-5 mx-auto mb-2" />
      </div>
    </div>
  );
}
