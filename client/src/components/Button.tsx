import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-gold text-ink hover:bg-[#e8bd82]",
    secondary: "bg-white/8 text-cream ring-1 ring-white/12 hover:bg-white/12",
    danger: "bg-ember text-white hover:bg-[#eb6d5f]"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:px-5 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
