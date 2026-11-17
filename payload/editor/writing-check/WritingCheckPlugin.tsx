'use client';

import {
  $getNodeByKey,
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  $isTextNode,
  type LexicalNode,
} from '@payloadcms/richtext-lexical/lexical';
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext';
import { useAuth, useConfig, useForm, useFormFields } from '@payloadcms/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { WritingMatch } from '../../endpoints/writingCheck';
import { analyze } from './analyze';

/* ------------------------------------------------------------------ */

type Source = 'title' | 'subtitle' | 'excerpt' | 'summary' | 'content';
type Seg = { key: string; start: number; end: number };
type Snapshot = { text: string; segs: Seg[] };
type Issue = WritingMatch & {
  id: string;
  source: Source;
  local: number;
  text: string;
  context: string;
};

const FIELD_SOURCES: Source[] = ['title', 'subtitle', 'excerpt', 'summary'];
const SOURCE_LABEL: Record<Source, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  excerpt: 'Excerpt',
  summary: 'Summary',
  content: 'Text',
};
const LANGUAGES = [
  ['en-GB', 'English (UK)'],
  ['en-US', 'English (US)'],
  ['en-CA', 'English (Canada)'],
  ['en-AU', 'English (Australia)'],
  ['en-NZ', 'English (NZ)'],
  ['en-ZA', 'English (South Africa)'],
  ['auto', 'Detect automatically'],
] as const;

const TONE: Record<string, string> = {
  misspelling: 'var(--theme-error-500, #d32d08)',
  grammar: 'var(--theme-warning-500, #d97706)',
  typographical: 'var(--theme-elevation-600)',
  duplication: 'var(--theme-warning-500, #d97706)',
  style: '#2563eb',
};
const toneOf = (issueType: string) =>
  TONE[issueType] ?? 'var(--theme-elevation-600)';

/** Plain text of the editor + where each text node sits in it (to apply fixes). */
function readEditor(): Snapshot {
  let text = '';
  const segs: Seg[] = [];
  const walk = (node: LexicalNode, inline: boolean) => {
    if ($isTextNode(node)) {
      const t = node.getTextContent();
      segs.push({
        key: node.getKey(),
        start: text.length,
        end: text.length + t.length,
      });
      text += t;
      return;
    }
    if (node.getType() === 'linebreak') {
      text += '\n';
      return;
    }
    if ($isDecoratorNode(node)) {
      if (inline) text += ' '; // inline blocks (footnotes…) act as a space
      return;
    }
    if ($isElementNode(node)) {
      const separator = ['list', 'table', 'tablerow'].includes(node.getType())
        ? '\n'
        : '';
      node.getChildren().forEach((child, i) => {
        if (i > 0 && separator) text += separator;
        walk(child, !separator && !child.getType().startsWith('list'));
      });
    }
  };
  $getRoot()
    .getChildren()
    .forEach((block, i) => {
      if (i > 0) text += '\n\n';
      walk(block, false);
    });
  return { text, segs };
}

const s = {
  panel: {
    marginTop: 10,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 8,
    background: 'var(--theme-elevation-0)',
    fontSize: 13,
  } as React.CSSProperties,
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
  } as React.CSSProperties,
  btn: {
    border: '1px solid var(--theme-elevation-200)',
    background: 'var(--theme-elevation-50)',
    color: 'var(--theme-text)',
    borderRadius: 999,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: 13,
  } as React.CSSProperties,
  primary: {
    background: '#d32d08',
    borderColor: '#d32d08',
    color: '#fff',
  } as React.CSSProperties,
  chip: {
    border: '1px solid var(--theme-elevation-200)',
    background: 'transparent',
    color: 'var(--theme-text)',
    borderRadius: 6,
    padding: '2px 8px',
    cursor: 'pointer',
    fontSize: 12.5,
  } as React.CSSProperties,
  muted: { color: 'var(--theme-elevation-600)' } as React.CSSProperties,
};

