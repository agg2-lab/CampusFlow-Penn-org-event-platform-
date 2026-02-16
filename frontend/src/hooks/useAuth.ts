"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem("campusflow_token", token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("campusflow_token");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem("campusflow_token");
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const data = await api.get<{ user: User }>("/auth/me", { token });
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("campusflow_token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const data = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("campusflow_token", data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  register: async (email, name, password) => {
    const data = await api.post<{ token: string; user: User }>("/auth/register", {
      email,
      name,
      password,
    });
    localStorage.setItem("campusflow_token", data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  googleLogin: async (credential) => {
    const data = await api.post<{ token: string; user: User }>("/auth/google", {
      credential,
    });
    localStorage.setItem("campusflow_token", data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  sendMagicLink: async (email) => {
    await api.post("/auth/magic-link", { email });
  },
}));
