import { useEffect, useState, useRef, useCallback } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/api/client";
import type { NoteSummaryDto } from "@/types/api";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (id: string, title: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectNote }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NoteSummaryDto[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const answerQueryRef = useRef<string>("");

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setAnswer(null);
      setSelectedIndex(0);
      setIsAnswering(false);
      answerQueryRef.current = "";
      fetchNotes("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Semantic note search — fires on every keystroke (200ms debounce, cheap embedding call)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fetchNotes(query), 200);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  async function fetchNotes(search: string) {
    setIsLoading(true);
    try {
      const result = search.trim()
        ? await api.searchNotes({ query: search, pageSize: 10 })
        : await api.getNotes({ pageSize: 10 });
      setResults(result.items);
      setSelectedIndex(0);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  // AI answer — only triggered explicitly via Ctrl+Enter
  const fetchAnswer = useCallback(async () => {
    const q = query.trim();
    if (!q || isAnswering) return;

    setIsAnswering(true);
    answerQueryRef.current = q;
    try {
      const result = await api.askNotes({ query: q });
      // Only apply if query hasn't changed while we were waiting
      if (answerQueryRef.current === q) {
        setAnswer(result.answer);
        if (result.notes.length > 0) {
          setResults(result.notes);
          setSelectedIndex(0);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsAnswering(false);
    }
  }, [query, isAnswering]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      // Ctrl+Enter → ask AI
      e.preventDefault();
      setAnswer(null);
      fetchAnswer();
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      const note = results[selectedIndex];
      onSelectNote(note.id, note.title);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  // Clear answer when query changes
  useEffect(() => {
    setAnswer(null);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg bg-panel border border-border-strong rounded-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
          <Search size={16} className="text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes... (Ctrl+Enter to ask AI)"
            className="flex-1 bg-transparent text-base text-ink placeholder:text-ink-muted outline-none"
          />
        </div>

        {/* AI Answer */}
        {isAnswering && (
          <div className="px-4 py-3 border-b border-border bg-accent-soft/30">
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
              <Loader2 size={12} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        {answer && !isAnswering && (
          <div className="px-4 py-3 border-b border-border bg-accent-soft/30">
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent mb-1.5">
              <Sparkles size={12} />
              Answer
            </div>
            <p className="text-sm text-ink leading-relaxed">{answer}</p>
          </div>
        )}

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-sm text-ink-muted text-center">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-ink-muted text-center">
              {query ? "No notes found" : "No notes yet"}
            </div>
          ) : (
            <>
              {results.length > 0 && answer && !isAnswering && (
                <div className="px-4 pt-2 pb-1 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                  Sources
                </div>
              )}
              {results.map((note, index) => (
                <button
                  key={note.id}
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer",
                    index === selectedIndex
                      ? "bg-accent-soft text-accent"
                      : "text-ink-secondary hover:bg-hover",
                  )}
                  onClick={() => {
                    onSelectNote(note.id, note.title);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="text-sm font-medium truncate">{note.title}</span>
                  <span className="ml-auto text-xs text-ink-muted shrink-0">
                    {new Date(note.updatedUtc).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-ink-muted">
          <span>
            <kbd className="font-mono">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="font-mono">↵</kbd> open
          </span>
          <span>
            <kbd className="font-mono">Ctrl+↵</kbd> ask AI
          </span>
          <span>
            <kbd className="font-mono">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
