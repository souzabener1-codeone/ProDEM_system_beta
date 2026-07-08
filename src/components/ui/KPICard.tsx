import type { LucideIcon } from "lucide-react";

type Tone = "blue" | "orange" | "green" | "red" | "purple" | "navy";

interface KPICardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  tone?: Tone;
}

const toneMap: Record<Tone, { card: string; icon: string; number: string }> = {
  blue: {
    card: "bg-brand-blue-soft border-brand-blue/15",
    icon: "bg-brand-blue text-white",
    number: "text-brand-blue-strong",
  },
  orange: {
    card: "bg-brand-orange-soft border-brand-orange/20",
    icon: "bg-brand-orange text-white",
    number: "text-brand-orange",
  },
  green: {
    card: "bg-success-soft border-success/20",
    icon: "bg-success text-white",
    number: "text-success",
  },
  red: {
    card: "bg-danger-soft border-danger/20",
    icon: "bg-danger text-white",
    number: "text-danger",
  },
  purple: {
    card: "bg-[#F5F3FF] border-waiting/20",
    icon: "bg-waiting text-white",
    number: "text-waiting",
  },
  navy: {
    card: "bg-slate-100 border-slate-200",
    icon: "bg-navy-800 text-white",
    number: "text-navy-800",
  },
};

export function KPICard({ icon: Icon, value, label, tone = "blue" }: KPICardProps) {
  const t = toneMap[tone];
  return (
    <div
      className={`rounded-2xl border p-5 shadow-[0_1px_3px_rgba(15,30,61,0.05)] transition-shadow hover:shadow-[0_4px_12px_rgba(15,30,61,0.08)] ${t.card}`}
    >
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${t.icon}`}>
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <div className={`text-3xl font-bold leading-none ${t.number}`}>{value}</div>
      <div className="mt-2 text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
