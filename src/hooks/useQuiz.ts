import { useState, useCallback, useEffect } from "react";
import { quizQuestions, quizResults, ResultType, quizConfig } from "@/lib/quizConfig";
import { getOrCreateVisitorId } from "./useFunnelMetrics";
import { useMetaPixel } from "./useMetaPixel";

// Lazy load Supabase only when needed (saves ~30KB from initial bundle)
const getSupabase = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
};

export interface QuizState {
  currentStep: "landing" | "questions" | "email" | "loading" | "result";
  currentQuestion: number;
  answers: Record<number, string>;
  email: string;
  result: ResultType | null;
  isSubmitting: boolean;
  offerFlow: 1 | 2 | null; // Fluxo de oferta baseado na Q7
}

const getInitialState = (): QuizState => ({
  currentStep: "landing",
  currentQuestion: 0,
  answers: {},
  email: "",
  result: null,
  isSubmitting: false,
  offerFlow: null,
});

// Calcula o fluxo de oferta baseado na resposta da Questão 7
function getOfferFlow(answers: Record<number, string>): 1 | 2 | null {
  const question7Answer = answers[6]; // Q7 está no índice 6 (0-indexed)
  if (!question7Answer) return null;
  
  const flowMapping = quizConfig.question7FlowMapping;
  return flowMapping[question7Answer as keyof typeof flowMapping] || null;
}

const QUIZ_STATE_STORAGE_KEY = "quiz_user_state";
const SESSION_ACTIVE_KEY = "quiz_session_active";

export function useQuiz() {
  const { trackChegouCheckout } = useMetaPixel();
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window !== "undefined") {
      // Check if this is a page refresh (session still active) or a new entry
      const isSessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
      
      if (isSessionActive) {
        // This is a page refresh - restore state from localStorage
        const stored = localStorage.getItem(QUIZ_STATE_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            return {
              ...parsed,
              isSubmitting: false, // Always reset submitting state
              offerFlow: parsed.offerFlow || null, // Preserve offerFlow
            };
          } catch {
            // If parsing fails, use default state
          }
        }
      } else {
        // This is a new entry - clear any previous state and start fresh
        localStorage.removeItem(QUIZ_STATE_STORAGE_KEY);
      }
      
      // Mark session as active for refresh detection
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
      offerFlow: state.offerFlow,
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
      
      // Calcular offerFlow após responder Q7 (índice 6)
      let offerFlow = prev.offerFlow;
      if (questionId === 6) { // Q7 respondida
        offerFlow = getOfferFlow(newAnswers);
      }
      
      // After question 6 (index 5), show email capture
      if (nextQuestion === 6) {
        return { ...prev, answers: newAnswers, offerFlow, currentStep: "email" };
      }
      
      // If all questions answered, show loading then result
      if (nextQuestion >= quizQuestions.length) {
        const result = calculateResult(newAnswers);
        return { ...prev, answers: newAnswers, offerFlow, result, currentStep: "loading" };
      }
      
      return { ...prev, answers: newAnswers, offerFlow, currentQuestion: nextQuestion };
    });
  }, []);

  const completeLoading = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: "result" }));
  }, []);

  const continueAfterEmail = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: "questions", currentQuestion: 6 }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestion > 0) {
        return { ...prev, currentQuestion: prev.currentQuestion - 1 };
      }
      if (prev.currentStep === "questions" && prev.currentQuestion === 0) {
        return { ...prev, currentStep: "landing" };
      }
      return prev;
    });
  }, []);

  const setEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email }));
  }, []);

  const submitEmail = useCallback(async () => {
    if (!state.email) return false;
    
    setState((prev) => ({ ...prev, isSubmitting: true }));
    
    try {
      const visitorId = getOrCreateVisitorId();
      const supabase = await getSupabase();
      
      const { error } = await supabase.functions.invoke("quiz-submit-email", {
        body: {
          email: state.email,
          visitor_id: visitorId,
          answers: state.answers,
          offer_flow: state.offerFlow,
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
      return true; // Continue anyway
    }
  }, [state.email, state.answers, state.offerFlow]);

  // Update result type after quiz completion
  const updateResultType = useCallback(async () => {
    if (!state.email || !state.result) return;
    
    try {
      const visitorId = getOrCreateVisitorId();
      const supabase = await getSupabase();
      
      // Update the lead with result type and offer flow
      await supabase.functions.invoke("quiz-submit-email", {
        body: {
          email: state.email,
          visitor_id: visitorId,
          result_type: state.result,
          answers: state.answers,
          offer_flow: state.offerFlow,
        },
      });
    } catch (error) {
      console.error("Error updating result type:", error);
    }
  }, [state.email, state.result, state.answers, state.offerFlow]);

  // Call updateResultType when result is calculated
  useEffect(() => {
    if (state.result && state.email) {
      updateResultType();
    }
  }, [state.result, state.email, updateResultType]);

  const redirectToCheckout = useCallback(() => {
    // Determinar URL de checkout baseada no fluxo de oferta
    const flow = state.offerFlow || 1; // Default para fluxo 1
    const checkoutUrl = flow === 1 
      ? quizConfig.checkoutUrls.flow1 
      : quizConfig.checkoutUrls.flow2;
    
    if (!checkoutUrl) return;
    
    // Allowlist of permitted checkout domains
    const ALLOWED_CHECKOUT_DOMAINS = [
      'pay.hotmart.com',
      'app.hotmart.com',
      'checkout.hotmart.com',
      'checkout.ticto.app',
    ];
    
    try {
      const url = new URL(checkoutUrl);
      
      // Validate domain is in allowlist
      if (!ALLOWED_CHECKOUT_DOMAINS.includes(url.hostname)) {
        console.error('Invalid checkout domain:', url.hostname);
        return;
      }
      
      // Require HTTPS
      if (url.protocol !== 'https:') {
        console.error('Checkout URL must use HTTPS');
        return;
      }
      
      // Pré-preencher email
      if (state.email) {
        url.searchParams.set("email", state.email);
      }
      
      // Pré-preencher perfil
      if (state.result) {
        url.searchParams.set("profile", state.result);
      }
      
      // Adicionar UTM para rastreamento
      url.searchParams.set("utm_source", "quiz");
      url.searchParams.set("utm_medium", "funnel");
      url.searchParams.set("utm_campaign", `flow${flow}`);
      
      // Visitor ID para associar no webhook (rastreamento)
      const visitorId = getOrCreateVisitorId();
      url.searchParams.set("ref", visitorId);
      
      // Disparar eventos do Meta Pixel ANTES do redirect (assíncrono, não bloqueia)
      // 1. Custom event: Chegou no Checkout
      trackChegouCheckout({
        result_type: state.result || undefined,
        offer_flow: flow,
      });
      
      // Pequeno delay para garantir que os eventos sejam enviados antes do redirect
      setTimeout(() => {
        window.location.href = url.toString();
      }, 100);
    } catch (error) {
      console.error('Invalid checkout URL:', error);
    }
  }, [state.email, state.result, state.offerFlow, trackChegouCheckout]);

  return {
    state,
    startQuiz,
    answerQuestion,
    completeLoading,
    continueAfterEmail,
    goBack,
    setEmail,
    submitEmail,
    redirectToCheckout,
    questions: quizQuestions,
    results: quizResults,
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
  
  // Find highest score
  const entries = Object.entries(scores) as [ResultType, number][];
  entries.sort((a, b) => b[1] - a[1]);
  
  return entries[0][0];
}
