import { supabaseAdmin } from "@/lib/supabase.server";

const BUCKET = "products";

function getExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext)
    ? ext
    : "webp";
}

function getStoragePath(publicUrl: string): string {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return "";
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

export async function uploadProductImage(
  file: File,
  slug: string,
): Promise<string> {
  const ext = getExtension(file.name);
  const path = `${slug}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function deleteProductImage(url: string): Promise<void> {
  const path = getStoragePath(url);
  if (!path) return;

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error(`Storage delete failed for ${path}:`, error.message);
  }
}
