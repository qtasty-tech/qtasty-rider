
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Star, Wallet, Settings, LogOut, Check, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };
  
  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    toast({
      title: notifications ? "Notifications disabled" : "Notifications enabled",
      description: notifications 
        ? "You won't receive push notifications." 
        : "You'll receive push notifications for new orders and updates.",
    });
  };
  
  return (
    <div className="min-h-screen pb-20">
      <header className="bg-primary text-white p-6">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-4">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <div className="flex items-center mt-1">
              <Star size={16} className="mr-1 text-secondary" />
              <span>{user?.rating}</span>
              <span className="mx-2">•</span>
              <span>{user?.vehicleType}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-4">
        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{user?.email}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{user?.phone}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Vehicle Type</p>
                <p className="capitalize">{user?.vehicleType}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mr-2">
                    <Check size={12} className="text-white" />
                  </div>
                  <p className="text-sm">Verified</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Edit Profile
          </Button>
        </div>
        
        {/* Wallet */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <Wallet size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Wallet Balance</h3>
                <p className="text-xl font-bold">${user?.walletBalance.toFixed(2)}</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <div onClick={() => navigate("/earnings")}>
                Manage
              </div>
            </Button>
          </div>
        </div>
        
        {/* Settings */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Bell size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive alerts for new orders</p>
                </div>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={handleNotificationsChange} 
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Shield size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Privacy & Security</p>
                  <p className="text-sm text-gray-500">Manage your account security</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Settings size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Help & Support */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <Button variant="outline" asChild className="w-full">
            <div onClick={() => navigate("/help")}>
              Help & Support
            </div>
          </Button>
        </div>
        
        {/* Logout */}
        <Button 
          variant="destructive" 
          className="w-full flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </main>
    </div>
  );
};

export default Profile;
