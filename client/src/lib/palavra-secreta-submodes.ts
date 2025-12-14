export type PalavraSuperSecretaSubmode = 'classico' | 'natal' | 'estrategia' | 'animes' | 'herois' | 'seriesMisterio';

export const PALAVRA_SECRETA_SUBMODES: Record<PalavraSuperSecretaSubmode, { title: string; desc: string; longDesc?: string; words: string[]; image?: string }> = {
  classico: {
    title: 'Clássico',
    desc: 'Palavras aleatórias do dia a dia',
    longDesc: 'Teste seu conhecimento geral e blefe com seus amigos usando palavras comuns do cotidiano. Ideal para quem está começando ou quer uma partida descontraída.',
    image: '/submode-classico.png',
    words: ['Sol', 'Carro', 'Casa', 'Cachorro', 'Computador', 'Montanha', 'Pizza', 'Escola', 'Roupa', 'Avião', 'Janela', 'Telefone', 'Bola', 'Relógio', 'Flor', 'Gelo', 'Música', 'Prédio', 'Caminhão', 'Praia']
  },
  natal: {
    title: 'Natal',
    desc: 'Palavras natalinas e de fim de ano',
    longDesc: 'Celebre as festas de fim de ano com palavras relacionadas ao Natal. Perfeito para reuniões em família e comemorações especiais.',
    image: '/submode-natal.png',
    words: [
      'Papai Noel', 'Jesus Cristo', 'Anjo', 'Menino Jesus', 'Reis Magos', 'Elfo', 'Rena', 'Família',
      'Árvore de Natal', 'Presentes', 'Luzes', 'Pisca-pisca', 'Estrela', 'Sino', 'Vela', 'Guirlanda',
      'Bola de Natal', 'Presépio', 'Meia', 'Trenó', 'Chaminé', 'Boneco de neve', 'Floco de neve',
      'Bota', 'Gorro', 'Festão', 'Ceia', 'Peru', 'Panetone', 'Rabanada', 'Uva-passa', 'Nozes',
      'Castanha', 'Vinho quente', 'Canções natalinas', 'Cartão de Natal', 'Tradição', 'Véspera',
      'Amor', 'Paz', 'Esperança', 'Alegria', 'União', 'Magia', 'Perdão', 'Generosidade', 'Harmonia',
      'Fraternidade', 'Reflexão', 'Gratidão', 'Renovação'
    ]
  },
  estrategia: {
    title: 'Jogos de Estratégia',
    desc: 'Termos do mundo dos games de estratégia',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do mundo dos jogos de estratégia. Nossa lista inclui personagens clássicos, tropas, feitiços e itens de batalha.',
    image: '/submode-clash-royale.png',
    words: ['Mago', 'Príncipe', 'Mosqueteira', 'Gigante', 'Arqueiras', 'Corredor', 'P.E.K.K.A', 'Golem', 'Dragão Bebê', 'Bruxa', 'Mineiro', 'Cavaleiro', 'Barril de Goblins', 'Tronco', 'Tesla', 'Lava Hound', 'Lenhador', 'Fantasma Real', 'Mago de Gelo', 'Executor']
  },
  animes: {
    title: 'Mundo dos Animes',
    desc: 'Termos do universo das animações japonesas',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do mundo das animações japonesas. Nossa lista inclui heróis lendários, vilões poderosos, técnicas secretas e itens icônicos.',
    image: '/submode-animes.png',
    words: ['Goku', 'Naruto', 'Luffy', 'Tanjiro', 'Mikasa', 'Saitama', 'Sasuke', 'Deku', 'Gojo', 'Ichigo', 'Sharingan', 'Bankai', 'Kamehameha', 'Rasengan', 'Titan', 'Shinigami', 'Chakra', 'Espada Nichirin', 'Akatsuki', 'Grimório']
  },
  herois: {
    title: 'Universo dos Super-Heróis',
    desc: 'Termos do mundo dos quadrinhos e cinema',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do mundo dos quadrinhos e do cinema. Nossa lista inclui heróis clássicos, vilões intergalácticos e itens mágicos do universo de super-heróis.',
    image: '/submode-marvel.png',
    words: ['Homem-Aranha', 'Thor', 'Hulk', 'Capitão América', 'Homem de Ferro', 'Viúva Negra', 'Pantera Negra', 'Doutor Estranho', 'Thanos', 'Loki', 'Ultron', 'Groot', 'Rocket', 'Wanda', 'Visão', 'Escudo', 'Mjölnir', 'Joia do Infinito', 'Hydra', 'Vibranium']
  },
  seriesMisterio: {
    title: 'Séries de Mistério',
    desc: 'Termos do mundo das séries de suspense',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do mundo das séries de mistério e suspense. Nossa lista inclui personagens enigmáticos, locais misteriosos e criaturas sobrenaturais.',
    image: '/submode-stranger-things.png',
    words: ['Eleven', 'Mike', 'Lucas', 'Dustin', 'Will', 'Max', 'Hopper', 'Joyce', 'Vecna', 'Demogorgon', 'Mind Flayer', 'Hawkins', 'Upside Down', 'Barb', 'Robin', 'Steve', 'Billy', 'Eddie', 'Murray', 'Kali', 'Brenner', 'Suzie', 'Erica', 'Laboratório', 'Neva', 'Walkie-talkie', 'Arcade', 'Starcourt', 'Hellfire', 'Byers']
  }
};
