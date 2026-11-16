import { cn } from '@/lib/utils';
import type { Media } from '@/payload-types';

type Props = {
  media?: Media | number | string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  /** CSS `sizes` hint, e.g. "(min-width: 1024px) 50vw, 100vw" */
  sizes?: string;
  priority?: boolean;
  /** Force an aspect ratio box (e.g. "3/2"); otherwise the image's own ratio. */
  aspect?: string;
  fit?: 'cover' | 'contain';
};

const ORDER = ['thumb', 'card', 'feature', 'hero'] as const;

/**
 * Responsive <img> built from the sizes Payload generates on upload (WebP),
 * with the stored blur preview as a placeholder. No paid image optimisation.
 */
export function MediaImage({
  media,
  alt,
  className,
  imgClassName,
  sizes = '100vw',
  priority,
  aspect,
  fit = 'cover',
}: Props) {
  if (!media || typeof media !== 'object' || !media.url) return null;
  const isImage = media.mimeType?.startsWith('image/');
  if (!isImage) return null;

  const srcSet = ORDER.map((name) => media.sizes?.[name])
    .filter((s): s is NonNullable<typeof s> => Boolean(s?.url && s?.width))
    .map((s) => `${s.url} ${s.width}w`);
  if (media.width && media.mimeType !== 'image/svg+xml')
    srcSet.push(`${media.url} ${media.width}w`);

  const fp =
    media.focalX != null && media.focalY != null
      ? `${media.focalX}% ${media.focalY}%`
      : undefined;

  return (
    <div
      className={cn('relative overflow-hidden bg-fg/5', className)}
      style={{
        aspectRatio:
          aspect ??
          (media.width && media.height
            ? `${media.width}/${media.height}`
            : undefined),
        backgroundImage: media.blurDataURL
          ? `url(${media.blurDataURL})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: fp ?? 'center',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.sizes?.feature?.url || media.url}
        srcSet={srcSet.length > 1 ? srcSet.join(', ') : undefined}
        sizes={sizes}
        alt={alt ?? media.alt ?? ''}
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={cn(
          'h-full w-full',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          imgClassName,
        )}
        style={{ objectPosition: fp }}
      />
    </div>
  );
}

export function mediaUrl(
  media?: Media | number | string | null,
  size?: (typeof ORDER)[number] | 'og',
) {
  if (!media || typeof media !== 'object') return undefined;
  return (size && media.sizes?.[size]?.url) || media.url || undefined;
}
