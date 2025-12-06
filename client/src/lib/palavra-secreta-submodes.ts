export type PalavraSuperSecretaSubmode = 'classico' | 'natal' | 'clashRoyale' | 'animes' | 'marvel' | 'strangerThings';

export const PALAVRA_SECRETA_SUBMODES: Record<PalavraSuperSecretaSubmode, { title: string; desc: string; words: string[]; image?: string }> = {
  classico: {
    title: 'Clássico',
    desc: 'Palavras aleatórias',
    image: '/submode-classico.png',
    words: ['Sol', 'Carro', 'Casa', 'Cachorro', 'Computador', 'Montanha', 'Pizza', 'Escola', 'Roupa', 'Avião', 'Janela', 'Telefone', 'Bola', 'Relógio', 'Flor', 'Gelo', 'Música', 'Prédio', 'Caminhão', 'Praia']
  },
  natal: {
    title: 'Natal',
    desc: 'Palavras natalinas e de fim de ano',
    image: '/submode-natal.png',
    words: [
      'Papai Noel', 'Árvore de Natal', 'Presente', 'Rena', 'Neve', 'Boneco de Neve', 'Trenó', 
      'Estrela', 'Guirlanda', 'Panetone', 'Peru', 'Ceia', 'Meia de Natal', 'Chaminé', 'Sinos',
      'Vela', 'Anjo', 'Presépio', 'Nascimento', 'Belém', 'Reis Magos', 'Manjedoura', 'Bastão de Doce',
      'Biscoito de Gengibre', 'Chocolate Quente', 'Flocos de Neve', 'Lareira', 'Luzes de Natal',
      'Bola de Natal', 'Cartão de Natal', 'Coral', 'Canção de Natal', 'Duende', 'Polo Norte',
      'Fita Vermelha', 'Azevinho', 'Pinheiro', 'Noite Feliz', 'Feliz Natal', 'Ano Novo',
      'Champanhe', 'Fogos de Artifício', 'Contagem Regressiva', 'Família', 'Abraço', 'Gratidão',
      'Esperança', 'Amor', 'Paz', 'Magia'
    ]
  },
  clashRoyale: {
    title: 'Clash Royale',
    desc: 'Cartas do jogo, personagens, itens',
    image: '/submode-clash-royale.png',
    words: ['Mago', 'Príncipe', 'Mosqueteira', 'Gigante', 'Arqueiras', 'Corredor', 'P.E.K.K.A', 'Golem', 'Dragão Bebê', 'Bruxa', 'Mineiro', 'Cavaleiro', 'Barril de Goblins', 'Tronco', 'Tesla', 'Lava Hound', 'Lenhador', 'Fantasma Real', 'Mago de Gelo', 'Executor']
  },
  animes: {
    title: 'Animes',
    desc: 'Personagens, títulos e coisas relacionadas',
    image: '/submode-animes.png',
    words: ['Goku', 'Naruto', 'Luffy', 'Tanjiro', 'Mikasa', 'Saitama', 'Sasuke', 'Deku', 'Gojo', 'Ichigo', 'Sharingan', 'Bankai', 'Kamehameha', 'Rasengan', 'Titan', 'Shinigami', 'Chakra', 'Espada Nichirin', 'Akatsuki', 'Grimório']
  },
  marvel: {
    title: 'Marvel',
    desc: 'Personagens, itens, filmes',
    image: '/submode-marvel.png',
    words: ['Homem-Aranha', 'Thor', 'Hulk', 'Capitão América', 'Homem de Ferro', 'Viúva Negra', 'Pantera Negra', 'Doutor Estranho', 'Thanos', 'Loki', 'Ultron', 'Groot', 'Rocket', 'Wanda', 'Visão', 'Escudo', 'Mjölnir', 'Joia do Infinito', 'Hydra', 'Vibranium']
  },
  strangerThings: {
    title: 'Stranger Things',
    desc: 'Personagens, itens, locais',
    image: '/submode-stranger-things.png',
    words: ['Eleven', 'Mike', 'Lucas', 'Dustin', 'Will', 'Max', 'Hopper', 'Joyce', 'Vecna', 'Demogorgon', 'Mind Flayer', 'Hawkins', 'Upside Down', 'Barb', 'Robin', 'Steve', 'Billy', 'Eddie', 'Murray', 'Kali', 'Brenner', 'Suzie', 'Erica', 'Laboratório', 'Neva', 'Walkie-talkie', 'Arcade', 'Starcourt', 'Hellfire', 'Byers']
  }
};
