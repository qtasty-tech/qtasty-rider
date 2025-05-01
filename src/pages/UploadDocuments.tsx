import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const UploadDocuments = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [license, setLicense] = useState<File | null>(null);
  const [insurance, setInsurance] = useState<File | null>(null);
  const [vehicle, setVehicle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!license || !insurance || !vehicle) {
      toast({ title: "Please fill in all fields." });
      return;
    }

    const formData = new FormData();
    formData.append("license", license);
    formData.append("insurance", insurance);
    formData.append("vehicle", vehicle);

    // Add user details to formData
    formData.append("userId", user?._id || "");

    try {
      const response = await fetch("http://localhost:8000/api/riders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast({ title: "Documents uploaded successfully!" });
      navigate("/verification-pending");
    } catch (error: any) {
      toast({ title: error.message || "Something went wrong" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Upload Documents</h1>
          <p className="text-gray-600">Complete your profile verification</p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md space-y-6"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Driving License
            </label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => setLicense(e.target.files?.[0] || null)}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Vehicle Registration / Insurance
            </label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => setInsurance(e.target.files?.[0] || null)}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Vehicle Type
            </label>
            <select 
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">Select vehicle type</option>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
            </select>
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
          >
            Submit Documents
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocuments;
