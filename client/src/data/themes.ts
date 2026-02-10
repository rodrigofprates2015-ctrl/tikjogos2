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
  {
    slug: 'fortnite',
    categoryId: 'fortnite',
    name: 'Fortnite',
    wordCount: 30,
    icon: '🔫',
    seo: {
      pt: {
        title: 'Jogo do Impostor Fortnite Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Fortnite! Battle Royale, skins e termos do jogo da Epic Games. Grátis e online.',
      },
      en: {
        title: 'Fortnite Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Fortnite theme! Battle Royale, skins and terms from the Epic Games hit. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Fortnite Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Fortnite. Battle Royale, skins y términos del juego de Epic Games. Gratis y online.',
      },
    },
    shortDescription: 'Termos do Battle Royale da Epic Games',
    examples: ['Battle Royale', 'Skin', 'V-Bucks', 'Victory Royale', 'Storm'],
  },
  {
    slug: 'free-fire',
    categoryId: 'freefire',
    name: 'Free Fire',
    wordCount: 30,
    icon: '🔥',
    seo: {
      pt: {
        title: 'Jogo do Impostor Free Fire Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Free Fire! Termos do Battle Royale da Garena. Descubra o impostor entre os jogadores. Grátis e online.',
      },
      en: {
        title: 'Free Fire Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Free Fire theme! Terms from Garena Battle Royale. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Free Fire Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Free Fire. Términos del Battle Royale de Garena. Gratis y online.',
      },
    },
    shortDescription: 'Termos do Battle Royale da Garena',
    examples: ['Booyah', 'Headshot', 'Diamante', 'Ranked', 'Squad'],
  },
  {
    slug: 'brawl-stars',
    categoryId: 'brawlstars',
    name: 'Brawl Stars',
    wordCount: 25,
    icon: '💥',
    seo: {
      pt: {
        title: 'Jogo do Impostor Brawl Stars Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Brawl Stars! Brawlers, modos e termos do jogo da Supercell. Grátis e online.',
      },
      en: {
        title: 'Brawl Stars Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Brawl Stars theme! Brawlers, modes and terms from the Supercell game. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Brawl Stars Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Brawl Stars. Brawlers, modos y términos del juego de Supercell. Gratis y online.',
      },
    },
    shortDescription: 'Termos do jogo de arena da Supercell',
    examples: ['Brawler', 'Showdown', 'Brawl Ball', 'Gem Grab', 'Troféu'],
  },
  {
    slug: 'pokemon',
    categoryId: 'pokemon',
    name: 'Pokémon',
    wordCount: 38,
    icon: '⚡',
    seo: {
      pt: {
        title: 'Jogo do Impostor Pokémon Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Pokémon! Treinadores, pokémons e termos do universo Pokémon. Grátis e online.',
      },
      en: {
        title: 'Pokémon Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Pokémon theme! Trainers, pokémon and terms from the Pokémon universe. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Pokémon Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Pokémon. Entrenadores, pokémon y términos del universo Pokémon. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo Pokémon',
    examples: ['Pikachu', 'Pokébola', 'Ash', 'Evolução', 'Ginásio'],
  },
  {
    slug: 'god-of-war',
    categoryId: 'godofwar',
    name: 'God of War',
    wordCount: 25,
    icon: '⚔️',
    seo: {
      pt: {
        title: 'Jogo do Impostor God of War Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema God of War! Kratos, mitologia e termos da saga épica. Grátis e online.',
      },
      en: {
        title: 'God of War Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the God of War theme! Kratos, mythology and terms from the epic saga. Free and online.',
      },
      es: {
        title: 'Juego del Impostor God of War Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema God of War. Kratos, mitología y términos de la saga épica. Gratis y online.',
      },
    },
    shortDescription: 'Termos da saga épica de Kratos',
    examples: ['Kratos', 'Atreus', 'Ragnarok', 'Leviathan', 'Thor'],
  },
  {
    slug: 'kpop',
    categoryId: 'kpop',
    name: 'K-POP (Grupos)',
    wordCount: 30,
    icon: '🎤',
    seo: {
      pt: {
        title: 'Jogo do Impostor K-POP Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema K-POP! Grupos como BTS, BLACKPINK, TWICE e mais. Grátis e online.',
      },
      en: {
        title: 'K-POP Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the K-POP theme! Groups like BTS, BLACKPINK, TWICE and more. Free and online.',
      },
      es: {
        title: 'Juego del Impostor K-POP Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema K-POP. Grupos como BTS, BLACKPINK, TWICE y más. Gratis y online.',
      },
    },
    shortDescription: 'Grupos do universo K-POP',
    examples: ['BTS', 'BLACKPINK', 'TWICE', 'STRAY KIDS', 'NEWJEANS'],
  },
  {
    slug: 'bts',
    categoryId: 'bts',
    name: 'BTS',
    wordCount: 33,
    icon: '💜',
    seo: {
      pt: {
        title: 'Jogo do Impostor BTS Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema BTS! Membros, músicas e termos do grupo de K-POP mais famoso do mundo. Grátis e online.',
      },
      en: {
        title: 'BTS Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the BTS theme! Members, songs and terms from the world\'s biggest K-POP group. Free and online.',
      },
      es: {
        title: 'Juego del Impostor BTS Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema BTS. Miembros, canciones y términos del grupo de K-POP más famoso del mundo. Gratis y online.',
      },
    },
    shortDescription: 'Termos do grupo BTS e do universo ARMY',
    examples: ['RM', 'Jungkook', 'Dynamite', 'ARMY', 'Butter'],
  },
  {
    slug: 'harry-potter',
    categoryId: 'harrypotter',
    name: 'Harry Potter',
    wordCount: 33,
    icon: '⚡',
    seo: {
      pt: {
        title: 'Jogo do Impostor Harry Potter Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Harry Potter! Personagens, feitiços e locais do mundo bruxo. Grátis e online.',
      },
      en: {
        title: 'Harry Potter Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Harry Potter theme! Characters, spells and locations from the wizarding world. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Harry Potter Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Harry Potter. Personajes, hechizos y lugares del mundo mágico. Gratis y online.',
      },
    },
    shortDescription: 'Termos do mundo bruxo de Hogwarts',
    examples: ['Hogwarts', 'Voldemort', 'Dumbledore', 'Grifinória', 'Horcrux'],
  },
  {
    slug: 'star-wars',
    categoryId: 'starwars',
    name: 'Star Wars',
    wordCount: 35,
    icon: '🌌',
    seo: {
      pt: {
        title: 'Jogo do Impostor Star Wars Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Star Wars! Jedis, Siths e termos da galáxia muito distante. Grátis e online.',
      },
      en: {
        title: 'Star Wars Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Star Wars theme! Jedis, Siths and terms from a galaxy far, far away. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Star Wars Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Star Wars. Jedis, Siths y términos de una galaxia muy lejana. Gratis y online.',
      },
    },
    shortDescription: 'Termos da galáxia de Star Wars',
    examples: ['Darth Vader', 'Luke Skywalker', 'Yoda', 'Jedi', 'Sabre de Luz'],
  },
  {
    slug: 'the-walking-dead',
    categoryId: 'walkingdead',
    name: 'The Walking Dead',
    wordCount: 31,
    icon: '🧟',
    seo: {
      pt: {
        title: 'Jogo do Impostor The Walking Dead Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema The Walking Dead! Personagens e termos do apocalipse zumbi. Grátis e online.',
      },
      en: {
        title: 'The Walking Dead Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with The Walking Dead theme! Characters and terms from the zombie apocalypse. Free and online.',
      },
      es: {
        title: 'Juego del Impostor The Walking Dead Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema The Walking Dead. Personajes y términos del apocalipsis zombi. Gratis y online.',
      },
    },
    shortDescription: 'Termos do apocalipse zumbi',
    examples: ['Rick Grimes', 'Daryl Dixon', 'Negan', 'Caminhantes', 'Alexandria'],
  },
  {
    slug: 'la-casa-de-papel',
    categoryId: 'lacasadepapel',
    name: 'La Casa de Papel',
    wordCount: 31,
    icon: '🎭',
    seo: {
      pt: {
        title: 'Jogo do Impostor La Casa de Papel Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema La Casa de Papel! Personagens e termos da série de assaltos. Grátis e online.',
      },
      en: {
        title: 'La Casa de Papel Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with La Casa de Papel theme! Characters and terms from the heist series. Free and online.',
      },
      es: {
        title: 'Juego del Impostor La Casa de Papel Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema La Casa de Papel. Personajes y términos de la serie de atracos. Gratis y online.',
      },
    },
    shortDescription: 'Termos da série de assaltos',
    examples: ['Professor', 'Tóquio', 'Berlim', 'Máscara de Dalí', 'Bella Ciao'],
  },
  {
    slug: 'the-boys',
    categoryId: 'theboys',
    name: 'The Boys',
    wordCount: 24,
    icon: '🦸‍♂️',
    seo: {
      pt: {
        title: 'Jogo do Impostor The Boys Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema The Boys! Supes, Vought e termos da série de anti-heróis. Grátis e online.',
      },
      en: {
        title: 'The Boys Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with The Boys theme! Supes, Vought and terms from the anti-hero series. Free and online.',
      },
      es: {
        title: 'Juego del Impostor The Boys Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema The Boys. Supes, Vought y términos de la serie de antihéroes. Gratis y online.',
      },
    },
    shortDescription: 'Termos da série de anti-heróis',
    examples: ['Homelander', 'Billy Butcher', 'Starlight', 'Vought', 'Compound V'],
  },
  {
    slug: 'game-of-thrones',
    categoryId: 'got',
    name: 'Game of Thrones',
    wordCount: 34,
    icon: '👑',
    seo: {
      pt: {
        title: 'Jogo do Impostor Game of Thrones Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Game of Thrones! Casas, personagens e termos de Westeros. Grátis e online.',
      },
      en: {
        title: 'Game of Thrones Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Game of Thrones theme! Houses, characters and terms from Westeros. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Game of Thrones Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Game of Thrones. Casas, personajes y términos de Westeros. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo de Westeros',
    examples: ['Jon Snow', 'Daenerys', 'Trono de Ferro', 'Dragões', 'Winterfell'],
  },
  {
    slug: 'round-6',
    categoryId: 'round6',
    name: 'Round 6 (Squid Game)',
    wordCount: 24,
    icon: '🔴',
    seo: {
      pt: {
        title: 'Jogo do Impostor Round 6 Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Round 6 (Squid Game)! Jogos, personagens e termos da série coreana. Grátis e online.',
      },
      en: {
        title: 'Squid Game Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Squid Game theme! Games, characters and terms from the Korean series. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Round 6 Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Round 6 (Squid Game). Juegos, personajes y términos de la serie coreana. Gratis y online.',
      },
    },
    shortDescription: 'Termos da série coreana Squid Game',
    examples: ['Jogador 456', 'Boneca Gigante', 'Dalgona', 'Front Man', 'VIPs'],
  },
  {
    slug: 'one-piece',
    categoryId: 'onepiece',
    name: 'One Piece',
    wordCount: 36,
    icon: '🏴‍☠️',
    seo: {
      pt: {
        title: 'Jogo do Impostor One Piece Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema One Piece! Piratas, Akuma no Mi e termos do Grand Line. Grátis e online.',
      },
      en: {
        title: 'One Piece Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the One Piece theme! Pirates, Devil Fruits and terms from the Grand Line. Free and online.',
      },
      es: {
        title: 'Juego del Impostor One Piece Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema One Piece. Piratas, Akuma no Mi y términos del Grand Line. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo pirata de One Piece',
    examples: ['Luffy', 'Zoro', 'Chapéu de Palha', 'Akuma no Mi', 'Haki'],
  },
  {
    slug: 'attack-on-titan',
    categoryId: 'aot',
    name: 'Attack on Titan',
    wordCount: 24,
    icon: '🗡️',
    seo: {
      pt: {
        title: 'Jogo do Impostor Attack on Titan Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Attack on Titan! Titãs, personagens e termos de Shingeki no Kyojin. Grátis e online.',
      },
      en: {
        title: 'Attack on Titan Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Attack on Titan theme! Titans, characters and terms from Shingeki no Kyojin. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Attack on Titan Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Attack on Titan. Titanes, personajes y términos de Shingeki no Kyojin. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo de Shingeki no Kyojin',
    examples: ['Eren', 'Mikasa', 'Levi', 'Titã Colossal', 'Muralha Maria'],
  },
  {
    slug: 'jujutsu-kaisen',
    categoryId: 'jjk',
    name: 'Jujutsu Kaisen',
    wordCount: 23,
    icon: '👁️',
    seo: {
      pt: {
        title: 'Jogo do Impostor Jujutsu Kaisen Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Jujutsu Kaisen! Feiticeiros, maldições e termos do anime. Grátis e online.',
      },
      en: {
        title: 'Jujutsu Kaisen Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Jujutsu Kaisen theme! Sorcerers, curses and terms from the anime. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Jujutsu Kaisen Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Jujutsu Kaisen. Hechiceros, maldiciones y términos del anime. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo de feiticeiros e maldições',
    examples: ['Gojo', 'Sukuna', 'Yuji', 'Domínio', 'Energia Amaldiçoada'],
  },
  {
    slug: 'demon-slayer',
    categoryId: 'demonslayer',
    name: 'Demon Slayer',
    wordCount: 23,
    icon: '🔥',
    seo: {
      pt: {
        title: 'Jogo do Impostor Demon Slayer Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Demon Slayer! Caçadores, respirações e termos de Kimetsu no Yaiba. Grátis e online.',
      },
      en: {
        title: 'Demon Slayer Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Demon Slayer theme! Hunters, breathing styles and terms from Kimetsu no Yaiba. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Demon Slayer Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Demon Slayer. Cazadores, respiraciones y términos de Kimetsu no Yaiba. Gratis y online.',
      },
    },
    shortDescription: 'Termos de Kimetsu no Yaiba',
    examples: ['Tanjiro', 'Nezuko', 'Muzan', 'Hashira', 'Respiração da Água'],
  },
  {
    slug: 'my-hero-academia',
    categoryId: 'mha',
    name: 'My Hero Academia',
    wordCount: 25,
    icon: '💪',
    seo: {
      pt: {
        title: 'Jogo do Impostor My Hero Academia Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema My Hero Academia! Heróis, vilões e Quirks do universo de Boku no Hero. Grátis e online.',
      },
      en: {
        title: 'My Hero Academia Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the My Hero Academia theme! Heroes, villains and Quirks from Boku no Hero. Free and online.',
      },
      es: {
        title: 'Juego del Impostor My Hero Academia Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema My Hero Academia. Héroes, villanos y Quirks de Boku no Hero. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo de Boku no Hero',
    examples: ['Deku', 'All Might', 'Bakugo', 'Quirk', 'Plus Ultra'],
  },
  {
    slug: 'tokyo-ghoul',
    categoryId: 'tokyoghoul',
    name: 'Tokyo Ghoul',
    wordCount: 22,
    icon: '👹',
    seo: {
      pt: {
        title: 'Jogo do Impostor Tokyo Ghoul Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Tokyo Ghoul! Ghouls, investigadores e termos do anime sombrio. Grátis e online.',
      },
      en: {
        title: 'Tokyo Ghoul Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Tokyo Ghoul theme! Ghouls, investigators and terms from the dark anime. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Tokyo Ghoul Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Tokyo Ghoul. Ghouls, investigadores y términos del anime oscuro. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo sombrio de Tokyo Ghoul',
    examples: ['Kaneki', 'Touka', 'Kagune', 'CCG', 'Anteiku'],
  },
  {
    slug: 'chainsaw-man',
    categoryId: 'chainsawman',
    name: 'Chainsaw Man',
    wordCount: 22,
    icon: '🪚',
    seo: {
      pt: {
        title: 'Jogo do Impostor Chainsaw Man Online – Tema Oficial | TikJogos',
        description: 'Jogue Impostor com tema Chainsaw Man! Demônios, caçadores e termos do anime. Grátis e online.',
      },
      en: {
        title: 'Chainsaw Man Impostor Game Online – Official Theme | TikJogos',
        description: 'Play Impostor with the Chainsaw Man theme! Devils, hunters and terms from the anime. Free and online.',
      },
      es: {
        title: 'Juego del Impostor Chainsaw Man Online – Tema Oficial | TikJogos',
        description: 'Juega Impostor con tema Chainsaw Man. Demonios, cazadores y términos del anime. Gratis y online.',
      },
    },
    shortDescription: 'Termos do universo de Chainsaw Man',
    examples: ['Denji', 'Pochita', 'Makima', 'Power', 'Motoserra'],
  },
];

export function getThemeBySlug(slug: string): ThemeData | undefined {
  return THEMES.find(t => t.slug === slug);
}
