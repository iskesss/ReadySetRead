import { api } from "./client";
import type {
    ParentSignupRequest,
    ParentLoginRequest,
    ParentResponse,
    TokenResponse,
    Child,
    Adult
} from "./types";

// Register / signup a new parent
export async function signupParent(
    data: ParentSignupRequest
): Promise<ParentResponse> {
    const response = await api.post<ParentResponse>("/adult/auth/signup", data);
    return response.data;
}

// Login as a parent and recieve a JWT token, set it in localstorage
export async function loginParent(
    data: ParentLoginRequest
): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/adult/auth/login", data);

    if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
    }

    return response.data;
}

// Get current parent's information
export async function getCurrentParent(): Promise<ParentResponse> {
    const response = await api.get<ParentResponse>("/adult/me");
    return response.data;
}

// Logout by deleting current
export function logoutParent(): void {
    localStorage.removeItem("token");
}

// Get the current parent's linked student accounts
export async function getStudents(): Promise<Child[]> {
    const parent = await getCurrentParent();
    const response = await api.get<Child[]>(`/adult/${parent.adult_email}/children`);
    return response.data;
}

// Get my (current user) info
export async function getMe(): Promise<Adult> {
    const response = await api.get<Adult>('adult/me');
    return response.data
}