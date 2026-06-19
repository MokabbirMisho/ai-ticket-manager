import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/axios";

type Requester = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type RequesterAuthContextType = {
  requester: Requester | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const RequesterAuthContext = createContext<RequesterAuthContextType | null>(
  null,
);

export function RequesterAuthProvider({ children }: { children: ReactNode }) {
  const [requester, setRequester] = useState<Requester | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const response = await api.get("/requester/auth/me");
      setRequester(response.data.data.requester ?? response.data.data.student);
    } catch {
      setRequester(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/requester/auth/register", {
      name,
      email,
      password,
    });

    setRequester(response.data.data.requester ?? response.data.data.student);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/requester/auth/login", {
      email,
      password,
    });

    setRequester(response.data.data.requester ?? response.data.data.student);
  };

  const logout = async () => {
    await api.post("/requester/auth/logout");
    setRequester(null);
  };

  return (
    <RequesterAuthContext.Provider
      value={{ requester, isLoading, register, login, logout }}
    >
      {children}
    </RequesterAuthContext.Provider>
  );
}

export function useRequesterAuth() {
  const context = useContext(RequesterAuthContext);

  if (!context) {
    throw new Error(
      "useRequesterAuth must be used inside RequesterAuthProvider",
    );
  }

  return context;
}
