export type RCCategory = 'brasil' | 'escola' | 'comida' | 'geral' | 'engracadas';

export interface RCQuestion {
  id: number;
  text: string;
  category: RCCategory;
}

export const RC_CATEGORIES: Record<RCCategory, { label: string; emoji: string }> = {
  brasil: { label: 'Brasil', emoji: '🇧🇷' },
  escola: { label: 'Vida Escolar', emoji: '🏫' },
  comida: { label: 'Comida', emoji: '🍔' },
  geral: { label: 'Geral / Vida', emoji: '🌎' },
  engracadas: { label: 'Engraçadas', emoji: '😂' },
};

export const RC_QUESTIONS: RCQuestion[] = [
  // Brasil
  { id: 1, text: 'Onde todo brasileiro já foi?', category: 'brasil' },
  { id: 2, text: 'Uma comida que todo brasileiro já comeu?', category: 'brasil' },
  { id: 3, text: 'Um programa de TV que todo mundo já assistiu?', category: 'brasil' },
  { id: 4, text: 'Um time de futebol famoso no Brasil?', category: 'brasil' },
  { id: 5, text: 'Um cantor brasileiro muito conhecido?', category: 'brasil' },
  { id: 6, text: 'Um feriado brasileiro importante?', category: 'brasil' },
  { id: 7, text: 'Um meme brasileiro famoso?', category: 'brasil' },
  { id: 8, text: 'Uma marca brasileira famosa?', category: 'brasil' },
  { id: 9, text: 'Um lugar turístico do Brasil?', category: 'brasil' },
  { id: 10, text: 'Uma novela famosa?', category: 'brasil' },

  // Vida Escolar
  { id: 11, text: 'Algo que tem em toda escola?', category: 'escola' },
  { id: 12, text: 'Uma matéria escolar difícil?', category: 'escola' },
  { id: 13, text: 'Uma desculpa para não fazer lição?', category: 'escola' },
  { id: 14, text: 'Algo que os alunos fazem escondido?', category: 'escola' },
  { id: 15, text: 'Um motivo para levar advertência?', category: 'escola' },
  { id: 16, text: 'Um material escolar essencial?', category: 'escola' },
  { id: 17, text: 'Algo que sempre acontece na sala de aula?', category: 'escola' },
  { id: 18, text: 'Uma profissão que começa com faculdade?', category: 'escola' },
  { id: 19, text: 'Algo que tem na mochila?', category: 'escola' },
  { id: 20, text: 'Uma palavra que todo professor fala?', category: 'escola' },

  // Comida
  { id: 21, text: 'Algo que você coloca no pão?', category: 'comida' },
  { id: 22, text: 'Uma comida que engorda?', category: 'comida' },
  { id: 23, text: 'Algo que vai na pizza?', category: 'comida' },
  { id: 24, text: 'Um sabor de sorvete popular?', category: 'comida' },
  { id: 25, text: 'Uma comida que tem em festa?', category: 'comida' },
  { id: 26, text: 'Algo que você come no café da manhã?', category: 'comida' },
  { id: 27, text: 'Um refrigerante famoso?', category: 'comida' },
  { id: 28, text: 'Uma comida de domingo?', category: 'comida' },
  { id: 29, text: 'Algo que tem no churrasco?', category: 'comida' },
  { id: 30, text: 'Um doce popular?', category: 'comida' },

  // Geral / Vida
  { id: 31, text: 'Algo que todo mundo usa todos os dias?', category: 'geral' },
  { id: 32, text: 'Um aplicativo famoso?', category: 'geral' },
  { id: 33, text: 'Algo que você leva para a praia?', category: 'geral' },
  { id: 34, text: 'Um motivo para acordar cedo?', category: 'geral' },
  { id: 35, text: 'Algo que você faz antes de dormir?', category: 'geral' },
  { id: 36, text: 'Um medo comum?', category: 'geral' },
  { id: 37, text: 'Algo que sempre acaba rápido?', category: 'geral' },
  { id: 38, text: 'Uma desculpa para chegar atrasado?', category: 'geral' },
  { id: 39, text: 'Algo que quebra fácil?', category: 'geral' },
  { id: 40, text: 'Uma coisa que todo mundo já perdeu?', category: 'geral' },

  // Engraçadas / Criativas
  { id: 41, text: 'Algo que você faz quando está entediado?', category: 'engracadas' },
  { id: 42, text: 'Um motivo para brigar?', category: 'engracadas' },
  { id: 43, text: 'Algo que você fala quando está bravo?', category: 'engracadas' },
  { id: 44, text: 'Uma coisa que todo mundo já mentiu?', category: 'engracadas' },
  { id: 45, text: 'Algo que faz barulho?', category: 'engracadas' },
  { id: 46, text: 'Um superpoder que todo mundo queria ter?', category: 'engracadas' },
  { id: 47, text: 'Algo que você nunca emprestaria?', category: 'engracadas' },
  { id: 48, text: 'Uma coisa que sempre some na sua casa?', category: 'engracadas' },
  { id: 49, text: 'Algo que vicia?', category: 'engracadas' },
  { id: 50, text: 'Uma coisa que todo mundo já pesquisou no Google?', category: 'engracadas' },
];

/** Pick N random questions, optionally filtered by category */
export function pickQuestions(count: number, category?: RCCategory): RCQuestion[] {
  const pool = category ? RC_QUESTIONS.filter(q => q.category === category) : [...RC_QUESTIONS];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
