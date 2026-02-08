import { useState, memo } from "react";
import { ChevronDown, ChevronUp, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultType } from "@/lib/quizConfig";

interface AdminNavPanelProps {
  currentStep: string;
  currentQuestion: number;
  currentResult: ResultType | null;
  onGoToStep: (step: "landing" | "questions" | "email" | "loading" | "result", questionIndex?: number) => void;
  onSetResult: (resultType: ResultType) => void;
  totalQuestions: number;
}

const steps = [
  { id: "landing", label: "Landing" },
  { id: "q1", label: "Q1", step: "questions", questionIndex: 0 },
  { id: "q2", label: "Q2", step: "questions", questionIndex: 1 },
  { id: "q3", label: "Q3", step: "questions", questionIndex: 2 },
  { id: "q4", label: "Q4", step: "questions", questionIndex: 3 },
  { id: "q5", label: "Q5", step: "questions", questionIndex: 4 },
  { id: "q6", label: "Q6", step: "questions", questionIndex: 5 },
  { id: "q7", label: "Q7", step: "questions", questionIndex: 6 },
  { id: "q8", label: "Q8", step: "questions", questionIndex: 7 },
  { id: "email", label: "Email" },
  { id: "loading", label: "Loading" },
  { id: "result", label: "Result" },
] as const;

const resultTypes: { id: ResultType; label: string }[] = [
  { id: "gentleman", label: "Gentleman" },
  { id: "estrategista", label: "Estrategista" },
  { id: "diamante", label: "Diamante" },
  { id: "guerreiro", label: "Guerreiro" },
];

export const AdminNavPanel = memo(function AdminNavPanel({
  currentStep,
  currentQuestion,
  currentResult,
  onGoToStep,
  onSetResult,
}: AdminNavPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors"
        title="Mostrar painel admin"
      >
        <Settings className="w-4 h-4" />
      </button>
    );
  }

  const getCurrentStepLabel = () => {
    if (currentStep === "questions") {
      return `Q${currentQuestion + 1}`;
    }
    return currentStep.charAt(0).toUpperCase() + currentStep.slice(1);
  };

  const handleStepClick = (step: typeof steps[number]) => {
    if (step.id === "landing") {
      onGoToStep("landing");
    } else if (step.id === "email") {
      onGoToStep("email");
    } else if (step.id === "loading") {
      onGoToStep("loading");
    } else if (step.id === "result") {
      onGoToStep("result");
    } else if ("questionIndex" in step) {
      onGoToStep("questions", step.questionIndex);
    }
  };

  const isCurrentStep = (step: typeof steps[number]) => {
    if (step.id === "landing" && currentStep === "landing") return true;
    if (step.id === "email" && currentStep === "email") return true;
    if (step.id === "loading" && currentStep === "loading") return true;
    if (step.id === "result" && currentStep === "result") return true;
    if ("questionIndex" in step && currentStep === "questions" && step.questionIndex === currentQuestion) {
      return true;
    }
    return false;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Admin Nav</span>
          <span className="text-xs text-muted-foreground">({getCurrentStepLabel()})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-primary/20 transition-colors text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Steps Navigation */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Etapas do Funil:</p>
            <div className="flex flex-wrap gap-1">
              {steps.map((step) => (
                <Button
                  key={step.id}
                  variant={isCurrentStep(step) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStepClick(step)}
                  className="h-7 px-2 text-xs"
                >
                  {step.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Result Profiles */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Ver Resultado como:</p>
            <div className="flex flex-wrap gap-1">
              {resultTypes.map((result) => (
                <Button
                  key={result.id}
                  variant={currentResult === result.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetResult(result.id)}
                  className="h-7 px-2 text-xs"
                >
                  {result.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground/70 text-center pt-2 border-t border-border">
            🔒 Painel visível apenas no ambiente Lovable
          </p>
        </div>
      )}
    </div>
  );
});
