import type { Endpoint } from 'payload';

/**
 * POST /api/writing-check  { text, language?, picky? }
 * Spelling, grammar and style check via LanguageTool (free public API by
 * default; set LANGUAGETOOL_URL to use a self-hosted server, and
 * LANGUAGETOOL_USERNAME + LANGUAGETOOL_API_KEY for LanguageTool Premium).
 * Logged-in authors only. Words in the author's personal dictionary are ignored.
 */

const LT_URL = (
  process.env.LANGUAGETOOL_URL || 'https://api.languagetool.org'
).replace(/\/$/, '');
const CHUNK = 18_000; // public API limit is 20 KB per request
const MAX_TEXT = 60_000; // ~75 KB/minute on the free tier

export type WritingMatch = {
  offset: number;
  length: number;
  message: string;
  shortMessage?: string;
  replacements: string[];
  ruleId: string;
  issueType: string;
  category: string;
  sentence?: string;
};

type LTMatch = {
  offset: number;
  length: number;
  message: string;
  shortMessage?: string;
  sentence?: string;
  replacements?: { value: string }[];
  rule?: {
    id: string;
    issueType?: string;
    category?: { id?: string; name?: string };
  };
};

/** Split at paragraph (or sentence) boundaries so no chunk exceeds CHUNK chars. */
function chunkText(text: string): { start: number; text: string }[] {
  const chunks: { start: number; text: string }[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK, text.length);
    if (end < text.length) {
      const para = text.lastIndexOf('\n\n', end);
      const sentence = text.lastIndexOf('. ', end);
      if (para > start + CHUNK / 2) end = para + 2;
      else if (sentence > start + CHUNK / 2) end = sentence + 2;
    }
    chunks.push({ start, text: text.slice(start, end) });
    start = end;
  }
  return chunks;
}

export const writingCheckEndpoint: Endpoint = {
  path: '/writing-check',
  method: 'post',
  handler: async (req) => {
    if (!req.user)
      return Response.json({ error: 'Please log in.' }, { status: 401 });

    let body: { text?: unknown; language?: unknown; picky?: unknown } = {};
    try {
      body = (await req.json?.()) ?? {};
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }
    const full = typeof body.text === 'string' ? body.text : '';
    const text = full.slice(0, MAX_TEXT);
    const language =
      typeof body.language === 'string' &&
      /^[a-zA-Z-]{2,10}$/.test(body.language)
        ? body.language
        : 'en-GB';
    const picky = body.picky === true;
    if (!text.trim()) return Response.json({ matches: [], truncated: false });

    const dictionary = new Set(
      (
        ((req.user as { dictionary?: (string | null)[] | null }).dictionary ??
          []) as (string | null)[]
      )
        .filter((w): w is string => typeof w === 'string')
        .map((w) => w.toLowerCase()),
    );

    const matches: WritingMatch[] = [];
    for (const chunk of chunkText(text)) {
      const params = new URLSearchParams({
        text: chunk.text,
        language,
        level: picky ? 'picky' : 'default',
      });
      if (language === 'auto') params.set('preferredVariants', 'en-GB');
      if (
        process.env.LANGUAGETOOL_USERNAME &&
        process.env.LANGUAGETOOL_API_KEY
      ) {
        params.set('username', process.env.LANGUAGETOOL_USERNAME);
        params.set('apiKey', process.env.LANGUAGETOOL_API_KEY);
      }
      let res: Response;
      try {
        res = await fetch(`${LT_URL}/v2/check`, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
          },
          body: params,
          signal: AbortSignal.timeout(25_000),
        });
      } catch {
        return Response.json(
          {
            error:
              'The checking service could not be reached. Try again in a moment.',
          },
          { status: 502 },
        );
      }
      if (res.status === 429) {
        return Response.json(
          {
            error:
              'Too many checks in a short time — wait a minute and try again.',
          },
          { status: 429 },
        );
      }
      if (!res.ok) {
        return Response.json(
          { error: `The checking service returned an error (${res.status}).` },
          { status: 502 },
        );
      }
      const json = (await res.json()) as { matches?: LTMatch[] };
      for (const m of json.matches ?? []) {
        const word = chunk.text.slice(m.offset, m.offset + m.length);
        if (
          m.rule?.issueType === 'misspelling' &&
          dictionary.has(word.toLowerCase())
        )
          continue;
        matches.push({
          offset: chunk.start + m.offset,
          length: m.length,
          message: m.message,
          shortMessage: m.shortMessage || undefined,
          replacements: (m.replacements ?? []).slice(0, 6).map((r) => r.value),
          ruleId: m.rule?.id ?? 'UNKNOWN',
          issueType: m.rule?.issueType ?? 'other',
          category: m.rule?.category?.name ?? 'Other',
          sentence: m.sentence,
        });
      }
    }
    return Response.json({
      matches,
      truncated: full.length > MAX_TEXT,
      language,
    });
  },
};
