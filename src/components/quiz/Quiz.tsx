import { useState, useEffect, useRef } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { useFunnelMetrics } from "@/hooks/useFunnelMetrics";
import { quizConfig } from "@/lib/quizConfig";
import { QuizLanding } from "./QuizLanding";
import { QuizQuestion } from "./QuizQuestion";
import { EmailCapture } from "./EmailCapture";
import { QuizResult } from "./QuizResult";
import { QuizConfig } from "./QuizConfig";

const STORAGE_KEY_CHECKOUT = "quiz_checkout_url";
const STORAGE_KEY_WEBHOOK = "quiz_webhook_url";
const VISIT_TRACKED_KEY = "quiz_visit_tracked";

// Detect if running inside Lovable editor (iframe)
const isLovableEditor = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't access, assume we're in an iframe
  }
};

export function Quiz() {
  const {
    state,
    startQuiz,
    answerQuestion,
    continueAfterEmail,
    goBack,
    setEmail,
    submitEmail,
    redirectToCheckout,
    questions,
    results,
  } = useQuiz();

  const { metrics, trackVisit, trackPageView, resetMetrics, getDropoffRate, getConversionRate } = useFunnelMetrics();
  const lastTrackedPage = useRef<string | null>(null);

  // Persisted config
  const [checkoutUrl, setCheckoutUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_CHECKOUT) || quizConfig.checkoutUrl;
    }
    return quizConfig.checkoutUrl;
  });

  const [webhookUrl, setWebhookUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_WEBHOOK) || quizConfig.webhookUrl;
    }
    return quizConfig.webhookUrl;
  });

  // Persist config changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHECKOUT, checkoutUrl);
  }, [checkoutUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WEBHOOK, webhookUrl);
  }, [webhookUrl]);

  // Track visit only once per session
  useEffect(() => {
    const visitTracked = sessionStorage.getItem(VISIT_TRACKED_KEY);
    if (!visitTracked) {
      trackVisit();
      sessionStorage.setItem(VISIT_TRACKED_KEY, "true");
    }
  }, [trackVisit]);

  // Track page views
  useEffect(() => {
    let currentPage: string;
    
    if (state.currentStep === "landing") {
      currentPage = "landing";
    } else if (state.currentStep === "questions") {
      currentPage = `question${state.currentQuestion + 1}`;
    } else if (state.currentStep === "email") {
      currentPage = "email";
    } else if (state.currentStep === "result") {
      currentPage = "result";
    } else {
      return;
    }

    // Only track if page changed
    if (lastTrackedPage.current !== currentPage) {
      trackPageView(currentPage as keyof typeof metrics.pageViews);
      lastTrackedPage.current = currentPage;
    }
  }, [state.currentStep, state.currentQuestion, trackPageView]);

  const handleEmailSubmit = async () => {
    return submitEmail(webhookUrl);
  };

  const handleCheckout = () => {
    redirectToCheckout(checkoutUrl);
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

      {state.currentStep === "result" && state.result && (
        <QuizResult
          result={results[state.result]}
          onCheckout={handleCheckout}
        />
      )}

      {/* Config panel - only visible inside Lovable editor */}
      {isLovableEditor() && (
        <QuizConfig
          checkoutUrl={checkoutUrl}
          webhookUrl={webhookUrl}
          onCheckoutUrlChange={setCheckoutUrl}
          onWebhookUrlChange={setWebhookUrl}
          metrics={metrics}
          onResetMetrics={resetMetrics}
          getDropoffRate={getDropoffRate}
          getConversionRate={getConversionRate}
        />
      )}
    </div>
  );
}
