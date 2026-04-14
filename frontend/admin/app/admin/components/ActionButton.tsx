"use client";

export default function ActionButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        marginRight: "8px",
        padding: "4px 8px",
        cursor: "pointer",
        color: variant === "danger" ? "red" : "black",
      }}
    >
      {label}
    </button>
  );
}
