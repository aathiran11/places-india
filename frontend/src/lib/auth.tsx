import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function persist(u: User, token: string) {
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", token);
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await api.post<{ user: User; token: string }>("/auth/login", { email, password });
    persist(res.user, res.token);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post<{ user: User; token: string }>("/auth/register", {
      name,
      email,
      password,
    });
    persist(res.user, res.token);
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
