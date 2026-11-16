/** Turns a pasted URL into an embeddable iframe (or null → show a link card). */
export type EmbedInfo = {
  src: string;
  provider: string;
  aspect?: string;
  height?: number;
  title: string;
};

export function resolveEmbed(raw: string): EmbedInfo | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  const path = url.pathname;

  // YouTube
  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtu.be' ||
    host === 'youtube-nocookie.com'
  ) {
    let id = '';
    let vertical = false;
    if (host === 'youtu.be') id = path.slice(1);
    else if (path.startsWith('/shorts/')) {
      id = path.split('/')[2];
      vertical = true;
    } else if (path.startsWith('/embed/')) id = path.split('/')[2];
    else id = url.searchParams.get('v') ?? '';
    if (!id) return null;
    const start = url.searchParams.get('t')?.replace(/s$/, '');
    return {
      provider: 'YouTube',
      title: 'YouTube video',
      src: `https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${parseInt(start, 10) || 0}` : ''}`,
      aspect: vertical ? '9/16' : '16/9',
    };
  }
  // Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = path
      .split('/')
      .filter(Boolean)
      .find((s) => /^\d+$/.test(s));
    return id
      ? {
          provider: 'Vimeo',
          title: 'Vimeo video',
          src: `https://player.vimeo.com/video/${id}?dnt=1`,
          aspect: '16/9',
        }
      : null;
  }
  // Spotify
  if (host === 'open.spotify.com') {
    const [type, id] = path
      .split('/')
      .filter(Boolean)
      .filter((s) => !s.startsWith('intl-'));
    if (!type || !id) return null;
    return {
      provider: 'Spotify',
      title: `Spotify ${type}`,
      src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`,
      height: type === 'track' || type === 'episode' ? 152 : 380,
    };
  }
  // SoundCloud
  if (host === 'soundcloud.com') {
    return {
      provider: 'SoundCloud',
      title: 'SoundCloud',
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&color=%23d32d08&visual=false`,
      height:
        path.split('/').filter(Boolean).length > 2 && path.includes('/sets/')
          ? 450
          : 166,
    };
  }
  // CodePen
  if (host === 'codepen.io') {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 3) {
      return {
        provider: 'CodePen',
        title: 'CodePen',
        src: `https://codepen.io/${parts[0]}/embed/${parts[2]}?default-tab=result&theme-id=dark`,
        height: 460,
      };
    }
  }
  // CodeSandbox
  if (host === 'codesandbox.io') {
    const id = path.split('/').filter(Boolean).pop();
    return id
      ? {
          provider: 'CodeSandbox',
          title: 'CodeSandbox',
          src: `https://codesandbox.io/embed/${id}`,
          height: 500,
        }
      : null;
  }
  // Figma
  if (host === 'figma.com') {
    return {
      provider: 'Figma',
      title: 'Figma',
      src: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(raw)}`,
      aspect: '16/10',
    };
  }
  // Loom
  if (host === 'loom.com') {
    const id = path.split('/').filter(Boolean)[1];
    return id
      ? {
          provider: 'Loom',
          title: 'Loom video',
          src: `https://www.loom.com/embed/${id}`,
          aspect: '16/9',
        }
      : null;
  }
  // Google Maps (use the "Embed a map" link)
  if (
    (host === 'google.com' || host === 'maps.google.com') &&
    path.includes('/maps/embed')
  ) {
    return { provider: 'Google Maps', title: 'Map', src: raw, aspect: '4/3' };
  }
  // Bandcamp embedded player
  if (host === 'bandcamp.com' && path.startsWith('/EmbeddedPlayer')) {
    return { provider: 'Bandcamp', title: 'Bandcamp', src: raw, height: 120 };
  }
  return null;
}
