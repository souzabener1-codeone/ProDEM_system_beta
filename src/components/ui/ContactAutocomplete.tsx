import { useEffect, useRef, useState } from "react";
import { Search, X, Plus } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface ContactAutocompleteProps {
  options: AutocompleteOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  onCreateNew?: () => void;
  createNewLabel?: string;
  className?: string;
}

export function ContactAutocomplete({
  options,
  placeholder = "Buscar...",
  value: controlledValue,
  onChange,
  onSelect,
  onCreateNew,
  createNewLabel = "Cadastrar novo contato",
  className,
}: ContactAutocompleteProps) {
  const [internal, setInternal] = useState("");
  const value = controlledValue ?? internal;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setValue = (v: string) => {
    if (controlledValue === undefined) setInternal(v);
    onChange?.(v);
  };

  const filtered = value
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(value.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(value.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlight >= 0 && filtered[highlight]) {
      e.preventDefault();
      pick(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const pick = (o: AutocompleteOption) => {
    setValue(o.label);
    setOpen(false);
    onSelect?.(o);
  };

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          className="w-full rounded-[16px] border-0 bg-white py-2.5 pl-11 pr-10 text-sm font-[Onest] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Limpar"
            className="absolute right-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-2xl border border-border bg-white p-1 shadow-lg">
          {filtered.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pick(o)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-[Onest] transition-colors",
                highlight === i ? "bg-brand-blue-soft text-brand-blue-strong" : "text-foreground hover:bg-slate-50"
              )}
            >
              <span className="truncate font-medium">{o.label}</span>
              {o.sublabel && (
                <span className="shrink-0 text-xs text-muted-foreground">{o.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground shadow-lg">
          Nenhum resultado encontrado
        </div>
      )}
    </div>
  );
}
