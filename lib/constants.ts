/** Shared option lists used by the CMS schema and the frontend. */

export const MOODS = [
  { value: 'radiant', label: 'Radiant', emoji: '🤩' },
  { value: 'happy', label: 'Happy', emoji: '😄' },
  { value: 'content', label: 'Content', emoji: '🙂' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'meh', label: 'Meh', emoji: '😐' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'grateful', label: 'Grateful', emoji: '🥹' },
  { value: 'inspired', label: 'Inspired', emoji: '✨' },
  { value: 'loved', label: 'Loved', emoji: '🥰' },
] as const;

export const WEATHER = [
  { value: 'sunny', label: 'Sunny', emoji: '☀️' },
  { value: 'partly-cloudy', label: 'Partly cloudy', emoji: '⛅' },
  { value: 'cloudy', label: 'Cloudy', emoji: '☁️' },
  { value: 'rain', label: 'Rain', emoji: '🌧️' },
  { value: 'storm', label: 'Storm', emoji: '⛈️' },
  { value: 'snow', label: 'Snow', emoji: '❄️' },
  { value: 'fog', label: 'Fog', emoji: '🌫️' },
  { value: 'windy', label: 'Windy', emoji: '🌬️' },
  { value: 'hot', label: 'Hot', emoji: '🥵' },
  { value: 'cold', label: 'Cold', emoji: '🥶' },
] as const;

export const ENTRY_TYPES = [
  {
    value: 'journal',
    label: 'Journal',
    description: 'A public notebook — thoughts, notes, updates.',
  },
  {
    value: 'diary',
    label: 'Diary',
    description: 'Personal day-to-day entries. Private by default.',
  },
] as const;

export const DISCIPLINES = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'writing', label: 'Writing' },
  { value: 'research', label: 'Research' },
  { value: 'branding', label: 'Branding' },
  { value: 'photography', label: 'Photography' },
  { value: 'video', label: 'Video' },
  { value: 'music', label: 'Music' },
  { value: 'open-source', label: 'Open source' },
  { value: 'other', label: 'Other' },
] as const;

export const PROJECT_STATUS = [
  { value: 'shipped', label: 'Shipped' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
  { value: 'concept', label: 'Concept' },
] as const;

export const SOCIAL_PLATFORMS = [
  { value: 'x', label: 'X / Twitter' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'mastodon', label: 'Mastodon' },
  { value: 'threads', label: 'Threads' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'email', label: 'Email' },
  { value: 'rss', label: 'RSS' },
  { value: 'website', label: 'Website' },
] as const;

export const CALLOUT_TYPES = [
  { value: 'note', label: 'Note', emoji: '📝' },
  { value: 'tip', label: 'Tip', emoji: '💡' },
  { value: 'important', label: 'Important', emoji: '📌' },
  { value: 'warning', label: 'Warning', emoji: '⚠️' },
  { value: 'danger', label: 'Danger', emoji: '🛑' },
  { value: 'success', label: 'Success', emoji: '✅' },
  { value: 'quote', label: 'Aside', emoji: '💬' },
] as const;

export function moodOf(value?: string | null) {
  return MOODS.find((m) => m.value === value);
}
export function weatherOf(value?: string | null) {
  return WEATHER.find((w) => w.value === value);
}
export function labelOf<T extends { value: string; label: string }>(
  list: readonly T[],
  value?: string | null,
): string {
  return list.find((i) => i.value === value)?.label ?? value ?? '';
}
