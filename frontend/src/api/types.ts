// =============================
// API Request Types
// =============================

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

export interface UpdateQuizRequest {
  quiz_id: number
  score: number
}

export interface UpdateQuizFeedbackRequest {
  quiz_id: number
  quiz_questions: QuizResponse
  child_responses: string[]
}

export interface GetQuizFeedbackRequest {
  quiz_id: number
}

export interface GetCoinsRequest {
  child_id: number
}

export interface CreateCustomRewardRequest {
  child_id: number
  description: string
  coin_cost: number
  adult_email: string
}

export interface ListCustomRewardsRequest {
  child_id: number
}

export interface RedeemCustomRewardRequest {
  child_id: number
  reward_id: number
}

export interface SpendCoinsRequest {
  coins_to_spend: number
}

export interface UpdateBackgroundSkinRequest {
  new_skin: string
}

// =============================
// API Response Types
// =============================

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

export interface Assignment { //Corresponds to QuizOut in backend
  quiz_id: number;
  child_id: number;
  book_id: number;
  attempted: boolean;
  passed: boolean;
  score: number;
  feedback: string;
  qna: string;
}

export interface UpdateQuizResponse {
  quiz_out: Assignment;
  coinsEarned: number;
}

export interface UpdateQuizFeedbackResponse {
  message: string;
}

export interface QuizFeedbackResponse {
  quiz_id: number;
  feedback: string;
}

export interface GetCoinsResponse {
  child_id: number
  num_coins: number
}

export interface CustomReward {
  reward_id: number
  child_id: number
  description: string
  coin_cost: number
  adult_email: string
}

export interface ListCustomRewardsResponse {
  custom_rewards: CustomReward[]
}

export interface RedeemCustomRewardResponse {
  success: boolean
  remaining_coins: number
  message: string
}

export interface SpendCoinsResponse {
  success: boolean
  remaining_coins: number
  message: string
}

export interface GetBackgroundSkinResponse {
  bg_skin: string
}

// Error Response Type
export interface ApiError {
  detail: string;
}
