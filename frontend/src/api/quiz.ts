import { api } from "./client";
import type { GenerateQuizRequest, QuizResponse } from './types'

// Generate a quiz
export async function generateQuiz(
    data: GenerateQuizRequest
): Promise<QuizResponse> {
    const response = await api.post<QuizResponse>("/quiz/generate", data);
    return response.data;
}