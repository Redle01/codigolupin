import { useEffect, useRef, lazy, Suspense, memo, useCallback, useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { useFunnelMetrics, getOrCreateVisitorId } from "@/hooks/useFunnelMetrics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { QuizQuestion } from "./QuizQuestion";
const AdminNavPanel = lazy(() =>
  import("./AdminNavPanel").then(m => ({ default: m.AdminNavPanel }))
);

// Lazy load non-critical components
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

export function Quiz() {
  const {
    state,
    answerQuestion,
    completeLoading,
    continueAfterEmail,
    goBack,
    setEmail,
    submitEmail,
    redirectToCheckout,
    questions,
    results,
    goToStep,
    setResultDirect,
    isInternal,
  } = useQuiz();

  const { metrics, trackPageView } = useFunnelMetrics();
  const { trackPageView: trackMetaPageView, setExternalId, initWithUser } = useMetaPixel();
  const lastTrackedPage = useRef<string | null>(null);
  const pixelInitializedRef = useRef(false);

  // Defer tracking initialization until after first paint
  const [trackingReady, setTrackingReady] = useState(false);
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(() => setTrackingReady(true), { timeout: 3000 });
    } else {
      setTimeout(() => setTrackingReady(true), 1000);
    }
  }, []);

  // Initialize Meta Pixel with visitor_id (deferred, skip in internal environments)
  useEffect(() => {
    if (!trackingReady || isInternal) return;
    if (!pixelInitializedRef.current) {
      const visitorId = getOrCreateVisitorId();
      setExternalId(visitorId);
      pixelInitializedRef.current = true;
    }
  }, [trackingReady, setExternalId, isInternal]);

  // Track initial visit (deferred)
  useEffect(() => {
    if (!trackingReady) return;
    const visitTracked = sessionStorage.getItem(VISIT_TRACKED_KEY);
    if (!visitTracked) {
      sessionStorage.setItem(VISIT_TRACKED_KEY, "true");
    }
  }, [trackingReady]);

  // Progressive preload based on current step
  useEffect(() => {
    const preloadNext = () => {
      if (state.currentStep === "questions") {
        if (state.currentQuestion >= 4) {
          import("./EmailCapture");
        }
      } else if (state.currentStep === "email") {
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

  // Track page views (deferred)
  useEffect(() => {
    if (!trackingReady || isInternal) {
      if (isInternal) console.debug("[Quiz] Skipping tracking in internal environment");
      return;
    }

    let currentPage: string;
    if (state.currentStep === "questions") {
      currentPage = `question${state.currentQuestion + 1}`;
    } else if (state.currentStep === "email") {
      currentPage = "email";
    } else if (state.currentStep === "loading") {
      return;
    } else if (state.currentStep === "result") {
      currentPage = "result";
    } else {
      return;
    }

    if (currentPage !== lastTrackedPage.current) {
      trackPageView(currentPage as keyof typeof metrics.pageViews);
      trackMetaPageView();
      lastTrackedPage.current = currentPage;
    }
  }, [trackingReady, state.currentStep, state.currentQuestion, trackPageView, trackMetaPageView, isInternal, metrics.pageViews]);

  // Update Meta Pixel with email when captured
  useEffect(() => {
    if (state.email && pixelInitializedRef.current) {
      const visitorId = getOrCreateVisitorId();
      initWithUser({ visitorId, email: state.email });
    }
  }, [state.email, initWithUser]);

  const handleEmailSubmit = useCallback(async () => {
    return submitEmail();
  }, [submitEmail]);

  const handleCheckout = useCallback(() => {
    redirectToCheckout();
  }, [redirectToCheckout]);

  return (
    <div className="min-h-screen bg-background">
      {isInternal && (
        <Suspense fallback={null}>
          <AdminNavPanel
            currentStep={state.currentStep}
            currentQuestion={state.currentQuestion}
            currentResult={state.result}
            onGoToStep={goToStep}
            onSetResult={setResultDirect}
            totalQuestions={questions.length}
          />
        </Suspense>
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

      <Suspense fallback={<QuizFallback />}>
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
