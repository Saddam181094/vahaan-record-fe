// src/lib/auth.ts

import type { Role, User } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMsg = errorData?.message || "Login failed";
    throw new Error(errorMsg);
  }

  const data = await response.json();

  const user: User = {
    email: data.email,
    role: data.role as Role,
  };

  return { user, token: data.token };
}

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
