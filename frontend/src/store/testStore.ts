import { create } from 'zustand';
import type { Question } from '../types';

interface Answer {
  questionId: number;
  answer: string;
}

interface TestState {
  sessionId: number | null;
  studentId: number | null;
  testId: number | null;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  timeRemaining: number;
  isTestActive: boolean;
  setSession: (sessionId: number, studentId: number, testId: number) => void;
  setQuestions: (questions: Question[]) => void;
  submitAnswer: (questionId: number, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  finishTest: () => void;
  resetTest: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  sessionId: null,
  studentId: null,
  testId: null,
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isTestActive: false,

  setSession: (sessionId, studentId, testId) =>
    set({ sessionId, studentId, testId, isTestActive: true }),

  setQuestions: (questions) => set({ questions }),

  submitAnswer: (questionId, answer) =>
    set((state) => {
      const existingIndex = state.answers.findIndex(
        (a) => a.questionId === questionId
      );
      if (existingIndex >= 0) {
        const newAnswers = [...state.answers];
        newAnswers[existingIndex] = { questionId, answer };
        return { answers: newAnswers };
      }
      return { answers: [...state.answers, { questionId, answer }] };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    })),

  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(state.timeRemaining - 1, 0),
    })),

  finishTest: () => set({ isTestActive: false }),

  resetTest: () =>
    set({
      sessionId: null,
      studentId: null,
      testId: null,
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isTestActive: false,
    }),
}));
