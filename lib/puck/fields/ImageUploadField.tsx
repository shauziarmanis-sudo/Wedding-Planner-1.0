"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

// ── Types ────────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  name: string;
  value: string;
  onChange: (url: string) => void;
  field: {
    label?: string;
    type: "custom";
  };
}

// ── Constants ────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const STORAGE_BUCKET = "invitation_assets";
const STORAGE_PATH_PREFIX = "puck-builder";

// ── Helper: Format file size ─────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ────────────────────────────────────────────────────

export default function ImageUploadField({
  name,
  value,
  onChange,
  field,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Upload handler ──
  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      // Validasi tipe file
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Format harus JPG, PNG, atau WebP");
        return;
      }

      // Validasi ukuran file
      if (file.size > MAX_FILE_SIZE) {
        setError(`Ukuran maks ${formatSize(MAX_FILE_SIZE)}. File: ${formatSize(file.size)}`);
        return;
      }

      setUploading(true);
      setUploadProgress("Mengupload...");

      try {
        const supabase = createClient();

        // Generate unique path
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const uniqueId = nanoid(10);
        const path = `${STORAGE_PATH_PREFIX}/${uniqueId}.${ext}`;

        // Upload ke Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, {
            cacheControl: "31536000", // 1 year cache
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Ambil public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

        // ✅ Push URL ke Puck state via onChange
        onChange(publicUrl);
        setUploadProgress(null);
      } catch (err: any) {
        console.error("Image upload error:", err);
        setError(err.message || "Gagal mengupload gambar");
        setUploadProgress(null);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  // ── File input change ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input agar bisa upload file yang sama
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Drag & drop ──
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // ── Clear image ──
  const handleClear = () => {
    onChange("");
    setError(null);
  };

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Label */}
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 6,
          color: "#333",
        }}
      >
        {field.label || name}
      </label>

      {/* ── Preview Mode (gambar sudah ada) ── */}
      {value ? (
        <div style={{ position: "relative" }}>
          <div
            style={{
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <img
              src={value}
              alt="Preview"
              style={{
                width: "100%",
                height: 160,
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check style={{ width: 14, height: 14, color: "#22c55e" }} />
                <span style={{ fontSize: 11, color: "#666" }}>Gambar terupload</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    padding: "4px 10px",
                    fontSize: 11,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    color: "#374151",
                  }}
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    padding: "4px 8px",
                    fontSize: 11,
                    borderRadius: 6,
                    border: "1px solid #fecaca",
                    backgroundColor: "#fef2f2",
                    cursor: "pointer",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Upload Zone (belum ada gambar) ── */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            borderRadius: 8,
            border: `2px dashed ${dragActive ? "#6366f1" : "#d1d5db"}`,
            backgroundColor: dragActive ? "#eef2ff" : "#fafafa",
            padding: "24px 16px",
            textAlign: "center",
            cursor: uploading ? "wait" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {uploading ? (
            <div>
              <Loader2
                style={{
                  width: 28,
                  height: 28,
                  margin: "0 auto 8px",
                  color: "#6366f1",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ fontSize: 12, color: "#6366f1", fontWeight: 500 }}>
                {uploadProgress || "Mengupload..."}
              </p>
            </div>
          ) : (
            <div>
              <ImageIcon
                style={{
                  width: 28,
                  height: 28,
                  margin: "0 auto 8px",
                  color: "#9ca3af",
                }}
              />
              <p style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 2 }}>
                Klik atau seret gambar ke sini
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af" }}>
                JPG, PNG, WebP • Maks 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p style={{ fontSize: 11, color: "#dc2626", marginTop: 6 }}>
          ⚠️ {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Spinner keyframes (inline) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
