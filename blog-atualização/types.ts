
export interface Author {
  name: string;
  avatar: string;
  role: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: Author;
  date: string;
  category: 'News' | 'Tips' | 'Update' | 'Community';
  image: string;
  readTime: string;
  featured?: boolean;
}

export interface GameMode {
  id: string;
  title: string;
  desc: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  iconName: string;
}

export enum GameRole {
  IMPOSTOR = 'IMPOSTOR',
  CREWMATE = 'CREWMATE',
  CAPTAIN = 'CAPTAIN'
}
