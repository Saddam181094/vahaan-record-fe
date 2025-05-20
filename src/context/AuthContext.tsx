import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {ReactNode} from "react";
import * as auth from "@/lib/auth";

export const Role = {
  ADMIN: "ADMIN",
  User: "User",
  Employee: "Employee",
} as const;

export type Role = typeof Role[keyof typeof Role];


export interface User {
  email: string;
  role: Role;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const {user, token} = await auth.login(email, password);

      if (!user?.role) {
    console.error("User role is missing. Cannot navigate.");
    return;
  }

    setUser(user);
    setToken(token);

    auth.storeUserAndToken(user, token);

    navigate(`/${user.role}`);
    };
    
    const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    navigate("/login");
  };

useEffect(() => {
  const storedUser = auth.getStoredUser();
  const storedToken = auth.getStoredToken();

  if (storedUser && storedToken) {
    setUser(storedUser);
    setToken(storedToken);
  }
}, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout,isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
