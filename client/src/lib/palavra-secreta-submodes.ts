export type PalavraSuperSecretaSubmode = 'classico' | 'natal' | 'estrategia' | 'animes' | 'herois' | 'seriesMisterio' | 'valorant' | 'futebol' | 'disney' | 'roblox' | 'supernatural' | 'dragonball' | 'naruto' | 'rock' | 'minecraft' | 'gta' | 'fnaf' | 'fortnite' | 'freefire' | 'brawlstars' | 'pokemon' | 'godofwar' | 'kpop' | 'bts' | 'harrypotter' | 'starwars' | 'walkingdead' | 'lacasadepapel' | 'theboys' | 'got' | 'round6' | 'onepiece' | 'aot' | 'jjk' | 'demonslayer' | 'mha' | 'tokyoghoul' | 'chainsawman';

export const PALAVRA_SECRETA_SUBMODES: Record<PalavraSuperSecretaSubmode, { title: string; desc: string; longDesc?: string; words: string[]; image?: string }> = {
  classico: {
    title: 'Clássico',
    desc: 'Palavras aleatórias do dia a dia',
    longDesc: 'Teste seu conhecimento geral e blefe com seus amigos usando palavras comuns do cotidiano. Ideal para quem está começando ou quer uma partida descontraída.',
    image: 'https://img.freepik.com/vetores-gratis/gradiente-de-volta-a-colecao-de-elementos-da-escola_52683-87525.jpg?semt=ais_incoming&w=740&q=80',
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
    title: 'Clash Royale',
    desc: 'Termos do mundo dos games de estratégia',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Clash Royale. Nossa lista inclui personagens clássicos, tropas, feitiços e itens de batalha.',
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
    title: 'Stranger Things',
    desc: 'Termos do mundo das séries de suspense',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Stranger Things. Nossa lista inclui personagens enigmáticos, locais misteriosos e criaturas sobrenaturais.',
    image: '/submode-stranger-things.png',
    words: ['Eleven', 'Mike', 'Lucas', 'Dustin', 'Will', 'Max', 'Hopper', 'Joyce', 'Vecna', 'Demogorgon', 'Mind Flayer', 'Hawkins', 'Upside Down', 'Barb', 'Robin', 'Steve', 'Billy', 'Eddie', 'Murray', 'Kali', 'Brenner', 'Suzie', 'Erica', 'Laboratório', 'Neva', 'Walkie-talkie', 'Arcade', 'Starcourt', 'Hellfire', 'Byers']
  },
  futebol: {
    title: 'Futebol',
    desc: 'Times brasileiros de futebol',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando nomes dos principais times de futebol do Brasil. Criado por Maylon.',
    image: 'https://media.torcedores.com/wp-content/uploads/2025/01/clubes-brasileiros-torcedores-768x512.webp',
    words: ['Flamengo', 'Corinthians', 'São Paulo', 'Palmeiras', 'Santos', 'Vasco da Gama', 'Cruzeiro', 'Grêmio', 'Internacional', 'Atlético Mineiro', 'Fluminense', 'Botafogo', 'Atlético Paranaense', 'Bahia', 'Esporte', 'Vitória', 'Coritiba', 'Goiás', 'Fortaleza', 'Ceará']
  },
  disney: {
    title: 'Disney',
    desc: 'Personagens e filmes da Disney',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do universo Disney. Nossa lista inclui personagens clássicos, princesas, filmes e muito mais. Criado por @Luciana.',
    image: 'https://lumiere-a.akamaihd.net/v1/images/au_shop_disney_po_card_m_b2c9fa25.jpeg?region=0,0,1024,640&width=768',
    words: ['Mickey', 'Minnie', 'Donald', 'Pateta', 'Plutão', 'Princesa', 'Castelo', 'Pixar', 'Maravilha', 'Star Wars', 'Congelado', 'Elsa', 'Ana', 'Simba', 'Rei Leão', 'Aladdin', 'Jasmim', 'Ariel', 'Moana', 'Rapunzel', 'Encanto', 'Buzz Lightyear', 'Woody', 'Toy Story', 'Nemo', 'Monstros SA', 'Ponto', 'Pocahontas', 'Bela', 'Fera']
  },
  valorant: {
    title: 'Valorant',
    desc: 'Termos do FPS tático da Riot Games',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Valorant. Nossa lista inclui agentes, mapas, armas, ranks e mecânicas do jogo.',
    image: 'https://s2-ge.glbimg.com/N7BSSNFFK-QSWrgf0n_e0piPtDo=/0x0:2560x1440/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2020/4/G/xXHeVfTGe4bMldoEdMRQ/valorant-riot-games.jpg',
    words: ['Spike', 'Plant', 'Defuse', 'Clutch', 'Ace', 'Headshot', 'Ranked', 'Radiant', 'Immortal', 'Ascendant', 'Diamond', 'Platinum', 'Gold', 'Jett', 'Phoenix', 'Sage', 'Sova', 'Viper', 'Cypher', 'Reyna', 'Killjoy', 'Breach', 'Omen', 'Raze', 'Skye', 'Yoru', 'Astra', 'KAY/O', 'Chamber', 'Neon', 'Fade', 'Harbor', 'Gekko', 'Deadlock', 'Iso', 'Clove', 'Vyse', 'Ascent', 'Bind', 'Haven', 'Split', 'Breeze', 'Fracture', 'Lotus', 'Icebox', 'Pearl', 'Sunset', 'Vandal', 'Phantom', 'Operator', 'Sheriff', 'Spectre', 'Guardian']
  },
  roblox: {
    title: 'Roblox',
    desc: 'Termos da plataforma de jogos online',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Roblox. Nossa lista inclui jogos populares, itens, moedas e gírias da comunidade.',
    image: 'https://mms.businesswire.com/media/20250721501887/en/1572614/22/Roblox_Logo_2022-1.jpg',
    words: ['Robux', 'Avatar', 'Noob', 'Admin', 'Ban', 'Parkour', 'Tycoon', 'Adopt Me', 'Brookhaven', 'Bloxburg', 'Murder Mystery 2', 'Doors', 'Piggy', 'Pet Simulator', 'Obby', 'Oof', 'Builder\'s Club', 'Premium', 'Evento', 'Skin', 'Item', 'Chat', 'Mapa', 'Servidor', 'Hacker', 'Glitch', 'Trade', 'Showcase', 'Tower of Hell', 'Arsenal', 'MeepCity', 'BedWars', 'Natural Disaster', 'Jailbreak']
  },
  supernatural: {
    title: 'Supernatural',
    desc: 'Termos da série de caçadores sobrenaturais',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos da série Supernatural. Nossa lista inclui personagens icônicos, criaturas, armas e locais místicos.',
    image: 'https://s2-techtudo.glbimg.com/PHWR4IpnXdwfzsE1Pnpx4a-I1Rg=/0x0:1152x642/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2022/Q/B/jsII7RTcinvxCpSjcrRg/divulgacao-warner-bros.jpg',
    words: ['Dean Winchester', 'Sam Winchester', 'Castiel', 'Crowley', 'Impala 67', 'Bobby Singer', 'Lucifer', 'Anjo', 'Demônio', 'Fantasma', 'Sal Grosso', 'Água Benta', 'Bunker', 'Apocalipse', 'Caçador', 'Diário de John', 'Purgatório', 'Inferno', 'Céu', 'Colt', 'Faca de Ruby', 'Marca de Caim', 'Possessão', 'Exorcismo', 'Encruzilhada', 'Pacto', 'John Winchester', 'Mary Winchester', 'Rowena', 'Chuck (Deus)', 'Escuridão (Amara)', 'Metatron', 'Leviatã', 'Vampiro', 'Lobisomem', 'Kansas']
  },
  dragonball: {
    title: 'Dragon Ball',
    desc: 'Termos do universo dos Saiyajins',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Dragon Ball. Nossa lista inclui personagens lendários, transformações, técnicas e itens místicos.',
    image: 'https://jpimg.com.br/uploads/2018/04/dragon-ball-z.jpg',
    words: ['Goku', 'Vegeta', 'Gohan', 'Piccolo', 'Freeza', 'Cell', 'Majin Boo', 'Esferas do Dragão', 'Shenlong', 'Saiyajin', 'Super Saiyajin', 'Kamehameha', 'Genki Dama', 'Fusão', 'Potara', 'Trunks', 'Goten', 'Bulma', 'Kuririn', 'Mestre Kame', 'Nuvem Voadora', 'Radar do Dragão', 'Torneio de Artes Marciais', 'Ki', 'Teletransporte', 'Androide 18', 'Bills', 'Whis', 'Broly', 'Planeta Vegeta', 'Oozaru (Macaco Gigante)', 'Senhor Kaioh', 'Semente dos Deuses', 'Zeno', 'Bardock', 'Cápsula Corp']
  },
  naruto: {
    title: 'Naruto',
    desc: 'Termos do mundo ninja de Konoha',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Naruto. Nossa lista inclui ninjas lendários, jutsus poderosos, vilas e técnicas secretas.',
    image: 'https://s.aficionados.com.br/imagens/naruto-1-0_cke.jpg',
    words: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake', 'Hokage', 'Vila da Folha (Konoha)', 'Chakra', 'Rasengan', 'Chidori', 'Sharingan', 'Byakugan', 'Rinnegan', 'Akatsuki', 'Itachi Uchiha', 'Gaara', 'Orochimaru', 'Jiraiya', 'Tsunade', 'Hinata Hyuga', 'Kurama (Raposa de 9 Caudas)', 'Bijuu', 'Jinchuuriki', 'Kunai', 'Shuriken', 'Bandana Ninja', 'Exame Chunin', 'Vale do Fim', 'Madara Uchiha', 'Obito', 'Pain', 'Jutsu Sexy', 'Clone das Sombras', 'Vila da Névoa', 'Ramen do Ichiraku', 'Dattebayo']
  },
  rock: {
    title: 'Bandas de Rock',
    desc: 'Bandas icônicas do rock nacional e internacional',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando nomes de bandas de rock. Nossa lista inclui clássicos internacionais e nacionais que marcaram gerações.',
    image: 'https://img.freepik.com/vetores-gratis/efeito-de-texto-editavel-de-musica-vintage-estilo-de-texto-retro-dos-anos-70-e-80_314614-1116.jpg?semt=ais_hybrid&w=740&q=80',
    words: ['The Beatles', 'Rolling Stones', 'Queen', 'AC/DC', 'Guns N\' Roses', 'Nirvana', 'Metallica', 'Iron Maiden', 'Pink Floyd', 'Led Zeppelin', 'Red Hot Chili Peppers', 'Linkin Park', 'Kiss', 'Aerosmith', 'Bon Jovi', 'U2', 'Coldplay', 'Foo Fighters', 'Black Sabbath', 'System of a Down', 'Ramones', 'The Doors', 'Green Day', 'Pearl Jam', 'Slipknot', 'Evanescence', 'Sepultura', 'Legião Urbana', 'Capital Inicial', 'Titãs', 'CPM 22', 'Charlie Brown Jr', 'Pitty', 'Raul Seixas', 'Mamonas Assassinas']
  },
  minecraft: {
    title: 'Minecraft',
    desc: 'Termos do jogo de construção e sobrevivência',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Minecraft. Nossa lista inclui personagens, mobs, blocos, biomas e itens do jogo.',
    image: 'https://s2-techtudo.glbimg.com/teSQDUYwN9ZuGoFASqQJRLXfLWU=/0x0:620x349/600x0/smart/filters:gifv():strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2021/F/L/6h8cWjR4W6IYgywE3SyA/2013-08-08-minecraft-pc-10-curiosidades.jpg',
    words: ['Steve', 'Alex', 'Creeper', 'Enderman', 'Zumbi', 'Esqueleto', 'Aranha', 'Aldeão (Villager)', 'Bruxa', 'Herobrine', 'Ender Dragon', 'Wither', 'Diamante', 'Ouro', 'Ferro', 'Carvão', 'Redstone', 'Picareta', 'Espada', 'Machado', 'Crafting Table (Bancada)', 'Fornalha', 'Baú', 'Cama', 'Portal do Nether', 'The End', 'Fortaleza', 'Bioma', 'Deserto', 'Floresta', 'Caverna', 'Mineração', 'Construção', 'Bloco de Terra', 'Areia de Almas', 'Bedrock', 'Obsidiana', 'Tnt']
  },
  gta: {
    title: 'Grand Theft Auto (GTA)',
    desc: 'Termos da franquia de jogos de mundo aberto',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do GTA. Nossa lista inclui personagens icônicos, cidades, gangues, veículos e missões.',
    image: 'https://www.scotsman.com/webimg/b25lY21zOmEzNzZkMDhlLTI5NDAtNDI1MS04MDI5LWVmOTI0N2QwN2UxZDo1YjY2NDY4OC1iNDFmLTQ5M2YtODMyNC04OTdjZDVkMmYzODE=.jpg?crop=3:2,smart&trim=&width=640&quality=65&enable=upscale',
    words: ['CJ (Carl Johnson)', 'Franklin Clinton', 'Michael De Santa', 'Trevor Philips', 'Niko Bellic', 'Tommy Vercetti', 'Los Santos', 'Liberty City', 'Vice City', 'San Andreas', 'Grove Street', 'Ballas', 'Vagos', 'Polícia (LSPD)', '5 Estrelas', 'Helicóptero', 'Tanque de Guerra', 'Jetpack', 'Missão', 'Roubo de Carros', 'Assalto a Banco', 'Dinheiro', 'Carro Esportivo', 'Moto', 'Armas', 'Wanted (Procurado)', 'Lester Crest', 'Big Smoke', 'Ryder', 'Lamar Davis', 'Cassino', 'Golpe', 'Modo Online', 'Garagem', 'Los Santos Customs', 'Paraquedas', 'Cheat']
  },
  fnaf: {
    title: 'Five Nights at Freddy\'s',
    desc: 'Termos do universo de terror dos animatrônicos',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Five Nights at Freddy\'s. Nossa lista inclui animatrônicos icônicos, personagens, locais e mecânicas do jogo de terror.',
    image: 'https://playgama.com/cdn-cgi/imagedelivery/LN2S-4p3-GgZvEx3IPaKUA/03fae46f-f8b6-4c22-de29-d9f91eb97000/enlarged',
    words: ['Animatrônicos', 'Freddy Fazbear', 'Bonnie', 'Chica', 'Foxy', 'Golden Freddy', 'Springtrap', 'Glitchtrap', 'Circus Baby', 'Ennard', 'Puppet', 'Marionete', 'Ballora', 'Funtime Freddy', 'Funtime Foxy', 'Molten Freddy', 'Scraptrap', 'Helpy', 'Vanny', 'Vanessa', 'William Afton', 'Michael Afton', 'Gregory', 'Glamrock Freddy', 'Roxanne Wolf', 'Montgomery Gator', 'Sun (Daycare Attendant)', 'Moon (Daycare Attendant)', 'Pizzaria', 'Fazbear Entertainment', 'Escritório', 'Câmeras', 'Monitores', 'Corredor', 'Ventilação', 'Portas', 'Gerador', 'Energia', 'Lanternas', 'Tablet', 'Noite', 'Turno', 'Vigilância', 'Sobrevivência', 'Jumpscare', 'Missões', 'Mapas', 'Minigames', 'Colecionáveis', 'Easter eggs', 'FNAF 1', 'FNAF 2', 'FNAF 3', 'FNAF 4', 'Sister Location', 'Security Breach', 'Ultimate Custom Night', 'Custom Night', 'Teorias', 'Lore']
  },
  fortnite: {
    title: 'Fortnite',
    desc: 'Termos do Battle Royale da Epic Games',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Fortnite.',
    image: 'https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/8BB6/production/_103466753_fort.jpg.webp',
    words: ['Battle Royale', 'Battle Pass', 'Skin', 'V-Bucks', 'Emote', 'Drop', 'Loot', 'Chest', 'Storm', 'Battle Bus', 'Mapa', 'Zona', 'Squad', 'Duo', 'Solo', 'Build', 'Edit', 'Shotgun', 'Sniper', 'AR', 'Victory Royale', 'XP', 'Nível', 'Item Shop', 'Season', 'Update', 'Patch', 'Collab', 'Evento']
  },
  freefire: {
    title: 'Free Fire',
    desc: 'Termos do Battle Royale da Garena',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Free Fire.',
    image: 'https://vagonmd.com/Store/Store/images/products/1762805978_PRODUCTO_FREEFIRE_NOVIEMBRE.webp',
    words: ['Battle Royale', 'Garena', 'Drop', 'Loot', 'Mapa', 'Safe Zone', 'Squad', 'Solo', 'Ranked', 'Skin', 'Personagem', 'Habilidade', 'Diamante', 'Arma', 'Granada', 'Sniper', 'Capa', 'Rush', 'Lobby', 'Sala', 'Guilda', 'Passe', 'Evento', 'Update', 'Headshot', 'Booyah', 'Colete', 'Capacete', 'Pet']
  },
  brawlstars: {
    title: 'Brawl Stars',
    desc: 'Termos do jogo de arena da Supercell',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do Brawl Stars.',
    image: 'https://supercell.com/images/b524ca49e8549e5d3f5485452da7f26c/790/cropped.webp',
    words: ['Brawler', 'Super', 'Gadget', 'Star Power', 'Gem Grab', 'Showdown', 'Brawl Ball', 'Heist', 'Siege', 'Knockout', 'Mapa', 'Skin', 'Troféu', 'Rank', 'Poder', 'Upgrade', 'Time', 'Solo', 'Dupla', 'Evento', 'Passe', 'Season', 'Caixa', 'Ataque']
  },
  pokemon: {
    title: 'Pokémon',
    desc: 'Termos do universo Pokémon',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do universo Pokémon.',
    image: 'https://criticalhits.com.br/wp-content/uploads/2025/02/pokemon-ultimate-journeys-696x348.webp',
    words: ['Pikachu', 'Pokébola', 'Treinador', 'Ginásio', 'Insígnia', 'Pokédex', 'Ash', 'Equipe Rocket', 'Charmander', 'Bulbasaur', 'Squirtle', 'Evolução', 'Tipo', 'Fogo', 'Água', 'Grama', 'Elétrico', 'Lendário', 'Mítico', 'Batalha', 'Ataque', 'Defesa', 'HP', 'XP', 'Região', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Galar', 'Starter', 'Capturar', 'Elite Four', 'Campeão', 'Mega Evolução', 'Shiny', 'Raid']
  },
  godofwar: {
    title: 'God of War',
    desc: 'Termos da saga épica de Kratos',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de God of War.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIN8uANZJI-cVMamEObkK48DOWgsCLCPs1HA&s',
    words: ['Kratos', 'Atreus', 'Leviathan', 'Blades of Chaos', 'Mitologia', 'Nórdica', 'Olimpo', 'Deus', 'Guerra', 'Vingança', 'Pai', 'Filho', 'Ragnarok', 'Thor', 'Odin', 'Freya', 'Batalha', 'Boss', 'Machado', 'Espadas', 'Valhalla', 'Monstro', 'Saga', 'Herói']
  },
  kpop: {
    title: 'K-POP (Grupos)',
    desc: 'Grupos do universo K-POP',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando nomes de grupos de K-POP.',
    image: 'https://meubias.com.br/wp-content/uploads/2021/11/grupos-de-kpop-mistos-1.webp',
    words: ['BTS', 'BLACKPINK', 'TWICE', 'EXO', 'STRAY KIDS', 'SEVENTEEN', 'TXT', 'IVE', 'AESPA', 'ITZY', 'RED VELVET', 'ENHYPEN', 'NCT', 'NCT 127', 'NCT DREAM', 'GOT7', 'MONSTA X', 'ATEEZ', 'LE SSERAFIM', 'NEWJEANS', '(G)I-DLE', 'BABYMONSTER', 'TREASURE', 'BIGBANG', 'SHINee', 'SUPER JUNIOR', 'MAMAMOO', 'KISS OF LIFE', 'STAYC', 'ILLIT']
  },
  bts: {
    title: 'BTS',
    desc: 'Termos do grupo BTS e do universo ARMY',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos do BTS.',
    image: 'https://meubias.com.br/wp-content/uploads/2021/07/fatos-sobre-bts-1.webp',
    words: ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook', 'ARMY', 'BigHit', 'HYBE', 'Bangtan', 'Mic Drop', 'Dynamite', 'Butter', 'Permission to Dance', 'Fake Love', 'Boy With Luv', 'Spring Day', 'Run BTS', 'Golden Maknae', 'Rap Line', 'Vocal Line', 'Maknae Line', 'Lightstick', 'Concert', 'World Tour', 'Comeback', 'Album', 'Solo', 'Fandom', 'Stage', 'Dance']
  },
  harrypotter: {
    title: 'Harry Potter',
    desc: 'Termos do mundo bruxo de Hogwarts',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Harry Potter.',
    image: 'https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/1758/live/442612a0-e387-11ee-9410-0f893255c2a0.jpg.webp',
    words: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Albus Dumbledore', 'Severus Snape', 'Lord Voldemort', 'Draco Malfoy', 'Minerva McGonagall', 'Sirius Black', 'Rubeus Hagrid', 'Bellatrix Lestrange', 'Neville Longbottom', 'Luna Lovegood', 'Ginny Weasley', 'Hogwarts', 'Grifinória', 'Sonserina', 'Corvinal', 'Lufa-Lufa', 'Beco Diagonal', 'Plataforma 9¾', 'Quadribol', 'Varinha das Varinhas', 'Pedra Filosofal', 'Câmara Secreta', 'Prisioneiro de Azkaban', 'Cálice de Fogo', 'Ordem da Fênix', 'Enigma do Príncipe', 'Relíquias da Morte', 'Horcrux', 'Patrono', 'Azkaban']
  },
  starwars: {
    title: 'Star Wars',
    desc: 'Termos da galáxia de Star Wars',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Star Wars.',
    image: 'https://cdn.ome.lt/dO5HP6bW-3M6t7Li48RnPAfr6v0=/570x0/smart/filters:format(webp)/uploads/conteudo/fotos/OMELETE_CAPA_97_jHX3I61.webp',
    words: ['Luke Skywalker', 'Leia Organa', 'Han Solo', 'Darth Vader', 'Anakin Skywalker', 'Obi-Wan Kenobi', 'Yoda', 'Palpatine', 'Kylo Ren', 'Rey', 'Chewbacca', 'R2-D2', 'C-3PO', 'Boba Fett', 'Mandalorian', 'Grogu', 'Millennium Falcon', 'Estrela da Morte', 'Tatooine', 'Endor', 'Hoth', 'Naboo', 'Coruscant', 'Jedi', 'Sith', 'Sabre de Luz', 'Ordem 66', 'Guerra dos Clones', 'Império Galáctico', 'Aliança Rebelde', 'Lado Sombrio', 'Força', 'Trilogia Original', 'Saga Skywalker', 'Stormtrooper']
  },
  walkingdead: {
    title: 'The Walking Dead',
    desc: 'Termos do apocalipse zumbi',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de The Walking Dead.',
    image: 'https://cdn.atarde.com.br/img/inline/1360000/724x0/Brasil-em-The-Walking-Dead-Possibilidade-disso-aco0136701100202511040642-1.webp?fallback=https%3A%2F%2Fcdn.atarde.com.br%2Fimg%2Finline%2F1360000%2FBrasil-em-The-Walking-Dead-Possibilidade-disso-aco0136701100202511040642.jpg%3Fxid%3D6871173&xid=6871173',
    words: ['Rick Grimes', 'Daryl Dixon', 'Michonne', 'Negan', 'Carl Grimes', 'Maggie Greene', 'Glenn Rhee', 'Carol Peletier', 'Morgan Jones', 'Judith Grimes', 'Governador', 'Lucille', 'Alexandria', 'Hilltop', 'Reino', 'Santuário', 'Whisperers', 'Alpha', 'Beta', 'Caminhantes', 'CDC', 'Prisão', 'Atlanta', 'Sobreviventes', 'Apocalipse', 'Horda', 'Facão', 'Besta', 'Crossbow', 'Série', 'Temporada']
  },
  lacasadepapel: {
    title: 'La Casa de Papel',
    desc: 'Termos da série de assaltos',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de La Casa de Papel.',
    image: 'https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/552C/production/_100940812_6bd18243-4097-4fae-bdf7-795d15415d70.jpg.webp',
    words: ['Professor', 'Tóquio', 'Berlim', 'Nairóbi', 'Rio', 'Denver', 'Moscou', 'Lisboa', 'Palermo', 'Helsinque', 'Oslo', 'Marselha', 'Bogotá', 'Raquel Murillo', 'Máscara de Dalí', 'Macacão Vermelho', 'Casa da Moeda', 'Banco da Espanha', 'Ouro', 'Cofre', 'Assalto', 'Plano', 'Túnel', 'Reféns', 'Polícia Nacional', 'Interpol', 'Helicóptero', 'Impressora', 'Dinheiro', 'Resistência', 'Bella Ciao']
  },
  theboys: {
    title: 'The Boys',
    desc: 'Termos da série de anti-heróis',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de The Boys.',
    image: 'https://cdn.dol.com.br/img/Artigo-Destaque/730000/640x335/the-boys_00730855_0_-3.webp?fallback=https%3A%2F%2Fcdn.dol.com.br%2Fimg%2FArtigo-Destaque%2F730000%2Fthe-boys_00730855_0_.jpg%3Fxid%3D1831579&xid=1831579',
    words: ['Homelander', 'Billy Butcher', 'Starlight', 'Queen Maeve', 'A-Train', 'The Deep', 'Black Noir', 'Soldier Boy', 'Vought', 'Compound V', 'The Seven', 'Ryan Butcher', 'Temp V', 'Lamplighter', 'Stormfront', 'Translucent', 'Supes', 'Torres Vought', 'Madelyn Stillwell', 'Ashley Barrett', 'Neuman', 'Red River', 'Godolkin', 'Payback']
  },
  got: {
    title: 'Game of Thrones',
    desc: 'Termos do universo de Westeros',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Game of Thrones.',
    image: 'https://www.folhadelondrina.com.br/img/inline/2940000/808x512/trono-got-divulg_02940568_0.webp?fallback=%2Fimg%2Finline%2F2940000%2Ftrono-got-divulg_02940568_0.jpg%3Fxid%3D4938159&xid=4938159',
    words: ['Jon Snow', 'Daenerys Targaryen', 'Tyrion Lannister', 'Cersei Lannister', 'Jaime Lannister', 'Arya Stark', 'Sansa Stark', 'Ned Stark', 'Bran Stark', 'Robb Stark', 'Casa Stark', 'Casa Lannister', 'Casa Targaryen', 'Dragões', 'Trono de Ferro', 'Winterfell', 'Porto Real', 'Muralha', 'Patrulha da Noite', 'White Walkers', 'Rei da Noite', 'Além da Muralha', 'Valar Morghulis', 'Valar Dohaeris', 'Espada Longclaw', 'Espada Agulha', 'Fogo Valiriano', 'Casamento Vermelho', 'Baía dos Escravos', 'Meereen', 'Dothraki', 'Imaculados', 'Sete Reinos', 'Westeros']
  },
  round6: {
    title: 'Round 6 (Squid Game)',
    desc: 'Termos da série coreana Squid Game',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Round 6.',
    image: 'https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/0c9f/live/f6319970-c3b4-11ef-aff0-072ce821b6ab.jpg.webp',
    words: ['Seong Gi-hun', 'Kang Sae-byeok', 'Oh Il-nam', 'Cho Sang-woo', 'Front Man', 'Jogador 001', 'Jogador 456', 'Boneca Gigante', 'Luz Vermelha Luz Verde', 'Batatinha Frita 1 2 3', 'Dalgona', 'Biscoito de Açúcar', 'Ponte de Vidro', 'Cabo de Guerra', 'Bolinhas de Gude', 'Máscara Quadrada', 'Máscara Triangular', 'Máscara Circular', 'Cartão Convite', 'Ilha', 'VIPs', 'Cofre', 'Prêmio em Dinheiro', 'Último Jogo']
  },
  onepiece: {
    title: 'One Piece',
    desc: 'Termos do universo pirata de One Piece',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de One Piece.',
    image: 'https://cdn.ome.lt/VbwZ4pa15EbORPFMCQI62yr_3Mg=/570x0/smart/filters:format(webp)/uploads/conteudo/fotos/nami-one-piece.webp',
    words: ['Luffy', 'Zoro', 'Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe', 'Shanks', 'Barba Branca', 'Barba Negra', 'Ace', 'Sabo', 'Gol D. Roger', 'Chapéu de Palha', 'Going Merry', 'Thousand Sunny', 'Grand Line', 'Novo Mundo', 'Akuma no Mi', 'Haki', 'Gear Second', 'Gear Fourth', 'Gear Fifth', 'Marinha', 'Almirante', 'Yonkou', 'Revolucionários', 'Laugh Tale', 'Wano', 'Dressrosa', 'Skypiea']
  },
  aot: {
    title: 'Attack on Titan',
    desc: 'Termos de Shingeki no Kyojin',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Attack on Titan.',
    image: 'https://gqcanimes.com.br/wp-content/uploads/2023/05/Attack-on-Titan-Final-Season-Part-3-GQCA-cp.webp',
    words: ['Eren Yeager', 'Mikasa', 'Armin', 'Levi', 'Erwin', 'Hange', 'Titã', 'Titã Colossal', 'Titã Blindado', 'Titã Bestial', 'Titã Fundador', 'Muralha Maria', 'Muralha Rose', 'Muralha Sina', 'Tropa de Exploração', 'Equipamento 3D', 'Paradis', 'Marley', 'Rumbling', 'Eldianos', 'Ymir', 'Paths', 'Shiganshina']
  },
  jjk: {
    title: 'Jujutsu Kaisen',
    desc: 'Termos do universo de feiticeiros e maldições',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Jujutsu Kaisen.',
    image: 'https://cdn.ome.lt/-dk_EWAhR2alorZY9-A9XpSoulk=/763x430/smart/filters:format(webp)/uploads/conteudo/fotos/omelete_capa_29.webp',
    words: ['Yuji Itadori', 'Satoru Gojo', 'Megumi Fushiguro', 'Nobara Kugisaki', 'Sukuna', 'Geto', 'Toji Fushiguro', 'Domínio', 'Expansão de Domínio', 'Energia Amaldiçoada', 'Maldição', 'Feiticeiro', 'Escola Jujutsu', 'Shibuya', 'Técnica Inata', 'Seis Olhos', 'Infinito', 'Black Flash', 'Mahito', 'Jogo do Abate', 'Rika', 'Yuta Okkotsu']
  },
  demonslayer: {
    title: 'Demon Slayer',
    desc: 'Termos de Kimetsu no Yaiba',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Demon Slayer.',
    image: 'https://www.einerd.com/wp-content/uploads/2025/08/Demon-Slayer-Kimetsu-no-Yaiba-%E2%80%93-The-Movie-Infinity-Castle-e1756120983192.webp',
    words: ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke', 'Kagaya', 'Muzan', 'Hashira', 'Respiração da Água', 'Respiração do Fogo', 'Respiração do Trovão', 'Respiração da Besta', 'Lâmina Nichirin', 'Onis', 'Lua Superior', 'Lua Inferior', 'Trem Infinito', 'Distrito do Entretenimento', 'Espadas', 'Caçador', 'Demônio', 'Sangue', 'Kibutsuji']
  },
  mha: {
    title: 'My Hero Academia',
    desc: 'Termos do universo de Boku no Hero',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de My Hero Academia.',
    image: 'https://i0.wp.com/estacaogeeknews.com.br/wp-content/uploads/2025/12/my-hero-academia-final.webp?resize=640%2C360&ssl=1',
    words: ['Izuku Midoriya', 'All Might', 'Bakugo', 'Todoroki', 'Uraraka', 'Endeavor', 'One For All', 'All For One', 'Quirk', 'U.A.', 'Herói', 'Vilão', 'Liga dos Vilões', 'Shigaraki', 'Dabi', 'Hawks', 'Eraser Head', 'Gran Torino', 'Estágio', 'Festival Esportivo', 'Nomu', 'Uniforme', 'Treinamento', 'Plus Ultra']
  },
  tokyoghoul: {
    title: 'Tokyo Ghoul',
    desc: 'Termos do universo sombrio de Tokyo Ghoul',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Tokyo Ghoul.',
    image: 'https://ovicio.com.br/wp-content/uploads/2024/09/20240918-ovicio-tokyo-ghoul-730x365.webp',
    words: ['Kaneki', 'Touka', 'Rize', 'Anteiku', 'CCG', 'Investigador', 'Ghoul', 'Máscara', 'Kagune', 'Kakuja', 'Aogiri', 'Jason', 'Hinami', 'Arima', 'Quinx', 'Olho Vermelho', 'Café', 'Identidade', 'Tragédia', 'Metamorfose', 'Caçador']
  },
  chainsawman: {
    title: 'Chainsaw Man',
    desc: 'Termos do universo de Chainsaw Man',
    longDesc: 'Teste seu conhecimento e blefe com seus amigos usando termos de Chainsaw Man.',
    image: 'https://i.postimg.cc/1tdV2pjZ/chainsaw-man-o-filme-arco-da-reze-tera-versao-estendida-de-musica-marcante-do-anime-anime-profile.webp',
    words: ['Denji', 'Pochita', 'Makima', 'Power', 'Aki', 'Chainsaw', 'Demônio', 'Caçador de Demônios', 'Contrato', 'Sangue', 'Katana Man', 'Gun Devil', 'Controle', 'Inferno', 'Anjo', 'Violência', 'Motoserra', 'Caos', 'Medo', 'Morte', 'Infernal']
  }
};
