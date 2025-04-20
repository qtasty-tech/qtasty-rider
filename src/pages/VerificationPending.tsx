
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const VerificationPending = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Quick Wheels</h1>
          <p className="text-gray-600">Delivery Partner Portal</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
            <div className="text-secondary text-2xl">⏳</div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Verification Pending</h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for registering! Your account is pending verification by our team. 
            This usually takes 24-48 hours. We'll notify you via email once your account is activated.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Required Documents:</h3>
            <ul className="text-sm text-gray-600 text-left list-disc pl-5 space-y-1">
              <li>Valid ID (Driver's License or Passport)</li>
              <li>Vehicle Registration</li>
              <li>Insurance Documentation</li>
              <li>Proof of Address</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link to="/upload-documents">
                Upload Documents
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                Back to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
