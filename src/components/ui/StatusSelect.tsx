import { CircleIcon } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StatusOption = {
  value: string;
  label: string;
  color: string;
};

export const demandaStatuses: StatusOption[] = [
  { value: "Pendente", label: "Pendente", color: "text-amber-400 fill-amber-400" },
  { value: "Em Andamento", label: "Em Andamento", color: "text-blue-500 fill-blue-500" },
  { value: "Aguardando Retorno", label: "Aguardando Retorno", color: "text-violet-500 fill-violet-500" },
  { value: "Concluída", label: "Concluída", color: "text-teal-600 fill-teal-600" },
  { value: "Cancelada", label: "Cancelada", color: "text-red-500 fill-red-500" },
  { value: "Não atendido", label: "Não atendido", color: "text-slate-700 fill-slate-700" },
];

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options?: StatusOption[];
  placeholder?: string;
  id?: string;
};

export function StatusSelect({
  value,
  onValueChange,
  options = demandaStatuses,
  placeholder = "Selecione o status",
  id,
}: Props) {
  const selected = options.find((s) => s.value === value);

  return (
    <Select value={value || undefined} onValueChange={(val) => val && onValueChange(val)}>
      <SelectTrigger
        id={id}
        className="w-full !h-11 rounded-[16px] border-slate-200 bg-slate-50/50 px-4 text-sm text-foreground focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:text-left justify-start"
      >
        <SelectValue placeholder={placeholder}>
          {selected && (
            <span className="flex items-center gap-2">
              <CircleIcon className={`size-2.5 shrink-0 ${selected.color}`} aria-hidden />
              {selected.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-[16px]">
        {options.map((status) => (
          <SelectItem key={status.value} value={status.value} className="rounded-lg">
            <span className="flex items-center gap-2">
              <CircleIcon className={`size-2.5 shrink-0 ${status.color}`} aria-hidden />
              {status.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
