import axiosInstance from './axios';
import type {
  TestSession,
  Question,
  TestResultResponse,
} from '../types';

const API_PREFIX = '/api/test';

export const testApi = {
  getSession: async (sessionId: number) => {
    const response = await axiosInstance.get<TestSession>(
      `${API_PREFIX}/session/${sessionId}`
    );
    return response.data;
  },

  verifyOTP: async (sessionId: number, otp: string) => {
    const response = await axiosInstance.post<{ success: boolean }>(
      `${API_PREFIX}/verify-otp?session_id=${sessionId}&otp=${otp}`
    );
    return response.data;
  },

  getQuestions: async (sessionId: number) => {
    const response = await axiosInstance.get<Question[]>(
      `${API_PREFIX}/questions/${sessionId}`
    );
    return response.data;
  },

  submitAnswer: async (
    sessionId: number,
    questionId: number,
    answer: string
  ) => {
    const response = await axiosInstance.post<{ success: boolean }>(
      `${API_PREFIX}/submit-answer?session_id=${sessionId}&question_id=${questionId}&answer=${answer}`
    );
    return response.data;
  },

  finishTest: async (sessionId: number) => {
    const response = await axiosInstance.post<{ success: boolean }>(
      `${API_PREFIX}/finish-test/${sessionId}`
    );
    return response.data;
  },

  getResult: async (sessionId: number) => {
    const response = await axiosInstance.get<TestResultResponse>(
      `${API_PREFIX}/result/${sessionId}`
    );
    return response.data;
  },
};
