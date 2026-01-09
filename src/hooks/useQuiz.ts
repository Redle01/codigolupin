import { useState, useCallback, useEffect } from "react";
import { quizQuestions, quizResults, ResultType, quizConfig } from "@/lib/quizConfig";

const QUIZ_STATE_STORAGE_KEY = "quiz_user_state";

export interface QuizState {
  currentStep: "landing" | "questions" | "email" | "result";
  currentQuestion: number;
  answers: Record<number, string>;
  email: string;
  result: ResultType | null;
  isSubmitting: boolean;
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>(() => {
    // Restore state from localStorage on initial load
    if (typeof window !== "undefined") {
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
    }
    return {
      currentStep: "landing",
      currentQuestion: 0,
      answers: {},
      email: "",
      result: null,
      isSubmitting: false,
    };
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
      
      // If all questions answered, calculate result
      if (nextQuestion >= quizQuestions.length) {
        const result = calculateResult(newAnswers);
        return { ...prev, answers: newAnswers, result, currentStep: "result" };
      }
      
      return { ...prev, answers: newAnswers, currentQuestion: nextQuestion };
    });
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

  const submitEmail = useCallback(async (webhookUrl: string) => {
    if (!state.email) return false;
    
    setState((prev) => ({ ...prev, isSubmitting: true }));
    
    try {
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            email: state.email,
            answers: state.answers,
            timestamp: new Date().toISOString(),
            source: "quiz-arsene-lupin",
          }),
        });
      }
      
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return true;
    } catch (error) {
      console.error("Webhook error:", error);
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return true; // Continue anyway
    }
  }, [state.email, state.answers]);

  const redirectToCheckout = useCallback((checkoutUrl: string) => {
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
