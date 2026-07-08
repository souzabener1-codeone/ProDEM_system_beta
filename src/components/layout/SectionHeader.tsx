import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
}

export function SectionHeader({ title, count, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-t-2xl bg-navy-800 px-5 py-3.5 text-white">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{title}</span>
        {typeof count === "number" && (
          <span className="text-sm font-medium text-white/50">({count})</span>
        )}
      </div>
      {action}
    </div>
  );
}
