"use client";

// ── Font list: popular wedding / elegant fonts ───────────────────
export const WEDDING_FONTS = [
  { label: "Great Vibes", value: "'Great Vibes', cursive" },
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Tangerine", value: "'Tangerine', cursive" },
  { label: "Alex Brush", value: "'Alex Brush', cursive" },
  { label: "Pinyon Script", value: "'Pinyon Script', cursive" },
  { label: "Sacramento", value: "'Sacramento', cursive" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Lora", value: "'Lora', serif" },
  { label: "Cinzel", value: "'Cinzel', serif" },
  { label: "Josefin Sans", value: "'Josefin Sans', sans-serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
] as const;

interface FontPickerFieldProps {
  name: string;
  value: string;
  onChange: (font: string) => void;
  field: {
    label?: string;
    type: "custom";
  };
}

export default function FontPickerField({
  name,
  value,
  onChange,
  field,
}: FontPickerFieldProps) {
  const currentFont = value || WEDDING_FONTS[0].value;

  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 6,
          color: "#374151",
        }}
      >
        {field.label || name}
      </label>

      <select
        value={currentFont}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 40,
          padding: "0 12px",
          fontSize: 13,
          border: "1px solid #d1d5db",
          borderRadius: 8,
          outline: "none",
          cursor: "pointer",
          background: "#fff",
        }}
      >
        {WEDDING_FONTS.map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Preview */}
      <div
        style={{
          marginTop: 8,
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#fafafa",
          fontFamily: currentFont,
          fontSize: currentFont.includes("cursive") ? 22 : 16,
          color: "#374151",
          textAlign: "center",
        }}
      >
        Romeo & Juliet
      </div>
    </div>
  );
}
