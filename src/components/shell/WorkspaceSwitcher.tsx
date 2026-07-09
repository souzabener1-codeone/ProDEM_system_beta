import { ChevronsUpDown } from "lucide-react";

interface WorkspaceSwitcherProps {
  name?: string;
}

export function WorkspaceSwitcher({ name = "Gabinete PRODEM" }: WorkspaceSwitcherProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-shell-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--shell-accent)_25%,transparent)]" />
      </span>
      <span className="truncate font-medium">{name}</span>
      <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 opacity-60" />
    </button>
  );
}
