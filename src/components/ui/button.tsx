import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all cursor-pointer rounded-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Variants
        variant === "primary" &&
          "bg-accent text-white hover:bg-accent-hover active:scale-[0.97]",
        variant === "secondary" &&
          "bg-panel-alt text-ink hover:bg-hover active:bg-active border border-border",
        variant === "ghost" &&
          "bg-transparent text-ink-secondary hover:bg-hover hover:text-ink",
        variant === "danger" &&
          "bg-accent text-white hover:bg-accent-hover active:scale-[0.97]",
        // Sizes
        size === "sm" && "h-8 px-3 text-sm gap-1.5",
        size === "md" && "h-10 px-5 text-base gap-2",
        size === "lg" && "h-12 px-7 text-lg gap-2.5",
        className,
      )}
      {...props}
    />
  );
}
