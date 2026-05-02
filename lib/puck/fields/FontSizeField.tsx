"use client";

interface FontSizeFieldProps {
  name: string;
  value: number;
  onChange: (size: number) => void;
  field: {
    label?: string;
    type: "custom";
  };
}

export default function FontSizeField({
  name,
  value,
  onChange,
  field,
}: FontSizeFieldProps) {
  const currentSize = value || 16;

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
          type="range"
          min={10}
          max={72}
          step={1}
          value={currentSize}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, cursor: "pointer" }}
        />
        <span
          style={{
            minWidth: 42,
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
            background: "#f3f4f6",
            padding: "4px 8px",
            borderRadius: 6,
            fontFamily: "monospace",
          }}
        >
          {currentSize}px
        </span>
      </div>
    </div>
  );
}
