import { useState, useCallback, useEffect } from "react";
import { quizQuestions, quizResults, ResultType, quizConfig } from "@/lib/quizConfig";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateVisitorId } from "./useFunnelMetrics";

const QUIZ_STATE_STORAGE_KEY = "quiz_user_state";
const SESSION_ACTIVE_KEY = "quiz_session_active";

export interface QuizState {
  currentStep: "landing" | "questions" | "email" | "loading" | "result";
  currentQuestion: number;
  answers: Record<number, string>;
  email: string;
  result: ResultType | null;
  isSubmitting: boolean;
}

const getInitialState = (): QuizState => ({
  currentStep: "landing",
  currentQuestion: 0,
  answers: {},
  email: "",
  result: null,
  isSubmitting: false,
});

export function useQuiz() {
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
      
      // After question 6 (index 5), show email capture
      if (nextQuestion === 6) {
        return { ...prev, answers: newAnswers, currentStep: "email" };
      }
      
      // If all questions answered, show loading then result
      if (nextQuestion >= quizQuestions.length) {
        const result = calculateResult(newAnswers);
        return { ...prev, answers: newAnswers, result, currentStep: "loading" };
      }
      
      return { ...prev, answers: newAnswers, currentQuestion: nextQuestion };
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
      return true; // Continue anyway
    }
  }, [state.email, state.answers]);

  // Update result type after quiz completion
  const updateResultType = useCallback(async () => {
    if (!state.email || !state.result) return;
    
    try {
      const visitorId = getOrCreateVisitorId();
      
      // Update the lead with result type
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

  // Call updateResultType when result is calculated
  useEffect(() => {
    if (state.result && state.email) {
      updateResultType();
    }
  }, [state.result, state.email, updateResultType]);

  const redirectToCheckout = useCallback(() => {
    const checkoutUrl = quizConfig.checkoutUrl;
    if (!checkoutUrl) return;
    
    const url = new URL(checkoutUrl);
    if (state.email) {
      url.searchParams.set("email", state.email);
    }
    if (state.result) {
      url.searchParams.set("profile", state.result);
    }
    window.location.href = url.toString();
  }, [state.email, state.result]);

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
