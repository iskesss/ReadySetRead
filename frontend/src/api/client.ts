import axios, { AxiosHeaders } from "axios";

// Create api object with request info
const API =
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.DEV
        ? "http://localhost:8000"
        : "https://s22vebewzr.us-west-2.apprunner.com:443/v1");

export const api = axios.create({
    baseURL: API,
    withCredentials: false, //True if using cookies for auth
});

// attach api info as headers to all outgoing requests by updating the axios config object
api.interceptors.request.use((config) => {
    // Get token from localstorage
    const raw = localStorage.getItem("token");
    const token = raw && raw !== "null" && raw !== "undefined" ? raw : null;

    // Normalize to AxiosHeaders
    const headers =
        config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers || {});

    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/json");
    if (!headers.has("Content-Type") && config.data) {
        headers.set("Content-Type", "application/json");
    }

    config.headers = headers;

    return config;
});