import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuiz } from "@/hooks/useQuiz";
import { useFunnelMetrics } from "@/hooks/useFunnelMetrics";
import { quizConfig } from "@/lib/quizConfig";
import { QuizLanding } from "./QuizLanding";
import { QuizQuestion } from "./QuizQuestion";
import { EmailCapture } from "./EmailCapture";
import { QuizLoading } from "./QuizLoading";
import { QuizResult } from "./QuizResult";

const VISIT_TRACKED_KEY = "quiz_visit_tracked";

// Premium page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

export function Quiz() {
  const {
    state,
    startQuiz,
    answerQuestion,
    completeLoading,
    continueAfterEmail,
    goBack,
    setEmail,
    submitEmail,
    redirectToCheckout,
    questions,
    results,
  } = useQuiz();

  const { metrics, trackPageView } = useFunnelMetrics();
  const lastTrackedPage = useRef<string | null>(null);

  // Track initial visit
  useEffect(() => {
    const visitTracked = sessionStorage.getItem(VISIT_TRACKED_KEY);
    if (!visitTracked) {
      sessionStorage.setItem(VISIT_TRACKED_KEY, "true");
    }
  }, []);

  // Track page views - send to server on every step change
  useEffect(() => {
    let currentPage: string;
    
    if (state.currentStep === "landing") {
      currentPage = "landing";
    } else if (state.currentStep === "questions") {
      currentPage = `question${state.currentQuestion + 1}`;
    } else if (state.currentStep === "email") {
      currentPage = "email";
    } else if (state.currentStep === "loading") {
      return; // Don't track loading screen
    } else if (state.currentStep === "result") {
      currentPage = "result";
    } else {
      return;
    }

    // Only track if page changed
    if (currentPage !== lastTrackedPage.current) {
      trackPageView(currentPage as keyof typeof metrics.pageViews);
      lastTrackedPage.current = currentPage;
    }
  }, [state.currentStep, state.currentQuestion, trackPageView]);

  const handleEmailSubmit = async () => {
    return submitEmail();
  };

  const handleCheckout = () => {
    redirectToCheckout();
  };

  // Generate unique key for each step
  const getStepKey = () => {
    if (state.currentStep === "questions") {
      return `questions-${state.currentQuestion}`;
    }
    return state.currentStep;
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {state.currentStep === "landing" && (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <QuizLanding
              onStart={startQuiz}
              totalParticipants={quizConfig.totalParticipants}
            />
          </motion.div>
        )}

        {state.currentStep === "questions" && (
          <motion.div
            key={getStepKey()}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <QuizQuestion
              questionNumber={state.currentQuestion + 1}
              totalQuestions={questions.length}
              question={questions[state.currentQuestion].question}
              options={questions[state.currentQuestion].options}
              onAnswer={(answerId) => answerQuestion(state.currentQuestion, answerId)}
              onBack={goBack}
              selectedAnswer={state.answers[state.currentQuestion]}
            />
          </motion.div>
        )}

        {state.currentStep === "email" && (
          <motion.div
            key="email"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <EmailCapture
              email={state.email}
              onEmailChange={setEmail}
              onSubmit={handleEmailSubmit}
              onContinue={continueAfterEmail}
              isSubmitting={state.isSubmitting}
            />
          </motion.div>
        )}

        {state.currentStep === "loading" && (
          <motion.div
            key="loading"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <QuizLoading onComplete={completeLoading} />
          </motion.div>
        )}

        {state.currentStep === "result" && state.result && (
          <motion.div
            key="result"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <QuizResult
              result={results[state.result]}
              onCheckout={handleCheckout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
