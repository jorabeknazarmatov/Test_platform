// Group types
export interface Group {
  id: number;
  name: string;
  created_at?: string;
  students?: Student[];
}

// Student types
export interface Student {
  id: number;
  group_id: number;
  full_name: string;
  created_at?: string;
}

// Subject types
export interface Subject {
  id: number;
  name: string;
  created_at?: string;
}

// Topic types
export interface Topic {
  id: number;
  subject_id: number;
  topic_number: number;
  name: string;
  created_at?: string;
}

// Test types
export interface Test {
  id: number;
  name: string;
  subject_id: number;
  duration_minutes: number;
  topic_numbers?: number[];
  created_at?: string;
}

// Question types
export interface QuestionOption {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

// OTP types
export interface OTPResponse {
  session_id: number;
  otp: string;
  expires_at: string;
  success: boolean;
}

// Result types
export interface Result {
  id: number;
  student_id: number;
  test_id: number;
  correct_count: number;
  total_count: number;
  percentage: number;
  created_at?: string;
}

export interface TestResultResponse {
  correct_count: number;
  total_count: number;
  percentage: number;
  result_text: string;
}

// API Error Response
export interface ApiError {
  detail: string;
}

// Test Session
export interface TestSession {
  id: number;
  student_id: number;
  test_id: number;
  otp: string;
  started_at?: string;
  expires_at: string;
}
