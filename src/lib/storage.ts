import { supabaseAdmin } from "@/lib/supabase.server";
import { getPlayableVideoMime } from "@/shared/utils/videoUrl";

const ALLOWED_BUCKETS = [
  "products",
  "categories",
  "mixes",
  "marketing",
  "product-videos",
] as const;
export type StorageBucket = (typeof ALLOWED_BUCKETS)[number];

function assertBucket(bucket: string): asserts bucket is StorageBucket {
  if (!ALLOWED_BUCKETS.includes(bucket as StorageBucket)) {
    throw new Error(`Invalid storage bucket: ${bucket}`);
  }
}

function getExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext)
    ? ext
    : "webp";
}

function getVideoExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && ["mp4", "webm", "mov", "m4v"].includes(ext) ? ext : "mp4";
}

function getStoragePath(publicUrl: string, bucket: StorageBucket): string {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return "";
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

export async function uploadImage(
  file: File,
  slug: string,
  bucket: StorageBucket = "products",
): Promise<string> {
  assertBucket(bucket);

  const ext = getExtension(file.name);
  const path = `${slug}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

/**
 * Parse form images from FormData: existing URLs (string) pass through,
 * new files (File) are uploaded to Storage. Returns URLs in DOM order.
 */
export async function parseFormImages(
  formData: FormData,
  fieldName: string,
  slug: string,
  bucket: StorageBucket,
): Promise<string[]> {
  const entries = formData.getAll(fieldName);
  const urls: string[] = [];

  for (const entry of entries) {
    if (typeof entry === "string" && entry.trim()) {
      urls.push(entry.trim());
    } else if (entry instanceof File && entry.size > 0) {
      urls.push(await uploadImage(entry, slug, bucket));
    }
  }

  return urls;
}

export async function uploadVideo(
  file: File,
  slug: string,
  bucket: StorageBucket = "product-videos",
): Promise<string> {
  assertBucket(bucket);

  // Validate by MIME OR by extension. Some OS/browser combos report empty
  // file.type for valid videos (notably MOV on Windows).
  const ext = getVideoExtension(file.name);
  const isVideoMime = file.type.startsWith("video/");
  const isVideoExt = ["mp4", "webm", "mov", "m4v"].includes(ext);
  if (!isVideoMime && !isVideoExt) {
    throw new Error(`Expected a video file, got ${file.type || "unknown"}`);
  }

  const path = `${slug}-${crypto.randomUUID()}.${ext}`;
  // Store with a browser-playable Content-Type. MOVs are remapped to
  // video/mp4 so Chrome's <source type=...> check doesn't reject playback
  // on later fetches (most phone MOVs are H.264 in a QuickTime container).
  const contentType = getPlayableVideoMime(file.type);

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

/**
 * Single-value sibling of parseFormImages: reads the first entry under
 * fieldName. Existing URL (string) passes through; a new File is uploaded.
 * Returns null when the field is empty.
 */
export async function parseFormVideo(
  formData: FormData,
  fieldName: string,
  slug: string,
  bucket: StorageBucket,
): Promise<string | null> {
  const entries = formData.getAll(fieldName);

  for (const entry of entries) {
    if (typeof entry === "string" && entry.trim()) {
      return entry.trim();
    }
    if (entry instanceof File && entry.size > 0) {
      return await uploadVideo(entry, slug, bucket);
    }
  }

  return null;
}

export async function deleteImage(
  url: string,
  bucket: StorageBucket = "products",
): Promise<void> {
  assertBucket(bucket);

  const path = getStoragePath(url, bucket);
  if (!path) return;

  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`Storage delete failed for ${path}:`, error.message);
  }
}

