// Backend API bilan ishlash uchun TypeScript types

export interface Group {
  id: number;
  name: string;
  created_at?: string;
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
  subject_id: number;
  name: string;
  duration_minutes: number;
  created_at?: string;
  subject?: Subject;
  topics?: Topic[];
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
  status: 'waiting' | 'active' | 'completed' | 'expired' | 'blocked';
  otp_attempts: number;
  blocked_until?: string;
  expires_at?: string;
  started_at?: string;
}

export interface Result {
  correct_count: number;
  total_count: number;
  percentage: number;
  result_text?: string;
}

export interface OTPResponse {
  session_id: number;
  otp: string;
  expires_at: string;
  success: boolean;
}

// Form types
export interface GroupCreate {
  name: string;
}

export interface StudentCreate {
  group_id: number;
  full_name: string;
}

export interface SubjectCreate {
  name: string;
}

export interface TopicCreate {
  subject_id: number;
  topic_number: number;
  name: string;
}

export interface TestCreate {
  name: string;
  subject_id: number;
  duration_minutes: number;
  topic_numbers?: number[];
}

export interface AdminCredentials {
  login: string;
  password: string;
}
