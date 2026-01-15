import { useEffect, useRef } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { useFunnelMetrics } from "@/hooks/useFunnelMetrics";
import { quizConfig } from "@/lib/quizConfig";
import { QuizLanding } from "./QuizLanding";
import { QuizQuestion } from "./QuizQuestion";
import { EmailCapture } from "./EmailCapture";
import { QuizLoading } from "./QuizLoading";
import { QuizResult } from "./QuizResult";

const VISIT_TRACKED_KEY = "quiz_visit_tracked";

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
      {state.currentStep === "landing" && (
        <QuizLanding
          onStart={startQuiz}
          totalParticipants={quizConfig.totalParticipants}
        />
      )}

      {state.currentStep === "questions" && (
        <QuizQuestion
          questionNumber={state.currentQuestion + 1}
          totalQuestions={questions.length}
          question={questions[state.currentQuestion].question}
          options={questions[state.currentQuestion].options}
          onAnswer={(answerId) => answerQuestion(state.currentQuestion, answerId)}
          onBack={goBack}
          selectedAnswer={state.answers[state.currentQuestion]}
        />
      )}

      {state.currentStep === "email" && (
        <EmailCapture
          email={state.email}
          onEmailChange={setEmail}
          onSubmit={handleEmailSubmit}
          onContinue={continueAfterEmail}
          isSubmitting={state.isSubmitting}
        />
      )}

      {state.currentStep === "loading" && (
        <QuizLoading onComplete={completeLoading} />
      )}

      {state.currentStep === "result" && state.result && (
        <QuizResult
          result={results[state.result]}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
