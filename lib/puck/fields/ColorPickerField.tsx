"use client";

import { useState } from "react";

interface ColorPickerFieldProps {
  name: string;
  value: string;
  onChange: (color: string) => void;
  field: {
    label?: string;
    type: "custom";
  };
}

export default function ColorPickerField({
  name,
  value,
  onChange,
  field,
}: ColorPickerFieldProps) {
  // Gunakan fallback warna putih jika kosong
  const currentColor = value || "#ffffff";

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

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 36,
            height: 36,
            padding: 0,
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            background: "none",
          }}
        />
        <input
          type="text"
          value={currentColor}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            height: 36,
            padding: "0 12px",
            fontSize: 13,
            border: "1px solid #d1d5db",
            borderRadius: 6,
            outline: "none",
            fontFamily: "monospace",
          }}
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}
