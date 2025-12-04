// API Response types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  detail?: any;
}

// Models
export interface Group {
  id: number;
  name: string;
  created_at?: string;
  students?: Student[];
}

export interface Student {
  id: number;
  group_id: number;
  full_name: string;
  created_at?: string;
  group?: Group;
}

export interface Subject {
  id: number;
  name: string;
  created_at?: string;
}

export interface Topic {
  id: number;
  subject_id: number;
  topic_number: number;
  name: string;
  created_at?: string;
}

export interface Test {
  id: number;
  name: string;
  subject_id: number;
  duration_minutes: number;
  created_at?: string;
  topic_numbers?: number[];
  subject?: Subject;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  text: string;
}

export interface TestSession {
  id: number;
  student_id: number;
  test_id: number;
  otp: string;
  status: 'active' | 'completed' | 'expired' | 'blocked';
  otp_attempts: number;
  blocked_until?: string;
  expires_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface Result {
  id: number;
  student_id: number;
  test_id: number;
  correct_count: number;
  total_count: number;
  percentage: number;
  created_at?: string;
}

// Request types
export interface LoginRequest {
  login: string;
  password: string;
}

export interface OTPRequest {
  session_id: number;
  otp: string;
}

export interface SubmitAnswerRequest {
  session_id: number;
  question_id: number;
  answer: string;
}

// Response types
export interface OTPResponse {
  session_id: number;
  otp: string;
  expires_at: string;
  success: boolean;
}

export interface TestQuestionsResponse {
  questions: Question[];
}

export interface TestResultResponse {
  correct_count: number;
  total_count: number;
  percentage: number;
  result_text: string;
}
