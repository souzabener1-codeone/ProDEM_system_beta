import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  disable?: boolean;
};

interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  emptyIndicator?: React.ReactNode;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione…",
  emptyIndicator = "Nenhum resultado encontrado",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [internal, setInternal] = React.useState<string[]>(value ?? []);
  const selected = value ?? internal;
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const update = (next: string[]) => {
    if (onChange) onChange(next);
    else setInternal(next);
  };

  const toggle = (val: string) => {
    update(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  };

  const remove = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    update(selected.filter((v) => v !== val));
  };

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-[10px] border-0 bg-white px-3 py-1.5 text-left text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
      >
        <div className="flex flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selected.map((v) => {
              const opt = options.find((o) => o.value === v);
              if (!opt) return null;
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-blue-soft px-2 py-0.5 text-xs font-medium text-brand-blue-strong"
                >
                  {opt.label}
                  <button
                    type="button"
                    aria-label={`Remover ${opt.label}`}
                    onClick={(e) => remove(v, e)}
                    className="rounded-full hover:bg-white/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded-md border-0 bg-slate-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-400">{emptyIndicator}</li>
            )}
            {filtered.map((o) => {
              const isSel = selected.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    disabled={o.disable}
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50",
                      o.disable && "cursor-not-allowed opacity-50",
                      isSel && "bg-brand-blue-soft/40",
                    )}
                  >
                    <span>{o.label}</span>
                    {isSel && <Check className="h-4 w-4 text-brand-blue" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
