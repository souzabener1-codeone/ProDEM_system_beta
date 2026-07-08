import type { ReactNode } from "react";

type Variant =
  | "pending"
  | "in-progress"
  | "waiting"
  | "done"
  | "overdue"
  | "cancelled"
  | "priority-low"
  | "priority-medium"
  | "priority-high";

const variants: Record<Variant, string> = {
  pending: "bg-brand-orange-soft text-brand-orange",
  "in-progress": "bg-brand-blue-soft text-brand-blue-strong",
  waiting: "bg-[#F5F3FF] text-waiting",
  done: "bg-success-soft text-success",
  overdue: "bg-danger-soft text-danger",
  cancelled: "bg-slate-100 text-slate-600",
  "priority-low": "bg-slate-100 text-slate-600",
  "priority-medium": "bg-brand-blue-soft text-brand-blue-strong",
  "priority-high": "bg-danger-soft text-danger",
};

interface StatusBadgeProps {
  variant: Variant;
  children: ReactNode;
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
