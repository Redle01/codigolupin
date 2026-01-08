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
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Header with progress */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </button>
          <span className="text-sm text-muted-foreground">
            Pergunta {questionNumber} de {totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={questionNumber}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
              {question}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => onAnswer(option.id)}
                    className={`w-full text-left justify-start p-6 h-auto text-base border-2 transition-all duration-300 hover:border-primary hover:bg-primary/5 ${
                      selectedAnswer === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold mr-4 shrink-0">
                      {option.id.toUpperCase()}
                    </span>
                    <span className="text-foreground">{option.text}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Time estimate */}
      <div className="text-center mt-8">
        <p className="text-xs text-muted-foreground">
          ⏱️ Tempo restante: ~{Math.ceil((totalQuestions - questionNumber + 1) * 0.25)} min
        </p>
      </div>
    </div>
  );
}
