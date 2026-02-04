import { useEffect, useRef, lazy, Suspense, memo, useCallback } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { useFunnelMetrics, getOrCreateVisitorId } from "@/hooks/useFunnelMetrics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { quizConfig } from "@/lib/quizConfig";
import { QuizLanding } from "./QuizLanding";

// Lazy load non-critical components
const QuizQuestion = lazy(() => 
  import("./QuizQuestion").then(m => ({ default: m.QuizQuestion }))
);
const EmailCapture = lazy(() => 
  import("./EmailCapture").then(m => ({ default: m.EmailCapture }))
);
const QuizLoading = lazy(() => 
  import("./QuizLoading").then(m => ({ default: m.QuizLoading }))
);
const QuizResult = lazy(() => 
  import("./QuizResult").then(m => ({ default: m.QuizResult }))
);

const VISIT_TRACKED_KEY = "quiz_visit_tracked";

// Minimal fallback to prevent white flash
const QuizFallback = memo(() => (
  <div className="min-h-screen bg-background" />
));
QuizFallback.displayName = "QuizFallback";

// Memoized landing component
const MemoizedQuizLanding = memo(QuizLanding);

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
  const { trackPageView: trackMetaPageView, setExternalId, initWithUser } = useMetaPixel();
  const lastTrackedPage = useRef<string | null>(null);
  const pixelInitializedRef = useRef(false);

  // Initialize Meta Pixel with visitor_id
  useEffect(() => {
    if (!pixelInitializedRef.current) {
      const visitorId = getOrCreateVisitorId();
      setExternalId(visitorId);
      pixelInitializedRef.current = true;
    }
  }, [setExternalId]);

  // Track initial visit
  useEffect(() => {
    const visitTracked = sessionStorage.getItem(VISIT_TRACKED_KEY);
    if (!visitTracked) {
      sessionStorage.setItem(VISIT_TRACKED_KEY, "true");
    }
  }, []);

  // Progressive preload based on current step
  useEffect(() => {
    const preloadNext = () => {
      if (state.currentStep === "landing") {
        // Preload QuizQuestion during idle on landing
        import("./QuizQuestion");
      } else if (state.currentStep === "questions") {
        // Preload EmailCapture when reaching Q5
        if (state.currentQuestion >= 4) {
          import("./EmailCapture");
        }
      } else if (state.currentStep === "email") {
        // Preload QuizLoading and QuizResult during email capture
        import("./QuizLoading");
        import("./QuizResult");
      }
    };

    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(preloadNext, { timeout: 2000 });
    } else {
      setTimeout(preloadNext, 500);
    }
  }, [state.currentStep, state.currentQuestion]);

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
      // Fire Meta Pixel PageView asynchronously (non-blocking)
      trackMetaPageView();
      lastTrackedPage.current = currentPage;
    }
  }, [state.currentStep, state.currentQuestion, trackPageView, trackMetaPageView]);

  // Update Meta Pixel with email when captured (Advanced Matching)
  useEffect(() => {
    if (state.email && pixelInitializedRef.current) {
      const visitorId = getOrCreateVisitorId();
      initWithUser({ visitorId, email: state.email });
    }
  }, [state.email, initWithUser]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleEmailSubmit = useCallback(async () => {
    return submitEmail();
  }, [submitEmail]);

  const handleCheckout = useCallback(() => {
    redirectToCheckout();
  }, [redirectToCheckout]);

  return (
    <div className="min-h-screen bg-background">
      {state.currentStep === "landing" && (
        <MemoizedQuizLanding
          onStart={startQuiz}
          totalParticipants={quizConfig.totalParticipants}
        />
      )}

      <Suspense fallback={<QuizFallback />}>
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
      </Suspense>
    </div>
  );
}
