import { Plus, LogOut, User, Sun, Moon, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

interface TopBarProps {
  onNewNote: () => void;
  onCommandPalette: () => void;
  onSignOut: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onSettings: () => void;
  theme: "light" | "dark";
  userName?: string;
}

export function TopBar({
  onNewNote,
  onCommandPalette,
  onSignOut,
  onToggleTheme,
  onToggleSidebar,
  onSettings,
  theme,
  userName,
}: TopBarProps) {
  return (
    <header className="h-12 flex items-center justify-between px-3 md:px-4 bg-panel border-b border-border shrink-0">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-sm hover:bg-hover text-ink-muted hover:text-ink transition-colors cursor-pointer md:hidden"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <Button variant="ghost" size="sm" onClick={onNewNote} title="New note (Ctrl+N)">
          <Plus size={16} />
          <span className="font-display font-semibold hidden sm:inline">New</span>
        </Button>
        <button
          onClick={onCommandPalette}
          className="hidden md:flex items-center gap-2 h-8 px-3 rounded-sm bg-panel-alt border border-border text-sm text-ink-muted hover:bg-hover hover:text-ink-secondary transition-colors cursor-pointer"
        >
          Quick open...
          <Kbd>Ctrl+K</Kbd>
        </button>
      </div>

      <div className="flex items-center gap-0.5 md:gap-1">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-sm hover:bg-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={onSettings}
          className="p-2 rounded-sm hover:bg-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={16} />
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-ink-secondary">
          <User size={14} />
          <span>{userName || "User"}</span>
        </div>
        <button
          onClick={onSignOut}
          className="p-2 rounded-sm hover:bg-hover text-ink-muted hover:text-ink transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
