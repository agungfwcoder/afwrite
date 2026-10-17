// Embed video yang diizinkan. URL iframe SELALU dibangun ulang dari ID video,
// tidak pernah memakai src mentah dari input/paste.

const PROVIDERS = {
  youtube: {
    title: 'YouTube',
    src: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  },
  vimeo: {
    title: 'Vimeo',
    src: (id) => `https://player.vimeo.com/video/${id}`,
  },
};

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];
const YOUTUBE_ID = /^[\w-]{11}$/;

// "https://youtu.be/dQw4w9WgXcQ" -> { provider: 'youtube', id, src, title }; tidak dikenal -> null
export function parseEmbed(input) {
  let url;
  try {
    const raw = String(input || '').trim();
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);
  let provider = null;
  let id = null;

  if (host === 'youtu.be') {
    provider = 'youtube';
    id = parts[0];
  } else if (YOUTUBE_HOSTS.includes(host)) {
    provider = 'youtube';
    id = parts[0] === 'watch' ? url.searchParams.get('v') : ['embed', 'shorts', 'live', 'v'].includes(parts[0]) ? parts[1] : null;
  } else if (host === 'vimeo.com' || host === 'www.vimeo.com') {
    provider = 'vimeo';
    id = parts.find((p) => /^\d+$/.test(p));
  } else if (host === 'player.vimeo.com' && parts[0] === 'video') {
    provider = 'vimeo';
    id = parts[1];
  }

  const valid = provider === 'youtube' ? YOUTUBE_ID.test(id || '') : provider === 'vimeo' && /^\d{1,12}$/.test(id || '');
  if (!valid) return null;

  return { provider, id, src: PROVIDERS[provider].src(id), title: PROVIDERS[provider].title };
}

export function createEmbedIframe(embed) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', embed.src);
  iframe.setAttribute('title', embed.title);
  iframe.setAttribute('allow', 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  return iframe;
}

// Validasi src gambar. data:image hanya format raster umum (bukan SVG).
export function normalizeImageSrc(input, { allowData = true, allowBlob = false } = {}) {
  const src = String(input || '').trim();
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('//')) return `https:${src}`;
  if (/^\/(?!\/)/.test(src) || /^\.\.?\//.test(src)) return src;
  if (allowData && /^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(src)) return src;
  if (allowBlob && /^blob:/i.test(src)) return src;
  return null;
}
