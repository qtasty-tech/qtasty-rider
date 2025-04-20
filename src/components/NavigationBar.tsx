
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Navigation, 
  History, 
  Wallet, 
  User, 
  HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRider } from "@/contexts/RiderContext";

const NavigationBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { availability, currentOrder } = useRider();
  
  // Don't show nav when there's no user or during active delivery
  if (!user || (currentOrder && currentOrder.status !== "delivered")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50">
      <NavItem 
        to="/" 
        icon={<Navigation size={24} />} 
        label="Home" 
        isActive={location.pathname === "/"} 
      />
      <NavItem 
        to="/history" 
        icon={<History size={24} />} 
        label="History" 
        isActive={location.pathname === "/history"} 
      />
      <NavItem 
        to="/earnings" 
        icon={<Wallet size={24} />} 
        label="Earnings" 
        isActive={location.pathname === "/earnings"} 
      />
      <NavItem 
        to="/profile" 
        icon={<User size={24} />} 
        label="Profile" 
        isActive={location.pathname === "/profile"} 
      />
      <NavItem 
        to="/help" 
        icon={<HelpCircle size={24} />} 
        label="Help" 
        isActive={location.pathname === "/help"} 
      />
    </div>
  );
};

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center w-full h-full",
        isActive ? "text-primary" : "text-gray-500"
      )}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs">{label}</span>
    </Link>
  );
};

export default NavigationBar;
