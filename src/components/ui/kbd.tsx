import { cn } from "@/lib/cn";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center h-5 min-w-5 px-1.5",
        "text-xs font-medium font-mono text-ink-muted bg-panel-alt border border-border-strong",
        "rounded-sm",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
