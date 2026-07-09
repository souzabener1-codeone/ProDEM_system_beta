import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppTopbarProps {
  notificationCount?: number;
}

export function AppTopbar({ notificationCount = 0 }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-shell-border bg-shell-bg/95 px-4 backdrop-blur">
      <SidebarTrigger className="text-shell-fg hover:bg-shell-surface" />
      <div className="flex-1" />
      <button
        type="button"
        aria-label="Notificações"
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-shell-fg transition-colors hover:bg-shell-surface"
      >
        <Bell className="h-4.5 w-4.5" />
        {notificationCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-blue px-1 text-[10px] font-semibold text-white">
            {notificationCount}
          </span>
        )}
      </button>
      <button
        type="button"
        aria-label="Perfil"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-blue text-xs font-semibold text-white ring-1 ring-shell-border"
      >
        MA
      </button>
    </header>
  );
}
