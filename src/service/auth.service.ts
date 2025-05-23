import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import type { UserRole, User } from "@/context/AuthContext";

export const url = import.meta.env.VITE_API_URL;

export const getConfig = (): AxiosRequestConfig => {
  const t = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  } as AxiosRequestConfig;
};

export async function forgotPassword(email: string): Promise<string> {
  try {
    const response = await axios.post(
      `${url}/auth/resend-credentials`,
      { email }
    );
    return response.data?.data?.message || "Password reset instructions sent.";
  } catch (err: any) {
    const msg =
      err?.response?.data?.errors?.message ||
      err?.response?.data?.message ||
      "Something went wrong.";
    throw new Error(msg);
  }
}

// Login
export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  try {
    const response = await axios.post(`${url}/auth/login`, {
      email,
      password,
    });
    const responseData = response.data;

    const user: User = {
      id: responseData.data.user.id,
      name: responseData.data.user.name,
      isVerified: responseData.data.user.isVerified,
      email: responseData.data.user.email,
      role: responseData.data.user.role as UserRole,
    };

    const token = responseData.data.access_token;

    return { user, token };
  } catch (err: any) {
    const msg = err?.response?.data?.message || "Login failed";
    throw new Error(msg);
  }
}

// Storage helpers
export function storeUserAndToken(user: User, token: string): void {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function clearUserAndToken(): void {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export function getStoredUser(): User | null {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getStoredToken(): string | null {
  return localStorage.getItem("token");
}
