/**
 * Text colours & highlights available in the editor toolbar ("Aa" menu).
 * The editor uses the inline CSS below; the site renders the same keys as
 * data attributes styled in globals.css (so the palette can change later
 * without touching stored content).
 */
type Css = Record<string, string>;
type StateValues = Record<string, { label: string; css: Css }>;

export const TEXT_STATES: Record<string, StateValues> = {
  color: {
    ember: { label: 'Ember red', css: { color: '#d32d08' } },
    rust: { label: 'Rust', css: { color: 'light-dark(#903900, #e0915c)' } },
    moss: { label: 'Moss', css: { color: 'light-dark(#4f6b3a, #a7c48f)' } },
    sea: { label: 'Sea', css: { color: 'light-dark(#1f5f7a, #8cc6dd)' } },
    plum: { label: 'Plum', css: { color: 'light-dark(#6b3f73, #c9a0d1)' } },
    muted: { label: 'Muted', css: { color: 'light-dark(#5a5e57, #9c978f)' } },
  },
  highlight: {
    marker: {
      label: 'Highlighter',
      css: {
        'background-color': 'light-dark(#f3e27a, #6b5b12)',
        padding: '0 .15em',
      },
    },
    ember: {
      label: 'Red highlight',
      css: {
        'background-color': 'light-dark(#f6c9bd, #5a1d0f)',
        padding: '0 .15em',
      },
    },
    moss: {
      label: 'Green highlight',
      css: {
        'background-color': 'light-dark(#d6e6c6, #2c3b22)',
        padding: '0 .15em',
      },
    },
    sea: {
      label: 'Blue highlight',
      css: {
        'background-color': 'light-dark(#cfe5ef, #183846)',
        padding: '0 .15em',
      },
    },
  },
  style: {
    'small-caps': {
      label: 'Small caps',
      css: { 'font-variant': 'small-caps' },
    },
    spoiler: {
      label: 'Spoiler (reveal on hover)',
      css: { 'background-color': 'currentColor', 'border-radius': '2px' },
    },
    handwritten: {
      label: 'Handwritten',
      css: { 'font-style': 'italic', 'letter-spacing': '0.02em' },
    },
  },
};
