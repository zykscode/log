import { readFile } from 'node:fs/promises';

import { ImageResponse } from 'next/og';

/** Generated 1200×630 share image (used when a page has no image of its own). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Zykson').slice(0, 110);
  const kind = (searchParams.get('kind') || '').slice(0, 30);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 140);

  const [regular, medium] = await Promise.all([
    readFile(
      new URL(
        '../../../../public/fonts/whyte-inktrap/WhyteInktrap-Regular.ttf',
        import.meta.url,
      ),
    ),
    readFile(
      new URL(
        '../../../../public/fonts/whyte-inktrap/WhyteInktrap-Medium.ttf',
        import.meta.url,
      ),
    ),
  ]);
  const size = title.length > 60 ? 76 : title.length > 30 ? 100 : 132;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#433b45',
        padding: 28,
        fontFamily: 'Whyte',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 28,
          padding: '56px 64px',
          color: '#d5d0ca',
          backgroundColor: '#090805',
          backgroundImage:
            'radial-gradient(rgba(213,208,202,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 26,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: '#f0643f' }}>{kind || 'Zykson'}</span>
          <span style={{ opacity: 0.5 }}>Zykson.com</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: size,
              lineHeight: 0.9,
              letterSpacing: -size * 0.045,
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                marginTop: 28,
                fontSize: 30,
                opacity: 0.6,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Whyte', data: regular, weight: 400, style: 'normal' },
        { name: 'Whyte', data: medium, weight: 500, style: 'normal' },
      ],
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    },
  );
}
