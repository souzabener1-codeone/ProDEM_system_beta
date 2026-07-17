import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Tags,
  Activity,
  BarChart3,
  LogOut,
} from "@/components/icons";
import type { LucideIcon } from "@/components/icons";
import prodemLogo from "@/assets/prodem-logo.png.asset.json";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contatos", label: "Contatos", icon: Users },
  { to: "/demandas", label: "Demandas", icon: ClipboardList },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/status", label: "Status", icon: Activity },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-navy-800 text-white lg:flex">
      {/* Logo */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex w-full items-center justify-center rounded-xl bg-white px-3 py-4 shadow-sm">
          <img
            src={prodemLogo.url}
            alt="PRODEM — Tecnologia & Inovação"
            className="h-auto w-full max-w-[180px] object-contain"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-blue text-white shadow-[0_2px_8px_rgba(59,130,246,0.35)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
            MA
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Maria Andrade</div>
            <div className="truncate text-xs text-white/50">maria@gabinete.gov.br</div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Sair"
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
