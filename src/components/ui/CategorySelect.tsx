import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CategoryOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export const demandaCategorias: CategoryOption[] = [
  { value: "Ofício", label: "Ofício" },
  { value: "Indicação", label: "Indicação" },
  { value: "Requerimento", label: "Requerimento" },
  { value: "Emenda", label: "Emenda" },
  { value: "Projeto de Lei", label: "Projeto de Lei" },
  { value: "Saúde/Exames", label: "Saúde/Exames" },
  { value: "Mensagem", label: "Mensagem" },
];

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options?: CategoryOption[];
  placeholder?: string;
  id?: string;
};

export function CategorySelect({
  value,
  onValueChange,
  options = demandaCategorias,
  placeholder = "Selecione uma categoria",
  id,
}: Props) {
  return (
    <Select value={value || undefined} onValueChange={(val) => val && onValueChange(val)}>
      <SelectTrigger
        id={id}
        className="w-full !h-11 rounded-[16px] border-slate-200 bg-slate-50/50 px-4 font-sans text-sm text-foreground focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 justify-start [&>span]:text-left data-[placeholder]:text-slate-400"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-[16px]">
        {options.map((cat) => (
          <SelectItem
            key={cat.value}
            value={cat.value}
            disabled={cat.disabled}
            className="rounded-lg font-sans text-sm"
          >
            {cat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
