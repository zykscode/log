import { codeToHtml } from 'shiki';

import { CopyButton } from './CopyButton';

/** Monaco language ids (stored by the editor) → Shiki grammar names. */
const LANG: Record<string, string> = {
  plaintext: 'text',
  shell: 'bash',
  typescript: 'tsx',
  javascript: 'jsx',
  csharp: 'csharp',
  cpp: 'cpp',
  dockerfile: 'docker',
};

const LABEL: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  shell: 'Shell',
  plaintext: 'Text',
  csharp: 'C#',
  cpp: 'C++',
};

/** Syntax-highlighted on the server (zero JS shipped), light + dark themes. */
export async function Code({
  code,
  language,
}: {
  code: string;
  language?: string | null;
}) {
  const lang = language || 'plaintext';
  let html: string;
  try {
    html = await codeToHtml(code, {
      lang: LANG[lang] ?? lang,
      themes: { light: 'github-light', dark: 'vesper' },
      defaultColor: false,
    });
  } catch {
    html = await codeToHtml(code, {
      lang: 'text',
      themes: { light: 'github-light', dark: 'vesper' },
      defaultColor: false,
    });
  }
  return (
    <figure className="not-prose group relative my-8 overflow-hidden rounded-xl border border-line bg-[light-dark(#f6f4f1,#0f0e0c)] text-[0.88rem]">
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-muted">
        <span className="eyebrow text-[0.62rem]">{LABEL[lang] ?? lang}</span>
        <CopyButton
          text={code}
          className="rounded px-2 py-0.5 text-xs text-muted transition-colors hover:bg-fg/10 hover:text-fg"
        />
      </figcaption>
      <div
        className="overflow-x-auto px-4 py-4 font-mono leading-relaxed [&_pre]:!bg-transparent"
        // Shiki output is generated from the author's own code on the server.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
