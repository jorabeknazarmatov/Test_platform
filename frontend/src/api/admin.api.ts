import axiosInstance from './axios';
import type { Group, Student, Subject, Topic, Test, Result, OTPResponse } from '../types';

const API_PREFIX = '/api/admin';

export const adminApi = {
  // Groups
  createGroup: async (name: string, login: string, password: string) => {
    const response = await axiosInstance.post<Group>(
      `${API_PREFIX}/groups?login=${login}&password=${password}`,
      { name }
    );
    return response.data;
  },

  getGroups: async (login: string, password: string) => {
    const response = await axiosInstance.get<Group[]>(
      `${API_PREFIX}/groups?login=${login}&password=${password}`
    );
    return response.data;
  },

  deleteGroup: async (groupId: number, login: string, password: string) => {
    const response = await axiosInstance.delete(
      `${API_PREFIX}/groups/${groupId}?login=${login}&password=${password}`
    );
    return response.data;
  },

  // Students
  createStudent: async (student: { group_id: number; full_name: string }, login: string, password: string) => {
    const response = await axiosInstance.post<Student>(
      `${API_PREFIX}/students?login=${login}&password=${password}`,
      student
    );
    return response.data;
  },

  getStudents: async (groupId: number, login: string, password: string) => {
    const response = await axiosInstance.get<Student[]>(
      `${API_PREFIX}/groups/${groupId}/students?login=${login}&password=${password}`
    );
    return response.data;
  },

  deleteStudent: async (studentId: number, login: string, password: string) => {
    const response = await axiosInstance.delete(
      `${API_PREFIX}/students/${studentId}?login=${login}&password=${password}`
    );
    return response.data;
  },

  // Subjects
  createSubject: async (name: string, login: string, password: string) => {
    const response = await axiosInstance.post<Subject>(
      `${API_PREFIX}/subjects?login=${login}&password=${password}`,
      { name }
    );
    return response.data;
  },

  getSubjects: async (login: string, password: string) => {
    const response = await axiosInstance.get<Subject[]>(
      `${API_PREFIX}/subjects?login=${login}&password=${password}`
    );
    return response.data;
  },

  // Topics
  createTopic: async (
    topic: { subject_id: number; topic_number: number; name: string },
    login: string,
    password: string
  ) => {
    const response = await axiosInstance.post<Topic>(
      `${API_PREFIX}/topics?login=${login}&password=${password}`,
      topic
    );
    return response.data;
  },

  getTopics: async (subjectId: number, login: string, password: string) => {
    const response = await axiosInstance.get<Topic[]>(
      `${API_PREFIX}/subjects/${subjectId}/topics?login=${login}&password=${password}`
    );
    return response.data;
  },

  // Tests
  createTest: async (
    test: { name: string; subject_id: number; duration_minutes: number; topic_numbers?: number[] },
    login: string,
    password: string
  ) => {
    const response = await axiosInstance.post<Test>(
      `${API_PREFIX}/tests?login=${login}&password=${password}`,
      test
    );
    return response.data;
  },

  getTests: async (login: string, password: string, subjectId?: number) => {
    let url = `${API_PREFIX}/tests?login=${login}&password=${password}`;
    if (subjectId) {
      url += `&subject_id=${subjectId}`;
    }
    const response = await axiosInstance.get<Test[]>(url);
    return response.data;
  },

  // OTP
  generateOTP: async (studentId: number, testId: number, login: string, password: string) => {
    const response = await axiosInstance.post<OTPResponse>(
      `${API_PREFIX}/generate-otp?student_id=${studentId}&test_id=${testId}&login=${login}&password=${password}`
    );
    return response.data;
  },

  // Results
  getResults: async (login: string, password: string, studentId?: number, testId?: number) => {
    let url = `${API_PREFIX}/results?login=${login}&password=${password}`;
    if (studentId) url += `&student_id=${studentId}`;
    if (testId) url += `&test_id=${testId}`;
    const response = await axiosInstance.get<Result[]>(url);
    return response.data;
  },

  // Export
  exportResults: async (login: string, password: string) => {
    const response = await axiosInstance.get(
      `${API_PREFIX}/export-results?login=${login}&password=${password}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Import
  importTests: async (file: File, login: string, password: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(
      `${API_PREFIX}/import-tests?login=${login}&password=${password}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
