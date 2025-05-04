import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin" | "restaurant" | "rider";
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // Added login
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [rider, setRider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", data);
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      const riderResponse = await axios.get(`http://localhost:8000/api/riders/user/${user._id}`)
      setRider(riderResponse.data.rider);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("rider", JSON.stringify(riderResponse.data.rider));


      if (user.role !== 'rider') {
        throw new Error('Please register as a rider first.');
      }

      if (!user.isVerified) {
        throw new Error('pending-verification');
      }

      setUser(user);
      setToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      } else {
        throw error;
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};