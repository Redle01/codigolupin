import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md text-center">
        {/* Animated Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur-xl opacity-50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentIcon className="w-12 h-12 text-white" />
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
            className="text-xl font-medium text-white mb-8"
          >
            {loadingSteps[currentStep].text}
          </motion.p>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {loadingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index <= currentStep ? "bg-amber-500" : "bg-gray-600"
              }`}
              animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
