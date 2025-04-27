
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  isVerified: boolean;
  rating: number;
  walletBalance: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating user persistence check
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a mock login - in a real app, this would be an API call
      // Simulating API response delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Mock user for demo purposes
      const mockUser: User = {
        id: "r123456",
        name: "Demo Rider",
        email: email,
        phone: "+1234567890",
        vehicleType: "Motorcycle",
        isVerified: true,
        rating: 4.8,
        walletBalance: 2450.75,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // This is a mock registration - in a real app, this would be an API call
      // Simulating API response delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      // Mock user for demo purposes
      const mockUser: User = {
        id: "r" + Math.floor(Math.random() * 1000000),
        name: userData.name || "New Rider",
        email: userData.email || "rider@example.com",
        phone: userData.phone || "+1234567890",
        vehicleType: userData.vehicleType || "Motorcycle",
        isVerified: false, // New riders need verification
        rating: 5.0, // Starting rating
        walletBalance: 0,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
