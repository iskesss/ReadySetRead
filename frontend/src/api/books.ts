import { api } from "./client";
import type { Book, AssignQuizRequest, Assignment } from "./types";

export async function getAllBooks(): Promise<Book[]> {
    const response = await api.get("/books")
    return response.data
}

export async function createAssignment(
    data: AssignQuizRequest
): Promise<Assignment> {
    const response = await api.post("/quiz/assign", data)
    return response.data
}