import { Search } from "lucide-react";

export function SidebarSearch() {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-shell-muted" />
      <input
        type="search"
        placeholder="Buscar..."
        aria-label="Buscar"
        className="h-9 w-full rounded-md border border-sidebar-border bg-shell-surface pl-8 pr-14 text-sm text-shell-fg placeholder:text-shell-muted focus:border-shell-muted/40 focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 flex h-5 -translate-y-1/2 items-center gap-0.5 rounded border border-sidebar-border bg-shell-elevated px-1.5 text-[10px] font-medium text-shell-muted">
        <span>⌘</span>K
      </kbd>
    </div>
  );
}
