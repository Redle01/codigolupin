import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Target, CheckCircle } from "lucide-react";
import { ParticleBackground } from "./ParticleBackground";

interface QuizLoadingProps {
  onComplete: () => void;
}

const loadingSteps = [
  { icon: Brain, text: "Analisando suas respostas..." },
  { icon: Sparkles, text: "Identificando padrões de comportamento..." },
  { icon: Target, text: "Calculando seu perfil dominante..." },
  { icon: CheckCircle, text: "Preparando diagnóstico personalizado..." },
];

export function QuizLoading({ onComplete }: QuizLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 750; // 750ms per step
    const totalDuration = stepDuration * loadingSteps.length;
    
    // Progress bar animation
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

    // Step transitions
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    // Complete after all steps
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex items-center justify-center p-4 relative"
    >
      {/* Particle effects */}
      <ParticleBackground />

      <div className="w-full max-w-md text-center relative z-10">
        {/* Animated Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-gold rounded-full blur-xl opacity-40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Secondary burgundy glow */}
            <motion.div
              className="absolute inset-0 bg-burgundy rounded-full blur-2xl opacity-20"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <div className="relative bg-gradient-gold p-6 rounded-full shadow-gold-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentIcon className="w-12 h-12 text-background" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Loading Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-medium text-foreground mb-8"
          >
            {loadingSteps[currentStep].text}
          </motion.p>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="relative w-full h-2.5 bg-[hsl(350_30%_12%)] rounded-full overflow-hidden border border-[hsl(350_40%_20%)/0.3]">
          <motion.div
            className="h-full bg-gradient-lupin-progress relative overflow-hidden shadow-lupin-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(43_70%_75%)/0.4] to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-3 mt-6">
          {loadingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? "bg-primary shadow-gold" 
                  : "bg-muted-foreground/30"
              }`}
              animate={index === currentStep ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.6, repeat: index === currentStep ? Infinity : 0 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
