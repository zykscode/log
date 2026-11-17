/** Readability & style analysis — runs instantly in the browser, no network. */

export type Readability = {
  words: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  fleschEase: number;
  grade: number;
  label: string;
  avgSentence: number;
  longSentences: string[];
  passive: string[];
  adverbs: string[];
  repeated: string[];
  hedges: string[];
};

const ADVERB_EXCEPTIONS = new Set([
  'only',
  'family',
  'reply',
  'early',
  'likely',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'holy',
  'ugly',
  'belly',
  'jelly',
  'rally',
  'ally',
  'supply',
  'apply',
  'july',
  'italy',
  'lily',
  'bully',
  'fly',
  'imply',
  'comply',
  'rely',
  'friendly',
  'lovely',
  'lonely',
  'silly',
  'chilly',
  'curly',
  'elderly',
  'costly',
  'lively',
  'orderly',
  'jolly',
]);
const HEDGES = [
  'very',
  'really',
  'just',
  'quite',
  'basically',
  'actually',
  'literally',
  'somewhat',
  'perhaps',
  'kind of',
  'sort of',
  'a bit',
];

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function label(score: number): string {
  if (score >= 80) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 60) return 'Plain English';
  if (score >= 50) return 'Fairly difficult';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

export function analyze(text: string): Readability {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim()).length;
  const sentenceList = text
    .replace(/\n+/g, ' \n ')
    .split(/(?<=[.!?…])\s+|\n/)
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s));
  const words = text.match(/[A-Za-z0-9’'-]+/g) ?? [];
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentenceList.length);
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  const wps = wordCount / sentenceCount;
  const spw = wordCount ? syl / wordCount : 0;
  const fleschEase = wordCount
    ? Math.round(206.835 - 1.015 * wps - 84.6 * spw)
    : 0;
  const grade = wordCount
    ? Math.max(0, Math.round((0.39 * wps + 11.8 * spw - 15.59) * 10) / 10)
    : 0;

  const wordsIn = (s: string) => (s.match(/[A-Za-z0-9’'-]+/g) ?? []).length;
  const longSentences = sentenceList.filter((s) => wordsIn(s) > 25);
  const passive = [
    ...text.matchAll(
      /\b(?:am|is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?(\w+(?:ed|en))\b/gi,
    ),
  ].map((m) => m[0]);
  const adverbs = [
    ...new Set(
      words.filter(
        (w) =>
          /ly$/i.test(w) &&
          w.length > 4 &&
          !ADVERB_EXCEPTIONS.has(w.toLowerCase()),
      ),
    ),
  ];
  const repeated = [...text.matchAll(/\b(\w+)\s+\1\b/gi)].map((m) => m[0]);
  const lower = ` ${text.toLowerCase()} `;
  const hedges = HEDGES.filter((h) => lower.includes(` ${h} `));

  return {
    words: wordCount,
    sentences: sentenceList.length,
    paragraphs,
    readingMinutes: Math.max(1, Math.ceil(wordCount / 225)),
    fleschEase: Math.max(0, Math.min(100, fleschEase)),
    grade,
    label: label(fleschEase),
    avgSentence: Math.round(wps * 10) / 10,
    longSentences,
    passive,
    adverbs,
    repeated,
    hedges,
  };
}
