import type { LucideIcon } from "@/components/icons";

type Tone = "blue" | "orange" | "green" | "red" | "purple" | "navy";

interface KPICardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  tone?: Tone;
  compact?: boolean;
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

export function KPICard({ icon: Icon, value, label, tone = "blue", compact = false }: KPICardProps) {
  const t = toneMap[tone];
  return (
    <div
      className={`rounded-2xl border shadow-[0_1px_3px_rgba(15,30,61,0.05)] transition-shadow hover:shadow-[0_4px_12px_rgba(15,30,61,0.08)] ${
        compact ? "p-3.5" : "p-5"
      } ${t.card}`}
    >
      <div
        className={`flex items-center justify-center rounded-full ${t.icon} ${
          compact ? "mb-2 h-8 w-8" : "mb-4 h-10 w-10"
        }`}
      >
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.2} />
      </div>
      <div className={`font-bold leading-none ${t.number} ${compact ? "text-2xl" : "text-3xl"}`}>{value}</div>
      <div className={`mt-1.5 font-medium text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>{label}</div>
    </div>
  );
}
