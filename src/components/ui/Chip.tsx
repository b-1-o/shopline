import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function Chip({ active = false, className = "", children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      className={`chip ${active ? "active" : ""} ${className}`.trim()}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="chip-row">{children}</div>;
}
