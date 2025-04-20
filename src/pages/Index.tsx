
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.isVerified) {
          navigate("/");
        } else {
          navigate("/verification-pending");
        }
      } else {
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Quick Wheels</h1>
        <p className="text-gray-600">Loading your delivery dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
