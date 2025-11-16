import { api } from "./client";
import type { StudentSignupRequest, StudentLoginRequest, StudentResponse, TokenResponse } from "./types";

// Register / Sign up a new student account
export async function signupStudent(
    data: StudentSignupRequest
): Promise<StudentResponse> {
    const response = await api.post<StudentResponse>("/child/auth/signup", data);
    return response.data;
}

// Login as a student and recieve a JWT token, set it in localstorage
export async function loginStudent(
    data: StudentLoginRequest
): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/child/auth/login", data);

    if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
    }

    return response.data;
}

// Get current student's information
export async function getCurrentStudent(): Promise<StudentResponse> {
    const response = await api.get<StudentResponse>("/child/me");
    return response.data;
}

// Log out by deleting the current token
export function logoutStudent(): void {
    localStorage.removeItem("token");
}