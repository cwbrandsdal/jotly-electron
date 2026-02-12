import { Feather } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-ink-muted gap-5">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center">
        <Feather size={28} strokeWidth={1.5} className="text-accent" />
      </div>
      <div className="text-center">
        <p className="text-lg font-display font-semibold text-ink-secondary">
          No note selected
        </p>
        <p className="text-sm mt-1.5">
          Select a note from the sidebar or press{" "}
          <Kbd>Ctrl+K</Kbd> to quick open
        </p>
      </div>
    </div>
  );
}
