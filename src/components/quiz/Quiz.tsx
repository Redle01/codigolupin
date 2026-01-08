import { useState, useEffect } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { quizConfig } from "@/lib/quizConfig";
import { QuizLanding } from "./QuizLanding";
import { QuizQuestion } from "./QuizQuestion";
import { EmailCapture } from "./EmailCapture";
import { QuizResult } from "./QuizResult";
import { QuizConfig } from "./QuizConfig";

const STORAGE_KEY_CHECKOUT = "quiz_checkout_url";
const STORAGE_KEY_WEBHOOK = "quiz_webhook_url";

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

      {/* Config panel */}
      <QuizConfig
        checkoutUrl={checkoutUrl}
        webhookUrl={webhookUrl}
        onCheckoutUrlChange={setCheckoutUrl}
        onWebhookUrlChange={setWebhookUrl}
      />
    </div>
  );
}
