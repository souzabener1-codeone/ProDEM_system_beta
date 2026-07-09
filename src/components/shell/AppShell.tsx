import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

interface AppShellProps {
  children: ReactNode;
  notificationCount?: number;
}

export function AppShell({ children, notificationCount = 2 }: AppShellProps) {
  return (
    <div className="shell-dark min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-shell-bg">
          <AppTopbar notificationCount={notificationCount} />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
