import axios from 'axios';
import type {
  Group,
  Student,
  Subject,
  Topic,
  Test,
  Question,
  TestSession,
  Result,
  OTPResponse,
  GroupCreate,
  StudentCreate,
  SubjectCreate,
  TopicCreate,
  TestCreate,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API
export const adminApi = {
  // Gruppalar
  createGroup: (data: GroupCreate, login: string, password: string) =>
    api.post<Group>(`/api/admin/groups?login=${login}&password=${password}`, data),

  getGroups: (login: string, password: string) =>
    api.get<Group[]>(`/api/admin/groups?login=${login}&password=${password}`),

  updateGroup: (groupId: number, data: GroupCreate, login: string, password: string) =>
    api.put<Group>(`/api/admin/groups/${groupId}?login=${login}&password=${password}`, data),

  deleteGroup: (groupId: number, login: string, password: string) =>
    api.delete(`/api/admin/groups/${groupId}?login=${login}&password=${password}`),

  importGroups: (file: File, login: string, password: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/admin/import-groups?login=${login}&password=${password}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // O'quvchilar
  createStudent: (data: StudentCreate, login: string, password: string) =>
    api.post<Student>(`/api/admin/students?login=${login}&password=${password}`, data),

  getStudentsByGroup: (groupId: number, login: string, password: string) =>
    api.get<Student[]>(`/api/admin/groups/${groupId}/students?login=${login}&password=${password}`),

  updateStudent: (studentId: number, data: StudentCreate, login: string, password: string) =>
    api.put<Student>(`/api/admin/students/${studentId}?login=${login}&password=${password}`, data),

  deleteStudent: (studentId: number, login: string, password: string) =>
    api.delete(`/api/admin/students/${studentId}?login=${login}&password=${password}`),

  // Fanlar
  createSubject: (data: SubjectCreate, login: string, password: string) =>
    api.post<Subject>(`/api/admin/subjects?login=${login}&password=${password}`, data),

  getSubjects: (login: string, password: string) =>
    api.get<Subject[]>(`/api/admin/subjects?login=${login}&password=${password}`),

  deleteSubject: (subjectId: number, login: string, password: string) =>
    api.delete(`/api/admin/subjects/${subjectId}?login=${login}&password=${password}`),

  // Mavzular
  createTopic: (data: TopicCreate, login: string, password: string) =>
    api.post<Topic>(`/api/admin/topics?login=${login}&password=${password}`, data),

  getTopicsBySubject: (subjectId: number, login: string, password: string) =>
    api.get<Topic[]>(`/api/admin/subjects/${subjectId}/topics?login=${login}&password=${password}`),

  deleteTopic: (topicId: number, login: string, password: string) =>
    api.delete(`/api/admin/topics/${topicId}?login=${login}&password=${password}`),

  // Testlar
  createTest: (data: TestCreate, login: string, password: string) =>
    api.post<Test>(`/api/admin/tests?login=${login}&password=${password}`, data),

  getTests: (login: string, password: string, subjectId?: number) =>
    api.get<Test[]>(`/api/admin/tests?login=${login}&password=${password}${subjectId ? `&subject_id=${subjectId}` : ''}`),

  deleteTest: (testId: number, login: string, password: string) =>
    api.delete(`/api/admin/tests/${testId}?login=${login}&password=${password}`),

  toggleTestStatus: (testId: number, login: string, password: string) =>
    api.patch(`/api/admin/tests/${testId}/toggle-status?login=${login}&password=${password}`),

  // OTP
  generateOTP: (studentId: number, testId: number, login: string, password: string) =>
    api.post<OTPResponse>(`/api/admin/generate-otp?student_id=${studentId}&test_id=${testId}&login=${login}&password=${password}`),

  generateOTPBatch: (groupId: number, testId: number, login: string, password: string) =>
    api.post(`/api/admin/generate-otp-batch?group_id=${groupId}&test_id=${testId}&login=${login}&password=${password}`),

  // Sessiyalar
  getSessions: (login: string, password: string) =>
    api.get(`/api/admin/sessions?login=${login}&password=${password}`),

  deleteSession: (sessionId: number, login: string, password: string) =>
    api.delete(`/api/admin/sessions/${sessionId}?login=${login}&password=${password}`),

  // Natijalar
  getResults: (login: string, password: string, studentId?: number, testId?: number) =>
    api.get(`/api/admin/results?login=${login}&password=${password}${studentId ? `&student_id=${studentId}` : ''}${testId ? `&test_id=${testId}` : ''}`),

  exportResults: (login: string, password: string) =>
    api.get(`/api/admin/export-results?login=${login}&password=${password}`, {
      responseType: 'blob',
    }),

  // Import testlar
  importTests: (file: File, login: string, password: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/admin/import-tests?login=${login}&password=${password}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Student API
export const studentApi = {
  getGroups: () => api.get<Group[]>('/api/student/groups'),

  getStudentsByGroup: (groupId: number) =>
    api.get<Student[]>(`/api/student/groups/${groupId}/students`),

  getSubjects: () => api.get<Subject[]>('/api/student/subjects'),
};

// Test API
export const testApi = {
  getSessionInfo: (sessionId: number) =>
    api.get<TestSession>(`/api/test/session/${sessionId}`),

  verifyOTP: (sessionId: number, otp: string) =>
    api.post(`/api/test/verify-otp?session_id=${sessionId}&otp=${otp}`),

  getQuestions: (sessionId: number) =>
    api.get<Question[]>(`/api/test/questions/${sessionId}`),

  submitAnswer: (sessionId: number, questionId: number, answer: string) =>
    api.post(`/api/test/submit-answer?session_id=${sessionId}&question_id=${questionId}&answer=${answer}`),

  finishTest: (sessionId: number) =>
    api.post<Result>(`/api/test/finish-test/${sessionId}`),

  getResult: (sessionId: number) =>
    api.get<Result>(`/api/test/result/${sessionId}`),
};

export default api;
