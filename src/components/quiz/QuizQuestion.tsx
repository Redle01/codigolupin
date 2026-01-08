import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
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

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  onAnswer,
  onBack,
  selectedAnswer,
}: QuizQuestionProps) {
  const progress = ((questionNumber) / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex flex-col px-3 py-4 md:px-4 md:py-8">
      {/* Header with progress */}
      <div className="max-w-2xl mx-auto w-full mb-4 md:mb-8">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Voltar</span>
          </button>
          <span className="text-xs md:text-sm text-muted-foreground">
            {questionNumber}/{totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={questionNumber}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h2 className="font-serif-display text-lg md:text-3xl font-bold text-center mb-4 md:mb-10 text-foreground leading-tight">
              {question}
            </h2>

            {/* Options */}
            <div className="space-y-2 md:space-y-4">
              {options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => onAnswer(option.id)}
                    className={`w-full flex items-center px-3 py-3 md:p-5 h-auto min-h-[3.5rem] md:min-h-[4rem] text-xs md:text-base border-2 transition-all duration-300 hover:border-primary hover:bg-primary/5 ${
                      selectedAnswer === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-muted text-muted-foreground font-bold shrink-0 text-xs md:text-sm mr-2 md:mr-3">
                      {option.id.toUpperCase()}
                    </span>
                    <span className="flex-1 text-foreground text-left whitespace-normal break-words leading-snug">
                      {option.text}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Time estimate */}
      <div className="text-center mt-4 md:mt-8">
        <p className="text-[10px] md:text-xs text-muted-foreground">
          ⏱️ ~{Math.ceil((totalQuestions - questionNumber + 1) * 0.25)} min restantes
        </p>
      </div>
    </div>
  );
}
