import { create } from 'zustand';
import type { Question } from '../types';

interface Answer {
  question_id: number;
  answer: string;
}

interface TestState {
  sessionId: number | null;
  testId: number | null;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  isTestActive: boolean;

  setSession: (sessionId: number, testId: number) => void;
  setQuestions: (questions: Question[]) => void;
  submitAnswer: (questionId: number, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  startTest: () => void;
  endTest: () => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  sessionId: null,
  testId: null,
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isTestActive: false,

  setSession: (sessionId, testId) => set({ sessionId, testId }),

  setQuestions: (questions) => set({ questions }),

  submitAnswer: (questionId, answer) => {
    const { answers } = get();
    const existingIndex = answers.findIndex((a) => a.question_id === questionId);

    if (existingIndex >= 0) {
      // Update existing answer
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { question_id: questionId, answer };
      set({ answers: newAnswers });
    } else {
      // Add new answer
      set({ answers: [...answers, { question_id: questionId, answer }] });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  decrementTime: () => {
    const { timeRemaining } = get();
    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  startTest: () => set({ isTestActive: true }),

  endTest: () => set({ isTestActive: false }),

  reset: () => set({
    sessionId: null,
    testId: null,
    questions: [],
    answers: [],
    currentQuestionIndex: 0,
    timeRemaining: 0,
    isTestActive: false,
  }),
}));
