export interface ThemeData {
  slug: string;
  /** Internal category ID used by the game engine */
  categoryId: string;
  name: string;
  wordCount: number;
  icon: string;
  seo: {
    pt: { title: string; description: string };
    en: { title: string; description: string };
    es: { title: string; description: string };
  };
  /** Short PT description shown on the /temas listing */
  shortDescription: string;
  examples: string[];
}

export const THEMES: ThemeData[] = [
  {
    slug: 'classico',
    categoryId: 'classico',
    name: 'Clássico',
    wordCount: 20,
    icon: '🎲',
    seo: {
      pt: {
        title: 'Jogo do Impostor Clássico Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com o tema Clássico! Palavras aleatórias do dia a dia para partidas rápidas e divertidas. Grátis e online.',
      },
      en: {
        title: 'Classic Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Classic theme! Random everyday words for quick and fun matches. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Clásico Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con el tema Clásico. Palabras aleatorias del día a día para partidas rápidas y divertidas. Gratis y online.',
      },
    },
    shortDescription: 'Palavras aleatórias do dia a dia',
    examples: ['Cadeira', 'Hospital', 'Pizza', 'Cachorro', 'Futebol'],
  },
  {
    slug: 'natal',
    categoryId: 'natal',
    name: 'Natal',
    wordCount: 51,
    icon: '🎄',
    seo: {
      pt: {
        title: 'Jogo do Impostor Natal Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema de Natal! Palavras natalinas e de fim de ano para jogar com a família. Grátis e online.',
      },
      en: {
        title: 'Christmas Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Christmas theme! Holiday words to play with family. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Navidad Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema de Navidad. Palabras navideñas para jugar en familia. Gratis y online.',
      },
    },
    shortDescription: 'Palavras natalinas e de fim de ano',
    examples: ['Papai Noel', 'Árvore de Natal', 'Presentes', 'Rena', 'Estrela'],
  },
  {
    slug: 'clash-royale',
    categoryId: 'estrategia',
    name: 'Clash Royale',
    wordCount: 20,
    icon: '⚔️',
    seo: {
      pt: {
        title: 'Jogo do Impostor Clash Royale Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Clash Royale! Cartas, torres e elixir. Descubra o impostor usando palavras-chave do Clash. Grátis e online.',
      },
      en: {
        title: 'Clash Royale Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with Clash Royale theme! Cards, towers and elixir. Find the impostor using Clash keywords. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Clash Royale Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Clash Royale. Cartas, torres y elixir. Descubre al impostor con palabras del Clash. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo de jogos de estratégia',
    examples: ['P.E.K.K.A', 'Mago', 'Gigante', 'Príncipe', 'Golem'],
  },
  {
    slug: 'animes',
    categoryId: 'animes',
    name: 'Mundo dos Animes',
    wordCount: 20,
    icon: '🎌',
    seo: {
      pt: {
        title: 'Jogo do Impostor Animes Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema de Animes! Personagens e termos de Naruto, Dragon Ball, One Piece e mais. Grátis e online.',
      },
      en: {
        title: 'Anime Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Anime theme! Characters and terms from Naruto, Dragon Ball, One Piece and more. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Animes Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema de Animes. Personajes y términos de Naruto, Dragon Ball, One Piece y más. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo das animações japonesas',
    examples: ['Goku', 'Naruto', 'Luffy', 'Kamehameha', 'Sharingan'],
  },
  {
    slug: 'super-herois',
    categoryId: 'herois',
    name: 'Universo dos Super-Heróis',
    wordCount: 20,
    icon: '🦸',
    seo: {
      pt: {
        title: 'Jogo do Impostor Super-Heróis Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema de Super-Heróis! Heróis, vilões e poderes do mundo dos quadrinhos e cinema. Grátis e online.',
      },
      en: {
        title: 'Superheroes Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Superheroes theme! Heroes, villains and powers from comics and movies. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Superhéroes Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema de Superhéroes. Héroes, villanos y poderes del mundo de los cómics y el cine. Gratis y online.',
      },
    },
    shortDescription: 'Termos do mundo dos quadrinhos e do cinema',
    examples: ['Homem-Aranha', 'Thor', 'Thanos', 'Vibranium', 'Mjölnir'],
  },
  {
    slug: 'stranger-things',
    categoryId: 'seriesMisterio',
    name: 'Stranger Things',
    wordCount: 30,
    icon: '👾',
    seo: {
      pt: {
        title: 'Jogo do Impostor Stranger Things Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Stranger Things! Personagens, locais e mistérios da série. Descubra o impostor no Mundo Invertido. Grátis e online.',
      },
      en: {
        title: 'Stranger Things Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with Stranger Things theme! Characters, locations and mysteries from the show. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Stranger Things Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Stranger Things. Personajes, lugares y misterios de la serie. Gratis y online.',
      },
    },
    shortDescription: 'Termos inspirados em séries de suspense',
    examples: ['Eleven', 'Demogorgon', 'Hawkins', 'Upside Down', 'Vecna'],
  },
  {
    slug: 'futebol',
    categoryId: 'futebol',
    name: 'Futebol',
    wordCount: 20,
    icon: '⚽',
    seo: {
      pt: {
        title: 'Jogo do Impostor Futebol Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Futebol! Times brasileiros e termos do esporte. Descubra o impostor entre os craques. Grátis e online.',
      },
      en: {
        title: 'Soccer Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Soccer theme! Brazilian teams and sports terms. Find the impostor among the players. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Fútbol Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Fútbol. Equipos brasileños y términos del deporte. Gratis y online.',
      },
    },
    shortDescription: 'Times brasileiros de futebol',
    examples: ['Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos'],
  },
  {
    slug: 'disney',
    categoryId: 'disney',
    name: 'Disney',
    wordCount: 30,
    icon: '🏰',
    seo: {
      pt: {
        title: 'Jogo do Impostor Disney Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Disney! Personagens e filmes do universo Disney. Descubra o impostor entre os clássicos. Grátis e online.',
      },
      en: {
        title: 'Disney Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Disney theme! Characters and movies from the Disney universe. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Disney Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Disney. Personajes y películas del universo Disney. Gratis y online.',
      },
    },
    shortDescription: 'Personagens e filmes do universo Disney',
    examples: ['Mickey', 'Elsa', 'Simba', 'Buzz Lightyear', 'Moana'],
  },
  {
    slug: 'valorant',
    categoryId: 'valorant',
    name: 'Valorant',
    wordCount: 53,
    icon: '🎯',
    seo: {
      pt: {
        title: 'Jogo do Impostor Valorant Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Valorant! Agentes, mapas e termos do FPS tático da Riot Games. Grátis e online.',
      },
      en: {
        title: 'Valorant Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Valorant theme! Agents, maps and terms from Riot Games tactical FPS. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Valorant Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Valorant. Agentes, mapas y términos del FPS táctico de Riot Games. Gratis y online.',
      },
    },
    shortDescription: 'Termos do FPS tático da Riot Games',
    examples: ['Jett', 'Spike', 'Phantom', 'Ascent', 'Radiant'],
  },
  {
    slug: 'roblox',
    categoryId: 'roblox',
    name: 'Roblox',
    wordCount: 34,
    icon: '🧱',
    seo: {
      pt: {
        title: 'Jogo do Impostor Roblox Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Roblox! Termos da plataforma de jogos online mais popular entre jovens. Grátis e online.',
      },
      en: {
        title: 'Roblox Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Roblox theme! Terms from the most popular online gaming platform. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Roblox Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Roblox. Términos de la plataforma de juegos online más popular. Gratis y online.',
      },
    },
    shortDescription: 'Termos da plataforma de jogos online',
    examples: ['Robux', 'Obby', 'Adopt Me', 'Blox Fruits', 'Avatar'],
  },
  {
    slug: 'supernatural',
    categoryId: 'supernatural',
    name: 'Supernatural',
    wordCount: 36,
    icon: '😈',
    seo: {
      pt: {
        title: 'Jogo do Impostor Supernatural Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Supernatural! Termos da série de caçadores sobrenaturais. Descubra o impostor entre os Winchester. Grátis e online.',
      },
      en: {
        title: 'Supernatural Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Supernatural theme! Terms from the supernatural hunters series. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Supernatural Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Supernatural. Términos de la serie de cazadores sobrenaturales. Gratis y online.',
      },
    },
    shortDescription: 'Termos da série de caçadores sobrenaturais',
    examples: ['Dean', 'Sam', 'Castiel', 'Impala', 'Demônio'],
  },
  {
    slug: 'dragon-ball',
    categoryId: 'dragonball',
    name: 'Dragon Ball',
    wordCount: 36,
    icon: '🐉',
    seo: {
      pt: {
        title: 'Jogo do Impostor Dragon Ball Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Dragon Ball! Personagens, técnicas e termos do universo dos Saiyajins. Grátis e online.',
      },
      en: {
        title: 'Dragon Ball Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Dragon Ball theme! Characters, techniques and terms from the Saiyan universe. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Dragon Ball Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Dragon Ball. Personajes, técnicas y términos del universo Saiyajin. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo dos Saiyajins',
    examples: ['Goku', 'Vegeta', 'Kamehameha', 'Freeza', 'Shenlong'],
  },
  {
    slug: 'naruto',
    categoryId: 'naruto',
    name: 'Naruto',
    wordCount: 35,
    icon: '🍥',
    seo: {
      pt: {
        title: 'Jogo do Impostor Naruto Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Naruto! Jutsus, personagens e termos do mundo ninja de Konoha. Grátis e online.',
      },
      en: {
        title: 'Naruto Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Naruto theme! Jutsus, characters and terms from the ninja world of Konoha. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Naruto Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Naruto. Jutsus, personajes y términos del mundo ninja de Konoha. Gratis y online.',
      },
    },
    shortDescription: 'Termos do mundo ninja de Konoha',
    examples: ['Naruto', 'Sasuke', 'Rasengan', 'Sharingan', 'Akatsuki'],
  },
  {
    slug: 'bandas-de-rock',
    categoryId: 'rock',
    name: 'Bandas de Rock',
    wordCount: 35,
    icon: '🎸',
    seo: {
      pt: {
        title: 'Jogo do Impostor Bandas de Rock Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Bandas de Rock! Bandas icônicas do rock nacional e internacional. Grátis e online.',
      },
      en: {
        title: 'Rock Bands Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Rock Bands theme! Iconic national and international rock bands. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Bandas de Rock Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Bandas de Rock. Bandas icónicas del rock nacional e internacional. Gratis y online.',
      },
    },
    shortDescription: 'Bandas icônicas do rock nacional e internacional',
    examples: ['Metallica', 'Nirvana', 'Legião Urbana', 'AC/DC', 'Queen'],
  },
  {
    slug: 'minecraft',
    categoryId: 'minecraft',
    name: 'Minecraft',
    wordCount: 38,
    icon: '⛏️',
    seo: {
      pt: {
        title: 'Jogo do Impostor Minecraft Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Minecraft! Blocos, mobs e termos do jogo de construção e sobrevivência. Grátis e online.',
      },
      en: {
        title: 'Minecraft Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Minecraft theme! Blocks, mobs and terms from the building and survival game. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Minecraft Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Minecraft. Bloques, mobs y términos del juego de construcción y supervivencia. Gratis y online.',
      },
    },
    shortDescription: 'Termos do jogo de construção e sobrevivência',
    examples: ['Creeper', 'Enderman', 'Diamante', 'Redstone', 'Nether'],
  },
  {
    slug: 'gta',
    categoryId: 'gta',
    name: 'Grand Theft Auto (GTA)',
    wordCount: 37,
    icon: '🚗',
    seo: {
      pt: {
        title: 'Jogo do Impostor GTA Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema GTA! Termos da franquia de jogos de mundo aberto mais famosa. Grátis e online.',
      },
      en: {
        title: 'GTA Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the GTA theme! Terms from the most famous open world game franchise. Free and online.',
      },
      es: {
        title: 'Juego del Impostor GTA Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema GTA. Términos de la franquicia de juegos de mundo abierto más famosa. Gratis y online.',
      },
    },
    shortDescription: 'Termos da franquia de jogos de mundo aberto',
    examples: ['CJ', 'Trevor', 'Los Santos', 'Wanted', 'Heist'],
  },
  {
    slug: 'fnaf',
    categoryId: 'fnaf',
    name: "Five Nights at Freddy's",
    wordCount: 30,
    icon: '🐻',
    seo: {
      pt: {
        title: "Jogo do Impostor Five Nights at Freddy's Online – Tema Oficial | TikJogos",
        description: "Jogue Impostor com tema FNAF! Animatrônicos, locais e termos do universo de terror de Five Nights at Freddy's. Grátis e online.",
      },
      en: {
        title: "Five Nights at Freddy's Impostor Game Online – Official Theme | TikJogos",
        description: "Play Impostor with the FNAF theme! Animatronics, locations and terms from the horror universe. Free and online.",
      },
      es: {
        title: "Juego del Impostor Five Nights at Freddy's Online – Tema Oficial | TikJogos",
        description: "Juega Impostor con tema FNAF. Animatrónicos, lugares y términos del universo de terror. Gratis y online.",
      },
    },
    shortDescription: 'Termos do universo de terror dos animatrônicos',
    examples: ['Freddy', 'Bonnie', 'Chica', 'Foxy', 'Purple Guy'],
  },
];

export function getThemeBySlug(slug: string): ThemeData | undefined {
  return THEMES.find(t => t.slug === slug);
}
