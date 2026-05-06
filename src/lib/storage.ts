import { supabaseAdmin } from "@/lib/supabase.server";

const ALLOWED_BUCKETS = ["products", "categories", "mixes", "marketing"] as const;
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

