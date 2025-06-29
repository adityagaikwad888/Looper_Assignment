import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on login page
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        window.location.href = "/login";
      }
    }

    // Log the error for debugging
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Types
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SignupResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Auth API functions
export async function authLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    // Re-throw with more specific error info
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "Login failed. Please check your connection and try again."
    );
  }
}

export async function authSignup(
  name: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  try {
    const response = await api.post<SignupResponse>("/auth/signup", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    // Re-throw with more specific error info
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "Signup failed. Please check your information and try again."
    );
  }
}

export async function authLogout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function authGetProfile(): Promise<{
  user: { id: string; name: string; email: string };
}> {
  const response = await api.get("/auth/me");
  return response.data;
}

// Dashboard API functions
export async function getDashboardSummary() {
  const response = await api.get("/dashboard/summary");
  return response.data;
}

export async function getDashboardTrends(type: "monthly" | "yearly") {
  const response = await api.get(`/dashboard/trends/${type}`);
  return response.data;
}

// Transaction API functions
export async function getRecentTransactions() {
  const response = await api.get("/transactions/recent");
  return response.data;
}

export async function getTransactions(params?: any) {
  const response = await api.get("/transactions", { params });
  return response.data;
}

export async function getTransactionsTable(params?: any) {
  const response = await api.get("/transactions/table", { params });
  return response.data;
}

export async function queryTransactions(data: any) {
  const response = await api.post("/transactions/query", data);
  return response.data;
}

export async function exportTransactions(data: any) {
  const response = await api.post("/transactions/export", data);
  return response.data;
}

// Default export
export default api;
