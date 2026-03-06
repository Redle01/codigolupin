import { useState, useCallback, useEffect, useMemo } from "react";
import { quizQuestions, quizResults, ResultType, quizConfig } from "@/lib/quizConfig";
import { getOrCreateVisitorId } from "./useFunnelMetrics";
import { useMetaPixel } from "./useMetaPixel";
import { isInternalAccess } from "@/lib/environment";

// Lazy load Supabase only when needed (saves ~30KB from initial bundle)
const getSupabase = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
};

export interface QuizState {
  currentStep: "questions" | "email" | "loading" | "result";
  currentQuestion: number;
  answers: Record<number, string>;
  email: string;
  result: ResultType | null;
  isSubmitting: boolean;
}

const getInitialState = (): QuizState => ({
  currentStep: "questions",
  currentQuestion: 0,
  answers: {},
  email: "",
  result: null,
  isSubmitting: false,
});

const QUIZ_STATE_STORAGE_KEY = "quiz_user_state";
const SESSION_ACTIVE_KEY = "quiz_session_active";

export function useQuiz() {
  const { trackChegouCheckout } = useMetaPixel();
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window !== "undefined") {
      const isSessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
      
      if (isSessionActive) {
        const stored = localStorage.getItem(QUIZ_STATE_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            return {
              ...parsed,
              isSubmitting: false,
            };
          } catch {
            // If parsing fails, use default state
          }
        }
      } else {
        localStorage.removeItem(QUIZ_STATE_STORAGE_KEY);
      }
      
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");
    }
    return getInitialState();
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const stateToStore = {
      currentStep: state.currentStep,
      currentQuestion: state.currentQuestion,
      answers: state.answers,
      email: state.email,
      result: state.result,
    };
    localStorage.setItem(QUIZ_STATE_STORAGE_KEY, JSON.stringify(stateToStore));
  }, [state.currentStep, state.currentQuestion, state.answers, state.email, state.result]);

  const startQuiz = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: "questions", currentQuestion: 0 }));
  }, []);

  const answerQuestion = useCallback((questionId: number, answerId: string) => {
    setState((prev) => {
      const newAnswers = { ...prev.answers, [questionId]: answerId };
      const nextQuestion = prev.currentQuestion + 1;
      
      if (nextQuestion >= quizQuestions.length) {
        const result = calculateResult(newAnswers);
        return { ...prev, answers: newAnswers, result, currentStep: "email" };
      }
      
      return { ...prev, answers: newAnswers, currentQuestion: nextQuestion };
    });
  }, []);

  const completeLoading = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: "result" }));
  }, []);

  const continueAfterEmail = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: "loading" }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep === "email") {
        return { ...prev, currentStep: "questions", currentQuestion: quizQuestions.length - 1 };
      }
      if (prev.currentQuestion > 0) {
        return { ...prev, currentQuestion: prev.currentQuestion - 1 };
      }
      return prev;
    });
  }, []);

  const setEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email }));
  }, []);

  const submitEmail = useCallback(async () => {
    if (!state.email) return false;
    
    if (isInternalAccess()) {
      console.debug("[Quiz] Skipping email submission in internal environment");
      return true;
    }
    
    setState((prev) => ({ ...prev, isSubmitting: true }));
    
    try {
      const visitorId = getOrCreateVisitorId();
      const supabase = await getSupabase();
      
      const { error } = await supabase.functions.invoke("quiz-submit-email", {
        body: {
          email: state.email,
          visitor_id: visitorId,
          answers: state.answers,
        },
      });

      if (error) {
        console.error("Error submitting email:", error);
      } else {
        console.log("Email submitted successfully");
      }
      
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return true;
    } catch (error) {
      console.error("Error submitting email:", error);
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return true;
    }
  }, [state.email, state.answers]);

  // Update result type after quiz completion
  const updateResultType = useCallback(async () => {
    if (!state.email || !state.result) return;
    
    if (isInternalAccess()) {
      console.debug("[Quiz] Skipping result type update in internal environment");
      return;
    }
    
    try {
      const visitorId = getOrCreateVisitorId();
      const supabase = await getSupabase();
      
      await supabase.functions.invoke("quiz-submit-email", {
        body: {
          email: state.email,
          visitor_id: visitorId,
          result_type: state.result,
          answers: state.answers,
        },
      });
    } catch (error) {
      console.error("Error updating result type:", error);
    }
  }, [state.email, state.result, state.answers]);

  useEffect(() => {
    if (state.result && state.email) {
      updateResultType();
    }
  }, [state.result, state.email, updateResultType]);

  const redirectToCheckout = useCallback(() => {
    const checkoutUrl = quizConfig.checkoutUrl;
    if (!checkoutUrl) return;
    
    const ALLOWED_CHECKOUT_DOMAINS = [
      'pay.hotmart.com',
      'app.hotmart.com',
      'checkout.hotmart.com',
      'checkout.ticto.app',
    ];
    
    try {
      const url = new URL(checkoutUrl);
      
      if (!ALLOWED_CHECKOUT_DOMAINS.includes(url.hostname)) {
        console.error('Invalid checkout domain:', url.hostname);
        return;
      }
      
      if (url.protocol !== 'https:') {
        console.error('Checkout URL must use HTTPS');
        return;
      }
      
      if (state.email) {
        url.searchParams.set("email", state.email);
      }
      
      if (state.result) {
        url.searchParams.set("profile", state.result);
      }
      
      url.searchParams.set("utm_source", "quiz");
      url.searchParams.set("utm_medium", "funnel");
      url.searchParams.set("utm_campaign", "quiz");
      
      const visitorId = getOrCreateVisitorId();
      url.searchParams.set("ref", visitorId);
      
      trackChegouCheckout({
        result_type: state.result || undefined,
      });
      
      setTimeout(() => {
        window.location.href = url.toString();
      }, 100);
    } catch (error) {
      console.error('Invalid checkout URL:', error);
    }
  }, [state.email, state.result, trackChegouCheckout]);

  // Admin-only navigation functions
  const goToStep = useCallback((step: QuizState["currentStep"], questionIndex?: number) => {
    if (!isInternalAccess()) return;
    
    setState((prev) => ({
      ...prev,
      currentStep: step,
      currentQuestion: questionIndex ?? prev.currentQuestion,
    }));
  }, []);

  const setResultDirect = useCallback((resultType: ResultType) => {
    if (!isInternalAccess()) return;
    
    setState((prev) => ({
      ...prev,
      result: resultType,
      currentStep: "result",
    }));
  }, []);

  const isInternal = useMemo(() => isInternalAccess(), []);

  return {
    state,
    answerQuestion,
    completeLoading,
    continueAfterEmail,
    goBack,
    setEmail,
    submitEmail,
    redirectToCheckout,
    questions: quizQuestions,
    results: quizResults,
    goToStep,
    setResultDirect,
    isInternal,
  };
}

function calculateResult(answers: Record<number, string>): ResultType {
  const scores = { gentleman: 0, estrategista: 0, diamante: 0, guerreiro: 0 };
  
  Object.entries(answers).forEach(([questionIdStr, answerId]) => {
    const questionId = parseInt(questionIdStr);
    const question = quizQuestions.find((q) => q.id === questionId + 1);
    if (question) {
      const option = question.options.find((o) => o.id === answerId);
      if (option) {
        scores.gentleman += option.points.gentleman;
        scores.estrategista += option.points.estrategista;
        scores.diamante += option.points.diamante;
        scores.guerreiro += option.points.guerreiro;
      }
    }
  });
  
  const entries = Object.entries(scores) as [ResultType, number][];
  entries.sort((a, b) => b[1] - a[1]);
  
  return entries[0][0];
}
