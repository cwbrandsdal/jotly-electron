import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface Tab {
  id: string;
  title: string;
}

interface TabStripProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseAll: () => void;
  onCloseOthers: (id: string) => void;
  onCloseToRight: (id: string) => void;
  onArchiveTab?: (id: string) => void;
  onDeleteTab?: (id: string) => void;
  children?: React.ReactNode;
}

interface ContextMenu {
  tabId: string;
  x: number;
  y: number;
}

export function TabStrip({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseAll,
  onCloseOthers,
  onCloseToRight,
  onArchiveTab,
  onDeleteTab,
  children,
}: TabStripProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or Escape
  useEffect(() => {
    if (!contextMenu) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setContextMenu(null);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu]);

  if (tabs.length === 0) return null;

  function handleContextMenu(e: React.MouseEvent, tabId: string) {
    e.preventDefault();
    setContextMenu({ tabId, x: e.clientX, y: e.clientY });
  }

  const tabIndex = contextMenu
    ? tabs.findIndex((t) => t.id === contextMenu.tabId)
    : -1;
  const hasTabsToRight = tabIndex >= 0 && tabIndex < tabs.length - 1;

  return (
    <>
      <div className="flex items-center bg-panel-alt border-b border-border shrink-0">
        {/* Scrollable tabs */}
        <div className="flex items-center overflow-x-auto min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group flex items-center gap-1.5 h-9 px-3 text-sm border-r border-border cursor-pointer shrink-0 max-w-48 transition-all",
                tab.id === activeTabId
                  ? "bg-page text-ink border-b-2 border-b-accent"
                  : "bg-panel-alt text-ink-muted hover:bg-hover hover:text-ink-secondary",
              )}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
            >
              <span className="truncate text-xs font-medium">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="ml-auto p-0.5 rounded-sm hover:bg-active opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Right-side controls */}
        {children && (
          <div className="ml-auto flex items-center gap-2 px-3 shrink-0">
            {children}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-44 bg-panel border border-border-strong rounded-sm shadow-xl py-1 text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <ContextMenuItem
            label="Close"
            onClick={() => {
              onCloseTab(contextMenu.tabId);
              setContextMenu(null);
            }}
          />
          <ContextMenuItem
            label="Close others"
            disabled={tabs.length <= 1}
            onClick={() => {
              onCloseOthers(contextMenu.tabId);
              setContextMenu(null);
            }}
          />
          <ContextMenuItem
            label="Close to the right"
            disabled={!hasTabsToRight}
            onClick={() => {
              onCloseToRight(contextMenu.tabId);
              setContextMenu(null);
            }}
          />
          <div className="my-1 border-t border-border" />
          <ContextMenuItem
            label="Close all"
            onClick={() => {
              onCloseAll();
              setContextMenu(null);
            }}
          />
          {(onArchiveTab || onDeleteTab) && (
            <div className="my-1 border-t border-border" />
          )}
          {onArchiveTab && (
            <ContextMenuItem
              label="Archive"
              onClick={() => {
                onArchiveTab(contextMenu.tabId);
                setContextMenu(null);
              }}
            />
          )}
          {onDeleteTab && (
            <ContextMenuItem
              label="Delete"
              danger
              onClick={() => {
                onDeleteTab(contextMenu.tabId);
                setContextMenu(null);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}

function ContextMenuItem({
  label,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left px-3 py-1.5 transition-colors cursor-pointer",
        disabled
          ? "text-ink-muted/50 cursor-not-allowed"
          : danger
            ? "text-danger hover:bg-danger/10"
            : "text-ink-secondary hover:bg-hover hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
