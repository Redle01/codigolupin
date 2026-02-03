import { useEffect, useRef, lazy, Suspense, memo } from "react";
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
  const preloadedRef = useRef(false);
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

  // Preload next component during idle time
  useEffect(() => {
    if (state.currentStep === "landing" && !preloadedRef.current) {
      const preload = () => {
        import("./QuizQuestion");
        preloadedRef.current = true;
      };
      
      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback(preload, { timeout: 3000 });
      } else {
        setTimeout(preload, 1000);
      }
    }
  }, [state.currentStep]);

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
      // Disparar Meta Pixel PageView de forma assíncrona (não bloqueia)
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

  const handleEmailSubmit = async () => {
    return submitEmail();
  };

  const handleCheckout = () => {
    redirectToCheckout();
  };

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
