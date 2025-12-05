import { api } from "./client";
import type {
    GenerateQuizRequest,
    QuizResponse,
    UpdateQuizRequest,
    UpdateQuizResponse,
    UpdateQuizFeedbackRequest,
    UpdateQuizFeedbackResponse,
    GetQuizFeedbackRequest,
    QuizFeedbackResponse
} from './types'

// Generate a quiz
export async function generateQuiz(
    data: GenerateQuizRequest
): Promise<QuizResponse> {
    const response = await api.post<QuizResponse>("/quiz/generate", data);
    return response.data;
}

export async function updateQuiz(
    data: UpdateQuizRequest
): Promise<UpdateQuizResponse> {
    const response = await api.post<UpdateQuizResponse>("/quiz/update", data);
    return response.data;
}

export async function updateQuizFeedback(
    data: UpdateQuizFeedbackRequest
): Promise<UpdateQuizFeedbackResponse> {
    const response = await api.post<UpdateQuizFeedbackResponse>("/quiz/update-feedback", data);
    return response.data;
}

export async function getQuizFeedback(
    data: GetQuizFeedbackRequest
): Promise<QuizFeedbackResponse> {
    const response = await api.get<QuizFeedbackResponse>(`/quiz/${data.quiz_id}/feedback`);
    return response.data
}