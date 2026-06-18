import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/axios";

type User = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "AGENT";
  tenantId?: string | null;
  mustChangePassword: boolean;
  isActive: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const loggedInUser = response.data.data.user;
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    const response = await api.patch("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    const updatedUser = response.data.data.user;
    setUser(updatedUser);

    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, changePassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
