export type ThemeModerationInput = {
  titulo: string;
  autor: string;
  palavras: string[];
};

export type ThemeModerationResult = {
  autoApproved: boolean;
  reasons: string[];
};

const BLOCKED_TOKENS = new Set([
  "buceta", "caralho", "cuzao", "foder", "foda-se", "merda", "pinto",
  "porno", "pornografia", "putaria", "puta", "puto", "sexo", "transar",
  "viado", "bicha", "traveco", "nazista", "nazi",
  "estuprar", "estupro", "pedofilia", "pedofilo", "suicidio",
]);

const REVIEW_PHRASES = [
  "conteudo adulto",
  "discurso de odio",
  "violencia grafica",
  "sexo explicito",
  "nudez explicita",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/3/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function preModerateTheme(input: ThemeModerationInput): ThemeModerationResult {
  const values = [input.titulo, input.autor, ...input.palavras];
  const normalizedValues = values.map(normalize).filter(Boolean);
  const reasons = new Set<string>();

  for (const originalValue of values) {
    const value = normalize(originalValue);
    const tokens = value.split(/\s+/).filter(Boolean);

    if (tokens.some(token => BLOCKED_TOKENS.has(token))) {
      reasons.add("termo potencialmente ofensivo ou adulto");
    }
    if (REVIEW_PHRASES.some(phrase => value.includes(phrase))) {
      reasons.add("conteúdo sensível");
    }
    if (/(https?:\/\/|www\.|\.com\b|\.com\.br\b|@\w+\.|\b\d{8,}\b)/i.test(originalValue)) {
      reasons.add("link ou dado de contato");
    }
    if (tokens.some(token => token.length >= 9 && !/[aeiouy]/.test(token))) {
      reasons.add("texto possivelmente aleatório");
    }
    if (/(.)\1{5,}/i.test(originalValue)) {
      reasons.add("repetição excessiva de caracteres");
    }
  }

  const normalizedWords = input.palavras.map(normalize).filter(Boolean);
  if (new Set(normalizedWords).size !== normalizedWords.length) {
    reasons.add("palavras repetidas");
  }
  if (normalizedValues.some(value => value.length < 2)) {
    reasons.add("texto curto demais para validação automática");
  }

  const reviewReasons = Array.from(reasons);
  return {
    autoApproved: reviewReasons.length === 0,
    reasons: reviewReasons,
  };
}
