"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 0.82;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB input limit

async function optimizeImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if needed
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) resolve({ blob: jpegBlob, width, height });
                else reject(new Error("Failed to compress image"));
              },
              "image/jpeg",
              QUALITY
            );
          }
        },
        "image/webp",
        QUALITY
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 15MB)");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Optimize client-side
      const { blob, width, height } = await optimizeImage(file);

      // Generate unique filename
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      const sanitized = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const filename = `${Date.now()}-${sanitized}.${ext}`;
      const storagePath = `henrik/${filename}`;

      const supabase = createClient();

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, blob, {
          contentType: blob.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // Save to media table
      await supabase.from("media").insert({
        filename,
        original_filename: file.name,
        storage_path: storagePath,
        url: publicUrl,
        size_bytes: blob.size,
        mime_type: blob.type,
        width,
        height,
        site: "henrik",
      });

      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}
      </label>

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt=""
            className="w-full h-40 object-cover border border-[var(--border)] rounded"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 text-xs bg-white text-black rounded hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 text-white hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed rounded cursor-pointer transition-colors ${
            dragOver
              ? "border-[var(--foreground)] bg-[var(--muted)]"
              : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin text-[var(--muted-foreground)]" />
              <span className="text-xs text-[var(--muted-foreground)]">Optimizing & uploading...</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-[var(--muted-foreground)]" />
              <span className="text-xs text-[var(--muted-foreground)]">
                Drop image or click to upload
              </span>
              <span className="text-xs text-[var(--muted-foreground)]/60">
                Auto-optimized for web (max 1920px, WebP)
              </span>
            </>
          )}
        </div>
      )}

      {/* URL manual input fallback */}
      <div className="flex items-center gap-2 mt-1">
        <ImageIcon size={12} className="text-[var(--muted-foreground)] shrink-0" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL..."
          className="flex-1 px-2 py-1 text-xs bg-transparent border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
