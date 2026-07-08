import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
