import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const UploadDocuments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [driverLicense, setDriverLicense] = useState<File | null>(null);
  const [insuranceDoc, setInsuranceDoc] = useState<File | null>(null);
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [isLoading, setIsLoading] = useState(false);

// Add authorization header and update navigation
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
  
    const formData = new FormData();
    formData.append("vehicle", vehicleType);
    formData.append("license", driverLicense as File);
    formData.append("insurance", insuranceDoc as File);
  
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:9000/api/deliveries/riders',
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      toast({
        title: "Documents submitted",
        description: "Your verification is now pending review",
      });
  
      navigate("/verification-pending");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.response?.data?.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Upload Your Documents</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Driver's License</Label>
            <Input type="file" accept="image/*" onChange={(e) => setDriverLicense(e.target.files?.[0] || null)} required />
          </div>

          <div className="space-y-2">
            <Label>Insurance Document</Label>
            <Input type="file" accept="image/*" onChange={(e) => setInsuranceDoc(e.target.files?.[0] || null)} required />
          </div>

          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={(val) => setVehicleType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="van">Van</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Documents"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocuments;
