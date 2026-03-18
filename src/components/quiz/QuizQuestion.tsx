import { useState, memo } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: { id: string; text: string }[];
  onAnswer: (answerId: string) => void;
  onBack: () => void;
  selectedAnswer?: string;
}

export const QuizQuestion = memo(function QuizQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  onAnswer,
  onBack,
  selectedAnswer,
}: QuizQuestionProps) {
  const progress = ((questionNumber) / totalQuestions) * 100;
  const [justSelected, setJustSelected] = useState<string | null>(null);

  const handleAnswer = (answerId: string) => {
    setJustSelected(answerId);
    
    setTimeout(() => {
      onAnswer(answerId);
      setJustSelected(null);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-5 md:px-4 md:py-8">
      {/* Header with progress */}
      <div className="max-w-2xl mx-auto w-full mb-5 md:mb-8">
        {questionNumber > 1 && (
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5 md:w-5 md:h-5" />
              <span className="text-sm md:text-sm">Voltar</span>
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="relative h-2.5 md:h-3 bg-[hsl(350_30%_12%)] rounded-full overflow-hidden border border-[hsl(350_40%_20%)/0.3]">
          <div
            className="h-full bg-gradient-lupin-progress relative overflow-hidden shadow-lupin-glow"
            style={{ width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(0_70%_70%)/0.35] to-transparent animate-shimmer"
              style={{ animation: 'shimmer 2s linear infinite' }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center max-w-2xl mx-auto w-full">
        <div
          key={questionNumber}
          className="w-full animate-fade-in"
          style={{ animationDuration: '0.3s', animationFillMode: 'both' }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-foreground leading-relaxed">
            {question}
          </h2>

          {/* Options */}
          <div className="space-y-3 md:space-y-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option.id || justSelected === option.id;
              const isJustSelected = justSelected === option.id;
              
              return (
                <div
                  key={option.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}
                >
                  <Button
                    variant="outline"
                    onClick={() => handleAnswer(option.id)}
                    disabled={justSelected !== null}
                    className={`w-full flex items-center px-4 py-4 md:p-5 h-auto min-h-[4rem] md:min-h-[4rem] text-base md:text-base border-2 transition-all duration-300 hover:border-primary hover:bg-primary/5 active:scale-[0.98] ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span 
                      className={`inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full font-bold shrink-0 text-sm md:text-sm mr-3 md:mr-3 transition-all duration-300 ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isJustSelected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        option.id.toUpperCase()
                      )}
                    </span>
                    <span className="flex-1 text-foreground text-left whitespace-normal break-words leading-relaxed">
                      {option.text}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time estimate */}
      <div className="text-center mt-5 md:mt-8">
        <p className="text-xs md:text-xs text-muted-foreground">
          ⏱️ ~{Math.ceil((totalQuestions - questionNumber + 1) * 0.25)} min restantes
        </p>
      </div>
    </div>
  );
});
