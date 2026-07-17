import {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
} from "@/components/ui/stepper";

export type MovimentacaoStep = {
  id: string;
  title: string;
  author?: string;
  date?: string;
  note?: string;
};

const defaultSteps: MovimentacaoStep[] = [
  {
    id: "criacao",
    title: "Criação",
    author: "jhiovana alcantara",
    date: "28/04/2026, 13:41",
    note: 'Demanda criada com status "Em Progresso"',
  },
  {
    id: "em-progresso",
    title: "Em Progresso",
    author: "jhiovana alcantara",
    date: "05/05/2026, 12:33",
    note: "Título alterado",
  },
  {
    id: "aguardando-retorno",
    title: "Aguardando Retorno",
    note: "Aguardando retorno do responsável",
  },
  {
    id: "concluida",
    title: "Concluída",
    note: "Demanda finalizada",
  },
];

interface MovimentacaoStepperProps {
  currentStepId?: string;
  steps?: MovimentacaoStep[];
}

export function MovimentacaoStepper({
  currentStepId = "em-progresso",
  steps = defaultSteps,
}: MovimentacaoStepperProps) {
  const stepDefs = steps.map((s) => ({ id: s.id, title: s.title }));

  return (
    <Stepper
      steps={stepDefs}
      orientation="vertical"
      responsive
      value={currentStepId}
    >
      <StepperNav>
        {steps.map((step, index) => (
          <StepperItem key={step.id} stepId={step.id} className="w-full">
            <StepperTrigger asChild className="w-full items-start">
              <div className="flex w-full items-start gap-3">
                <StepperIndicator>{index + 1}</StepperIndicator>
                <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StepperTitle>{step.title}</StepperTitle>
                      {step.author && (
                        <span className="text-sm text-slate-600">
                          — {step.author}
                        </span>
                      )}
                    </div>
                    {step.date && (
                      <span className="text-sm text-slate-500">{step.date}</span>
                    )}
                  </div>
                  {step.note && (
                    <StepperDescription>{step.note}</StepperDescription>
                  )}
                </div>
              </div>
            </StepperTrigger>
            {index < steps.length - 1 && <StepperSeparator />}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  );
}
