import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SimpleOption = { value: string; label: string; disabled?: boolean };

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: SimpleOption[];
  placeholder?: string;
  id?: string;
};

export function SimpleSelect({ value, onValueChange, options, placeholder, id }: Props) {
  return (
    <Select value={value || undefined} onValueChange={(val) => val && onValueChange(val)}>
      <SelectTrigger
        id={id}
        className="w-full !h-11 rounded-[16px] border-slate-200 bg-slate-50/50 px-4 font-sans text-sm text-foreground focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 justify-start [&>span]:text-left data-[placeholder]:text-slate-400"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-[16px]">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className="rounded-lg font-sans text-sm"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
