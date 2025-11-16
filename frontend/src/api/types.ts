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

// Error Response Type
export interface ApiError {
  detail: string;
}
