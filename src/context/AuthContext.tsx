import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {ReactNode} from "react";
import * as auth from "@/service/auth.service";

export const UserRole = {
  SUPERADMIN: "superadmin",
  CLIENT: "client",
  EMPLOYEE: "employee",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  branchCode?: string;
  employeeCode?: string;
  utilizedCredit:string;
  creditLimit:string
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const storedUser = auth.getStoredUser();
  const storedToken = auth.getStoredToken();

  if (storedUser && storedToken) {
    setUser(storedUser);
    setToken(storedToken);
  }

  setIsHydrated(true);
}, []);

  const login = async (email: string, password: string) => {
    const {user, token} = await auth.login(email, password);

    setUser(user);
    setToken(token);
    auth.storeUserAndToken(user, token);

      if (!user?.role) {
    console.error("User role is missing. Cannot navigate.");
    return;
  }

  if(user.role === "client"){
    navigate(`/${user.role}/cases`);
  }
    
    else
    navigate(`/${user.role}`);
    };
    
    const logout = () => {
    setUser(null);
    setToken(null);
    auth.clearUserAndToken();
    navigate("/");
  };



  return (
    <AuthContext.Provider value={{ user, token, login, logout,isAuthenticated: !!user && !!token && isHydrated,isHydrated }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
