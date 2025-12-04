import { api } from "./client";
import type { GenerateQuizRequest, QuizResponse, UpdateQuizRequest, UpdateQuizResponse } from './types'

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
    return response.data
}