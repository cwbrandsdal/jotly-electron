import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@workos-inc/authkit-react";
import { Check, Loader2, Pencil, Eye } from "lucide-react";
import { cn } from "@/lib/cn";
import { Sidebar } from "@/components/layout/sidebar";
import type { SidebarView } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { TabStrip } from "@/components/notes/tab-strip";
import { NoteEditor } from "@/components/notes/note-editor";
import type { SaveStatus } from "@/components/notes/note-editor";
import { CommandPalette } from "@/components/notes/command-palette";
import { EmptyState } from "@/components/layout/empty-state";
import {
  useNotes,
  useArchivedNotes,
  useDeletedNotes,
  useCreateNote,
  usePinNote,
  useUnpinNote,
  useArchiveNote,
  useUnarchiveNote,
  useDeleteNote,
  useRestoreNote,
  useHardDeleteNote,
} from "@/hooks/use-notes";
import { useOpenTabs } from "@/hooks/use-open-tabs";
import { useTheme } from "@/hooks/use-theme";

export function AppPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [sidebarView, setSidebarView] = useState<SidebarView>("notes");

  const { data: notesData, isLoading: notesLoading } = useNotes({
    query: searchQuery || undefined,
    pageSize: 100,
  });

  const { data: archivedData, isLoading: archivedLoading } = useArchivedNotes({
    query: searchQuery || undefined,
    pageSize: 100,
  });

  const { data: deletedData, isLoading: deletedLoading } = useDeletedNotes({
    query: searchQuery || undefined,
    pageSize: 100,
  });

  const createNote = useCreateNote();
  const pinNote = usePinNote();
  const unpinNote = useUnpinNote();
  const archiveNote = useArchiveNote();
  const unarchiveNote = useUnarchiveNote();
  const deleteNote = useDeleteNote();
  const restoreNote = useRestoreNote();
  const hardDeleteNote = useHardDeleteNote();
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab,
    closeAll,
    closeOthers,
    closeToRight,
    updateTabTitle,
  } = useOpenTabs();

  const notes = notesData?.items ?? [];
  const archivedNotes = archivedData?.items ?? [];
  const deletedNotes = deletedData?.items ?? [];

  const handleNewNote = useCallback(async () => {
    const result = await createNote.mutateAsync({
      title: "Untitled",
      body: "",
    });
    openTab(result.id, result.title);
    setSidebarOpen(false);
    setEditorMode("edit");
  }, [createNote, openTab]);

  const handleSelectNote = useCallback(
    (id: string, title: string) => {
      openTab(id, title);
      setEditorMode("edit");
    },
    [openTab],
  );

  const handleTogglePin = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note?.isPinned) {
        unpinNote.mutate(id);
      } else {
        pinNote.mutate(id);
      }
    },
    [notes, pinNote, unpinNote],
  );

  const handleArchiveTab = useCallback(
    (id: string) => {
      archiveNote.mutate(id);
      closeTab(id);
    },
    [archiveNote, closeTab],
  );

  const handleDeleteTab = useCallback(
    (id: string) => {
      deleteNote.mutate(id);
      closeTab(id);
    },
    [deleteNote, closeTab],
  );

  const handleUnarchive = useCallback(
    (id: string) => {
      closeTab(id);
      unarchiveNote.mutate(id);
    },
    [unarchiveNote, closeTab],
  );

  const handleRestore = useCallback(
    (id: string) => {
      closeTab(id);
      restoreNote.mutate(id);
    },
    [restoreNote, closeTab],
  );

  const handleHardDelete = useCallback(
    (id: string) => {
      closeTab(id);
      hardDeleteNote.mutate(id);
    },
    [hardDeleteNote, closeTab],
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      } else if (isCtrl && e.key === "n") {
        e.preventDefault();
        handleNewNote();
      } else if (isCtrl && e.key === "p") {
        e.preventDefault();
        if (activeTabId) handleTogglePin(activeTabId);
      } else if (isCtrl && e.key === "f") {
        e.preventDefault();
        document.getElementById("sidebar-search")?.focus();
      } else if (isCtrl && e.key === "e") {
        e.preventDefault();
        setEditorMode((m) => (m === "edit" ? "preview" : "edit"));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewNote, handleTogglePin, activeTabId]);

  return (
    <div className="h-screen flex flex-col bg-page">
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar
          notes={notes}
          archivedNotes={archivedNotes}
          deletedNotes={deletedNotes}
          activeNoteId={activeTabId}
          isLoading={notesLoading}
          isArchivedLoading={archivedLoading}
          isDeletedLoading={deletedLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          sidebarView={sidebarView}
          onSidebarViewChange={setSidebarView}
          onArchive={(id) => archiveNote.mutate(id)}
          onDelete={(id) => deleteNote.mutate(id)}
          onUnarchive={handleUnarchive}
          onRestore={handleRestore}
          onHardDelete={handleHardDelete}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            onNewNote={handleNewNote}
            onCommandPalette={() => setCommandPaletteOpen(true)}
            onSignOut={() => signOut()}
            onToggleTheme={toggleTheme}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            theme={theme}
            userName={user?.firstName || undefined}
          />

          <TabStrip
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={closeTab}
            onCloseAll={closeAll}
            onCloseOthers={closeOthers}
            onCloseToRight={closeToRight}
            onArchiveTab={handleArchiveTab}
            onDeleteTab={handleDeleteTab}
          >
            {activeTabId && (
              <>
                {/* Edit / Preview toggle */}
                <div className="flex items-center gap-0.5 bg-panel-alt rounded-sm border border-border p-0.5">
                  <button
                    onClick={() => setEditorMode("edit")}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium transition-colors cursor-pointer",
                      editorMode === "edit"
                        ? "bg-page text-ink shadow-sm"
                        : "text-ink-muted hover:text-ink-secondary",
                    )}
                  >
                    <Pencil size={10} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => setEditorMode("preview")}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium transition-colors cursor-pointer",
                      editorMode === "preview"
                        ? "bg-page text-ink shadow-sm"
                        : "text-ink-muted hover:text-ink-secondary",
                    )}
                  >
                    <Eye size={10} />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>

                {/* Save status */}
                <div className="flex items-center gap-1 text-xs">
                  {saveStatus === "saved" && (
                    <>
                      <Check size={11} className="text-success" />
                      <span className="text-ink-muted hidden sm:inline">Saved</span>
                    </>
                  )}
                  {saveStatus === "saving" && (
                    <>
                      <Loader2 size={11} className="animate-spin text-accent" />
                      <span className="text-ink-muted hidden sm:inline">Saving...</span>
                    </>
                  )}
                  {saveStatus === "unsaved" && (
                    <span className="text-warning">Unsaved</span>
                  )}
                </div>
              </>
            )}
          </TabStrip>

          {/* Editor */}
          {activeTabId ? (
            <NoteEditor
              key={activeTabId}
              noteId={activeTabId}
              mode={editorMode}
              onTitleChange={updateTabTitle}
              onSaveStatusChange={setSaveStatus}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Command palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectNote={handleSelectNote}
      />
    </div>
  );
}
