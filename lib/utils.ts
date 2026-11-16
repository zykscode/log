import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TZ = process.env.NEXT_PUBLIC_TIMEZONE || 'Europe/London';

export function formatDate(
  input: string | number | Date | null | undefined,
  style: 'long' | 'short' | 'month' | 'day' | 'weekday' | 'iso' = 'long',
): string {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  if (style === 'iso') return date.toISOString();
  const opts: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : style === 'month'
        ? { month: 'long', year: 'numeric' }
        : style === 'day'
          ? { day: 'numeric', month: 'short' }
          : style === 'weekday'
            ? {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }
            : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: TZ }).format(
    date,
  );
}

export function dateParts(input: string | Date) {
  const d = new Date(input);
  const get = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { ...o, timeZone: TZ }).format(d);
  return {
    day: get({ day: '2-digit' }),
    month: get({ month: 'short' }),
    monthLong: get({ month: 'long' }),
    year: get({ year: 'numeric' }),
    weekday: get({ weekday: 'long' }),
  };
}

/** Roman numerals for the menu (I, II, III …). */
export function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let n = num;
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

export function plural(n: number, word: string, pluralWord = `${word}s`) {
  return `${n.toLocaleString('en-GB')} ${n === 1 ? word : pluralWord}`;
}
