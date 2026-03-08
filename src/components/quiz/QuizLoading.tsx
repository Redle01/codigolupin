import { useState, useEffect, memo } from "react";
import { Brain, Sparkles, Target, CheckCircle } from "lucide-react";

interface QuizLoadingProps {
  onComplete: () => void;
}

const loadingSteps = [
  { icon: Brain, text: "Analisando suas respostas..." },
  { icon: Sparkles, text: "Identificando padrões de comportamento..." },
  { icon: Target, text: "Calculando seu perfil dominante..." },
  { icon: CheckCircle, text: "Preparando diagnóstico personalizado..." },
];

export const QuizLoading = memo(function QuizLoading({ onComplete }: QuizLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 750;
    const totalDuration = stepDuration * loadingSteps.length;
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, totalDuration / 100);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, totalDuration + 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4 relative animate-fade-in"
      style={{ animationFillMode: 'both' }}
    >
      <div className="w-full max-w-md text-center relative z-10">
        {/* Animated Icon */}
        <div
          className="mb-8 flex justify-center animate-scale-in"
          style={{ animationDelay: '0s', animationFillMode: 'both' }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-gold rounded-full blur-xl opacity-40 animate-pulse" />
            {/* Secondary burgundy glow */}
            <div className="absolute inset-0 bg-burgundy rounded-full blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="relative bg-gradient-gold p-6 rounded-full shadow-gold-lg">
              <CurrentIcon className="w-12 h-12 text-background" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <p
          key={currentStep}
          className="text-xl font-medium text-foreground mb-8 animate-fade-in-up"
          style={{ animationDuration: '0.3s', animationFillMode: 'both' }}
        >
          {loadingSteps[currentStep].text}
        </p>

        {/* Progress Bar */}
        <div className="relative w-full h-2.5 bg-[hsl(350_30%_12%)] rounded-full overflow-hidden border border-[hsl(350_40%_20%)/0.3]">
          <div
            className="h-full bg-gradient-lupin-progress relative overflow-hidden shadow-lupin-glow"
            style={{ width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(0_70%_70%)/0.4] to-transparent"
              style={{ animation: 'shimmer 1.5s linear infinite' }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-3 mt-6">
          {loadingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? "bg-primary shadow-gold" 
                  : "bg-muted-foreground/30"
              } ${index === currentStep ? "animate-pulse scale-125" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
