// API Request Types
export interface ParentSignupRequest {
  adult_email: string;
  password: string;
  adult_name?: string;
}

export interface ParentLoginRequest {
  adult_email: string;
  password: string;
}

export interface StudentSignupRequest {
  child_name: string;
  password: string;
  adult_email: string;
}

export interface StudentLoginRequest {
  child_name: string;
  password: string;
}

export interface GenerateQuizRequest {
  book_title: string;
  author: string;
  reading_level: string;
  num_questions: number;
}

export interface studentListRequest {
  adult_email: string
}

export interface AssignQuizRequest {
  child_id: number
  book_id: number
}

// API Response Types
export interface ParentResponse {
  adult_email: string;
  adult_name: string | null;
}

export interface StudentResponse {
  child_id: number;
  child_name: string;
  num_coins: number;
  adult_email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[]
}

export interface Child {
  child_id: number;
  child_name: string;
  num_coins: number;
  adult_email: string;
}

export interface Adult {
  adult_email: string;
  adult_name: string;
}

export interface Book {
  book_id: string;
  title: string;
  reading_level: number;
  author: string;
}

export interface Assignment {
  quiz_id: number;
  child_id: number;
  book_id: number;
  attempted: boolean;
  passed: boolean;
  score: number;
  feedback: string;
  qna: string;
}

// Error Response Type
export interface ApiError {
  detail: string;
}
