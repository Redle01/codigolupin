import { useState, memo } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
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
    
    // Reduced delay for snappier transitions while keeping visual feedback
    setTimeout(() => {
      onAnswer(answerId);
      setJustSelected(null);
    }, 300);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen flex flex-col px-4 py-5 md:px-4 md:py-8">
        {/* Header with progress */}
        <div className="max-w-2xl mx-auto w-full mb-5 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5 md:w-5 md:h-5" />
              <span className="text-sm md:text-sm">Voltar</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 md:h-3 bg-[hsl(350_30%_12%)] rounded-full overflow-hidden border border-[hsl(350_40%_20%)/0.3]">
            <m.div
              className="h-full bg-gradient-lupin-progress relative overflow-hidden shadow-lupin-glow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
            >
              {/* Shimmer effect */}
              <m.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(0_70%_70%)/0.35] to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </m.div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-start md:justify-center max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <m.div
              key={questionNumber}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-foreground leading-relaxed">
                {question}
              </h2>

              {/* Options */}
              <div className="space-y-3 md:space-y-4">
                {options.map((option, index) => {
                  const isSelected = selectedAnswer === option.id || justSelected === option.id;
                  const isJustSelected = justSelected === option.id;
                  
                  return (
                    <m.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <m.div
                        whileTap={{ scale: 0.98 }}
                        animate={isJustSelected ? {
                          boxShadow: [
                            "0 0 0 0 hsl(0 80% 42% / 0)",
                            "0 0 0 12px hsl(0 80% 42% / 0.25)",
                            "0 0 0 0 hsl(0 80% 42% / 0)",
                          ],
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => handleAnswer(option.id)}
                          disabled={justSelected !== null}
                          className={`w-full flex items-center px-4 py-4 md:p-5 h-auto min-h-[4rem] md:min-h-[4rem] text-sm md:text-base border-2 transition-all duration-300 hover:border-primary hover:bg-primary/5 ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          }`}
                        >
                          <m.span 
                            className={`inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full font-bold shrink-0 text-sm md:text-sm mr-3 md:mr-3 transition-all duration-300 ${
                              isSelected 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                            }`}
                            animate={isJustSelected ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {isJustSelected ? (
                              <m.span
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.3, type: "spring" }}
                              >
                                <Check className="w-4 h-4" />
                              </m.span>
                            ) : (
                              option.id.toUpperCase()
                            )}
                          </m.span>
                          <span className="flex-1 text-foreground text-left whitespace-normal break-words leading-relaxed">
                            {option.text}
                          </span>
                        </Button>
                      </m.div>
                    </m.div>
                  );
                })}
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        {/* Time estimate */}
        <div className="text-center mt-5 md:mt-8">
          <p className="text-xs md:text-xs text-muted-foreground">
            ⏱️ ~{Math.ceil((totalQuestions - questionNumber + 1) * 0.25)} min restantes
          </p>
        </div>
      </div>
    </LazyMotion>
  );
});
