import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/axios";

type Student = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type StudentAuthContextType = {
  student: Student | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const StudentAuthContext = createContext<StudentAuthContextType | null>(null);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const response = await api.get("/student/auth/me");
      setStudent(response.data.data.student);
    } catch {
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/student/auth/register", {
      name,
      email,
      password,
    });

    setStudent(response.data.data.student);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/student/auth/login", {
      email,
      password,
    });

    setStudent(response.data.data.student);
  };

  const logout = async () => {
    await api.post("/student/auth/logout");
    setStudent(null);
  };

  return (
    <StudentAuthContext.Provider
      value={{ student, isLoading, register, login, logout }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);

  if (!context) {
    throw new Error("useStudentAuth must be used inside StudentAuthProvider");
  }

  return context;
}
