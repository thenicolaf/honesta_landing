export type VideoKind = "youtube" | "mp4";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

function parseUrl(input: string): URL | null {
  try {
    return new URL(input.trim());
  } catch {
    return null;
  }
}

export function getVideoKind(url: string | null | undefined): VideoKind | null {
  if (!url) return null;
  const parsed = parseUrl(url);
  if (!parsed) return null;

  if (YOUTUBE_HOSTS.has(parsed.hostname)) return "youtube";

  const path = parsed.pathname.toLowerCase();
  if (/\.(mp4|webm|mov|m4v)$/.test(path)) return "mp4";

  // Supabase Storage public URLs end with a UUID without explicit extension
  // checks — but our uploadVideo always writes an extension, so the regex
  // above covers the realistic case. Fall back to null for anything else.
  return null;
}

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const parsed = parseUrl(url);
  if (!parsed) return null;
  if (!YOUTUBE_HOSTS.has(parsed.hostname)) return null;

  if (parsed.hostname === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return isValidYouTubeId(id) ? id : null;
  }

  const v = parsed.searchParams.get("v");
  if (v && isValidYouTubeId(v)) return v;

  const parts = parsed.pathname.split("/").filter(Boolean);
  // /shorts/{id}, /embed/{id}, /live/{id}
  if (parts.length >= 2 && ["shorts", "embed", "live"].includes(parts[0])) {
    return isValidYouTubeId(parts[1]) ? parts[1] : null;
  }

  return null;
}

function isValidYouTubeId(id: string | undefined): id is string {
  return !!id && /^[A-Za-z0-9_-]{11}$/.test(id);
}

export function getYouTubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0`;
}

/**
 * Chrome refuses to play `<source type="video/quicktime">` even when the MOV
 * container holds a fully-supported H.264 stream (which most phone-recorded
 * MOVs do). Re-mapping the MIME to `video/mp4` makes the browser actually
 * attempt playback. If the inner codec is unsupported (e.g. HEVC, ProRes),
 * playback still fails — but it would fail with the original MIME too.
 *
 * Used both client-side (when building <source> elements for preview) and
 * server-side (when setting Content-Type on upload to Supabase Storage).
 */
export function getPlayableVideoMime(
  type: string | null | undefined,
): string {
  if (!type) return "video/mp4";
  if (type === "video/quicktime" || type === "video/x-quicktime") {
    return "video/mp4";
  }
  return type;
}

/**
 * Server-side validator for product.video_url. Accepts YouTube links of any
 * supported shape, and Supabase Storage URLs that point at the configured
 * project origin's product-videos bucket.
 */
export function isValidVideoUrl(url: string): boolean {
  const kind = getVideoKind(url);
  if (kind === "youtube") {
    return extractYouTubeId(url) !== null;
  }
  if (kind === "mp4") {
    const parsed = parseUrl(url);
    if (!parsed) return false;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return true;
    const supabaseOrigin = parseUrl(supabaseUrl)?.origin;
    if (!supabaseOrigin) return true;
    return (
      parsed.origin === supabaseOrigin &&
      parsed.pathname.includes("/object/public/product-videos/")
    );
  }
  return false;
}