/** Saved panel preferences (this editor only renders in the browser). */
function readPref(key: string): string | null {
  try {
    return typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */

export function WritingCheckPlugin() {
  const [editor] = useLexicalComposerContext();
  const { config } = useConfig();
  const { user } = useAuth();
  const { dispatchFields, setModified } = useForm();

  const title = useFormFields(([f]) => f.title?.value as string | undefined);
  const subtitle = useFormFields(
    ([f]) => f.subtitle?.value as string | undefined,
  );
  const excerpt = useFormFields(
    ([f]) => f.excerpt?.value as string | undefined,
  );
  const summary = useFormFields(
    ([f]) => f.summary?.value as string | undefined,
  );
  const fields = useMemo(
    () =>
      ({ title, subtitle, excerpt, summary }) as Partial<
        Record<Source, string | undefined>
      >,
    [title, subtitle, excerpt, summary],
  );

  const [lang, setLang] = useState(
    () => readPref('zyk-writing-lang') || 'en-GB',
  );
  const [picky, setPicky] = useState(
    () => readPref('zyk-writing-picky') === '1',
  );
  const [open, setOpen] = useState<'none' | 'issues' | 'readability'>('none');
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [checkedText, setCheckedText] = useState('');
  const [contentText, setContentText] = useState(() =>
    editor.getEditorState().read(() => readEditor().text),
  );
  // personal dictionary = saved on the account + words added this session
  const [added, setAdded] = useState<string[]>([]);
  const dictionary = useMemo(
    () =>
      Array.from(
        new Set([
          ...(
            (user as { dictionary?: string[] } | null)?.dictionary ?? []
          ).filter(Boolean),
          ...added,
        ]),
      ),
    [user, added],
  );

  // Browser spellcheck (red underlines while typing) in the chosen language.
  useEffect(() => {
    const apply = (root: HTMLElement | null) => {
      if (!root) return;
      root.setAttribute('spellcheck', 'true');
      root.setAttribute('lang', lang === 'auto' ? 'en' : lang);
    };
    apply(editor.getRootElement());
    return editor.registerRootListener((root) => apply(root));
  }, [editor, lang]);

  // Keep a live copy of the text for readability + "changed since check".
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) =>
      setContentText(editorState.read(() => readEditor().text)),
    );
  }, [editor]);

  const buildCombined = useCallback(() => {
    const parts: { source: Source; start: number; end: number }[] = [];
    let text = '';
    const add = (source: Source, value?: string) => {
      if (!value || !value.trim()) return;
      if (text) text += '\n\n';
      parts.push({
        source,
        start: text.length,
        end: text.length + value.length,
      });
      text += value;
    };
    FIELD_SOURCES.forEach((src) => add(src, fields[src]));
    add(
      'content',
      editor.getEditorState().read(() => readEditor().text),
    );
    return { text, parts };
  }, [editor, fields]);

  const runCheck = useCallback(async () => {
    const { text, parts } = buildCombined();
    if (!text.trim()) {
      setIssues([]);
      setMessage('Nothing to check yet.');
      setOpen('issues');
      return;
    }
    setStatus('checking');
    setMessage('');
    setOpen('issues');
    try {
      const res = await fetch(`${config.routes.api}/writing-check`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, language: lang, picky }),
      });
      const json = (await res.json()) as {
        matches?: WritingMatch[];
        error?: string;
        truncated?: boolean;
      };
      if (!res.ok || json.error)
        throw new Error(json.error || `Check failed (${res.status})`);
      const list: Issue[] = (json.matches ?? []).flatMap((m, i) => {
        const part = parts.find((p) => m.offset >= p.start && m.offset < p.end);
        if (!part) return [];
        const partText = text.slice(part.start, part.end);
        const local = m.offset - part.start;
        return [
          {
            ...m,
            id: `${i}-${m.offset}`,
            source: part.source,
            local,
            text: partText.slice(local, local + m.length),
            context: partText,
          },
        ];
      });
      setIssues(list);
      setCheckedText(text);
      setStatus('idle');
      setMessage(
        json.truncated
          ? 'Long text: only the first ~9,000 words were checked.'
          : '',
      );
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message);
    }
  }, [buildCombined, config.routes.api, lang, picky]);

  const removeAndShift = (issue: Issue, delta: number) =>
    setIssues((prev) =>
      (prev ?? [])
        .filter((i) => i.id !== issue.id)
        .map((i) =>
          i.source === issue.source && i.local > issue.local
            ? { ...i, local: i.local + delta }
            : i,
        ),
    );

  /** Find where the flagged text is now (the author may have kept typing). */
  const locate = (current: string, issue: Issue): number => {
    if (current.slice(issue.local, issue.local + issue.length) === issue.text)
      return issue.local;
    const from = Math.max(0, issue.local - 300);
    const idx = current.indexOf(issue.text, from);
    return idx >= 0 && idx < issue.local + 300 ? idx : -1;
  };

  const applyFix = (issue: Issue, replacement: string) => {
    const delta = replacement.length - issue.length;
    if (issue.source !== 'content') {
      const current = fields[issue.source] ?? '';
      const at = locate(current, issue);
      if (at < 0)
        return setMessage('That text has changed — run the check again.');
      dispatchFields({
        type: 'UPDATE',
        path: issue.source,
        value:
          current.slice(0, at) + replacement + current.slice(at + issue.length),
      });
      setModified(true);
      return removeAndShift(issue, delta);
    }
    let ok = false;
    editor.update(() => {
      const snap = readEditor();
      const at = locate(snap.text, issue);
      if (at < 0) return;
      const seg = snap.segs.find(
        (sg) => at >= sg.start && at + issue.length <= sg.end,
      );
      if (!seg) return;
      const node = $getNodeByKey(seg.key);
      if ($isTextNode(node)) {
        node.spliceText(at - seg.start, issue.length, replacement, false);
        ok = true;
      }
    });
    if (!ok)
      return setMessage(
        'Couldn’t apply that one automatically (it spans formatting) — please edit it by hand.',
      );
    removeAndShift(issue, delta);
  };

  const showInEditor = (issue: Issue) => {
    if (issue.source !== 'content') return;
    editor.update(() => {
      const snap = readEditor();
      const at = locate(snap.text, issue);
      const seg = snap.segs.find(
        (sg) => at >= sg.start && at + issue.length <= sg.end,
      );
      const node = seg ? $getNodeByKey(seg.key) : null;
      if ($isTextNode(node) && seg)
        node.select(at - seg.start, at - seg.start + issue.length);
    });
    editor.focus();
    editor
      .getRootElement()
      ?.ownerDocument.getSelection()
      ?.focusNode?.parentElement?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
  };

  const addToDictionary = async (issue: Issue) => {
    if (!user) return;
    const word = issue.text.trim();
    const next = Array.from(new Set([...dictionary, word]));
    try {
      const res = await fetch(`${config.routes.api}/users/${user.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dictionary: next }),
      });
      if (!res.ok) throw new Error();
      setAdded((prev) => [...prev, word]);
      setIssues((prev) =>
        (prev ?? []).filter(
          (i) =>
            !(
              i.issueType === 'misspelling' &&
              i.text.toLowerCase() === word.toLowerCase()
            ),
        ),
      );
      setMessage(`“${word}” added to your dictionary.`);
    } catch {
      setMessage('Couldn’t save to your dictionary.');
    }
  };

  const readability = useMemo(
    () => (open === 'readability' ? analyze(contentText) : null),
    [open, contentText],
  );
  const stale =
    issues !== null &&
    checkedText !== '' &&
    buildCombined().text !== checkedText;
  const counts = useMemo(() => {
    const c = { spelling: 0, grammar: 0, style: 0 };
    for (const i of issues ?? []) {
      if (i.issueType === 'misspelling') c.spelling++;
      else if (i.issueType === 'style' || i.issueType === 'typographical')
        c.style++;
      else c.grammar++;
    }
    return c;
  }, [issues]);

  return (
    <div style={s.panel} data-writing-check>
      <div style={s.bar}>
        <strong style={{ marginRight: 4 }}>✍️ Writing check</strong>
        <button
          type="button"
          style={{ ...s.btn, ...s.primary }}
          onClick={runCheck}
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'Checking…' : 'Check spelling & grammar'}
        </button>
        <button
          type="button"
          style={s.btn}
          onClick={() =>
            setOpen(open === 'readability' ? 'none' : 'readability')
          }
          aria-expanded={open === 'readability'}
        >
          Readability
        </button>
        {issues && open !== 'issues' && issues.length > 0 && (
          <button type="button" style={s.btn} onClick={() => setOpen('issues')}>
            {issues.length} suggestion{issues.length === 1 ? '' : 's'}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <label
          style={{ display: 'flex', alignItems: 'center', gap: 6, ...s.muted }}
        >
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              try {
                localStorage.setItem('zyk-writing-lang', e.target.value);
              } catch {
                /* ignore */
              }
            }}
            style={{ ...s.chip, padding: '3px 6px' }}
            aria-label="Language"
          >
            {LANGUAGES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: 5, ...s.muted }}
          title="Also flag style issues (wordiness, clichés, passive voice…)"
        >
          <input
            type="checkbox"
            checked={picky}
            onChange={(e) => {
              setPicky(e.target.checked);
              try {
                localStorage.setItem(
                  'zyk-writing-picky',
                  e.target.checked ? '1' : '0',
                );
              } catch {
                /* ignore */
              }
            }}
          />
          Picky
        </label>
      </div>

      {message && (
        <div
          style={{
            padding: '0 12px 8px',
            color:
              status === 'error'
                ? 'var(--theme-error-500)'
                : 'var(--theme-elevation-700)',
          }}
        >
          {message}
        </div>
      )}

      {open === 'issues' && issues && (
        <div
          style={{
            borderTop: '1px solid var(--theme-elevation-100)',
            padding: '8px 12px 12px',
          }}
        >
          <div
            style={{ display: 'flex', gap: 14, marginBottom: 8, ...s.muted }}
          >
            {issues.length === 0 ? (
              <span style={{ color: 'var(--theme-success-500, #16a34a)' }}>
                ✓ No issues found — nice writing.
              </span>
            ) : (
              <>
                <span>
                  <b style={{ color: TONE.misspelling }}>{counts.spelling}</b>{' '}
                  spelling
                </span>
                <span>
                  <b style={{ color: TONE.grammar }}>{counts.grammar}</b>{' '}
                  grammar
                </span>
                <span>
                  <b style={{ color: TONE.style }}>{counts.style}</b> style
                </span>
              </>
            )}
            {stale && <span>· text changed since the check</span>}
            <span style={{ flex: 1 }} />
            <button
              type="button"
              style={s.chip}
              onClick={() => setOpen('none')}
            >
              Hide
            </button>
          </div>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gap: 8,
              maxHeight: 420,
              overflowY: 'auto',
            }}
          >
            {issues.map((issue) => {
              const before = issue.context.slice(
                Math.max(0, issue.local - 50),
                issue.local,
              );
              const after = issue.context.slice(
                issue.local + issue.length,
                issue.local + issue.length + 50,
              );
              return (
                <li
                  key={issue.id}
                  style={{
                    borderLeft: `3px solid ${toneOf(issue.issueType)}`,
                    padding: '6px 10px',
                    background: 'var(--theme-elevation-50)',
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'baseline',
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: toneOf(issue.issueType),
                      }}
                    >
                      {issue.issueType === 'misspelling'
                        ? 'Spelling'
                        : issue.category}
                    </span>
                    {issue.source !== 'content' && (
                      <span style={{ fontSize: 11, ...s.muted }}>
                        in {SOURCE_LABEL[issue.source]}
                      </span>
                    )}
                  </div>
                  <div style={{ marginBottom: 4 }}>{issue.message}</div>
                  <div style={{ fontSize: 12.5, marginBottom: 6, ...s.muted }}>
                    {before.length === 50 ? '…' : ''}
                    {before}
                    <mark
                      style={{
                        background: 'transparent',
                        color: toneOf(issue.issueType),
                        textDecoration: 'underline wavy',
                        fontWeight: 600,
                      }}
                    >
                      {issue.text || '␣'}
                    </mark>
                    {after}
                    {after.length === 50 ? '…' : ''}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {issue.replacements.map((r) => (
                      <button
                        key={r}
                        type="button"
                        style={{ ...s.chip, fontWeight: 600 }}
                        onClick={() => applyFix(issue, r)}
                        title="Apply"
                      >
                        {r === '' ? '(remove)' : r}
                      </button>
                    ))}
                    {issue.source === 'content' && (
                      <button
                        type="button"
                        style={s.chip}
                        onClick={() => showInEditor(issue)}
                      >
                        Show
                      </button>
                    )}
                    {issue.issueType === 'misspelling' && (
                      <button
                        type="button"
                        style={s.chip}
                        onClick={() => addToDictionary(issue)}
                      >
                        Add to dictionary
                      </button>
                    )}
                    <button
                      type="button"
                      style={s.chip}
                      onClick={() => removeAndShift(issue, 0)}
                    >
                      Ignore
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p style={{ margin: '10px 0 0', fontSize: 11.5, ...s.muted }}>
            Checked by LanguageTool. Your browser also underlines misspellings
            as you type.
          </p>
        </div>
      )}

      {open === 'readability' && readability && (
        <div
          style={{
            borderTop: '1px solid var(--theme-elevation-100)',
            padding: '10px 12px 12px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 8,
              marginBottom: 10,
            }}
          >
            {[
              [
                'Readability',
                `${readability.fleschEase} · ${readability.label}`,
              ],
              ['Grade level', String(readability.grade)],
              ['Words', readability.words.toLocaleString()],
              ['Reading time', `${readability.readingMinutes} min`],
              ['Sentences', String(readability.sentences)],
              ['Avg. sentence', `${readability.avgSentence} words`],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  border: '1px solid var(--theme-elevation-100)',
                  borderRadius: 6,
                  padding: '6px 8px',
                }}
              >
                <div style={{ fontSize: 11, ...s.muted }}>{k}</div>
                <div style={{ fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          {[
            [
              'Long sentences (25+ words)',
              readability.longSentences,
              'Consider splitting these.',
            ],
            [
              'Passive voice',
              readability.passive,
              'Active voice is usually clearer.',
            ],
            [
              'Adverbs',
              readability.adverbs,
              'Often a stronger verb works better.',
            ],
            ['Filler words', readability.hedges, 'Cut them where you can.'],
            ['Repeated words', readability.repeated, 'Probably a typo.'],
          ].map(([labelText, list, tip]) => {
            const items = list as string[];
            if (!items.length) return null;
            return (
              <details key={labelText as string} style={{ marginBottom: 6 }}>
                <summary style={{ cursor: 'pointer' }}>
                  {labelText as string}: <b>{items.length}</b>{' '}
                  <span style={s.muted}>— {tip as string}</span>
                </summary>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, ...s.muted }}>
                  {items.slice(0, 8).map((it, i) => (
                    <li key={i} style={{ marginBottom: 3 }}>
                      {it.length > 160 ? `${it.slice(0, 160)}…` : it}
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
          <p style={{ margin: '6px 0 0', fontSize: 11.5, ...s.muted }}>
            Readability 60–70 is plain English; higher is easier. Calculated on
            your device.
          </p>
        </div>
      )}
    </div>
  );
}
