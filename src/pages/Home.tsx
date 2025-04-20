
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRider } from "@/contexts/RiderContext";

const Home = () => {
  const { user } = useAuth();
  const { 
    availability, 
    setAvailability, 
    currentOrder, 
    pendingOrder, 
    acceptOrder, 
    declineOrder,
    updateOrderStatus,
    completeOrder,
    earnings
  } = useRider();
  const [orderTimer, setOrderTimer] = useState(30);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Countdown timer for pending order
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pendingOrder && orderTimer > 0) {
      interval = setInterval(() => {
        setOrderTimer((prev) => prev - 1);
      }, 1000);
    } else if (orderTimer === 0 && pendingOrder) {
      declineOrder();
      setOrderTimer(30);
      toast({
        title: "Order expired",
        description: "You didn't respond in time. The order was declined.",
        variant: "destructive",
      });
    }
    
    if (!pendingOrder) {
      setOrderTimer(30);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [pendingOrder, orderTimer, declineOrder, toast]);
  
  const handleAvailabilityChange = (checked: boolean) => {
    if (checked) {
      setAvailability("online");
      toast({
        title: "You're online",
        description: "You'll start receiving delivery requests.",
      });
    } else {
      setAvailability("offline");
      toast({
        title: "You're offline",
        description: "You won't receive any delivery requests.",
      });
    }
  };
  
  const handleAcceptOrder = () => {
    if (pendingOrder) {
      acceptOrder(pendingOrder);
      toast({
        title: "Order accepted",
        description: "You've accepted the delivery. Head to the restaurant for pickup.",
      });
    }
  };
  
  const handleDeclineOrder = () => {
    declineOrder();
    toast({
      title: "Order declined",
      description: "You've declined the delivery. We'll find another driver.",
    });
  };
  
  const handleUpdateStatus = (status: "arrived_at_restaurant" | "picked_up" | "en_route" | "delivered") => {
    updateOrderStatus(status);
    
    if (status === "arrived_at_restaurant") {
      toast({
        title: "Arrived at restaurant",
        description: `Show this code to staff: ${currentOrder?.orderCode}`,
      });
    } else if (status === "picked_up") {
      toast({
        title: "Order picked up",
        description: "You've picked up the order. Heading to customer.",
      });
    } else if (status === "en_route") {
      toast({
        title: "En route to customer",
        description: "You're on your way to the customer.",
      });
    }
  };
  
  const handleCompleteDelivery = () => {
    completeOrder();
    toast({
      title: "Delivery completed",
      description: "Great job! The delivery has been marked as completed.",
    });
  };
  
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary">Quick Wheels</h1>
            <p className="text-sm text-gray-500">Delivery Partner</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">⭐ {user?.rating}</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
              {user?.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="p-4">
        {/* Availability toggle */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Your Status</h2>
              <p className="text-sm text-gray-500">
                {availability === "online" 
                  ? "You're online and ready for deliveries" 
                  : availability === "busy" 
                    ? "You're currently on a delivery" 
                    : "You're offline - go online to receive orders"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="availability-mode" className="sr-only">
                Availability
              </Label>
              <Switch
                id="availability-mode"
                checked={availability !== "offline"}
                onCheckedChange={handleAvailabilityChange}
                disabled={availability === "busy"}
              />
              <span className={`status-badge ${
                availability === "online" 
                  ? "status-badge-online" 
                  : availability === "busy" 
                    ? "status-badge-busy" 
                    : "status-badge-offline"
              }`}>
                {availability === "online" ? "Online" : availability === "busy" ? "Busy" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Earnings Summary */}
        {!currentOrder && !pendingOrder && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">Today's Earnings</h2>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">${earnings.today.toFixed(2)}</p>
                <Button variant="outline" asChild>
                  <Link to="/earnings">View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Pending Order */}
        {pendingOrder && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 animate-pulse-subtle">
            <div className="mb-3 flex justify-between items-center">
              <h2 className="font-semibold text-lg">New Delivery Request</h2>
              <div className="text-secondary flex items-center">
                <Clock size={16} className="mr-1" />
                <span className="font-medium">{orderTimer}s</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3 mb-3">
              <div className="flex items-start mb-2">
                <div className="min-w-8 mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <MapPin size={14} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{pendingOrder.restaurantName}</p>
                  <p className="text-sm text-gray-600">{pendingOrder.restaurantAddress}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="min-w-8 mt-1">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <MapPin size={14} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{pendingOrder.customerName}</p>
                  <p className="text-sm text-gray-600">{pendingOrder.customerAddress}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="font-medium">{pendingOrder.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Time</p>
                <p className="font-medium">{pendingOrder.estimatedDeliveryTime} mins</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Earning</p>
                <p className="font-medium text-primary">${pendingOrder.deliveryFee.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1 border-gray-300" 
                onClick={handleDeclineOrder}
              >
                Decline
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90" 
                onClick={handleAcceptOrder}
              >
                Accept
              </Button>
            </div>
          </div>
        )}
        
        {/* Current Active Order */}
        {currentOrder && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="mb-3 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Active Delivery</h2>
              <div className={`status-badge ${
                currentOrder.status === "accepted" ? "status-badge-online" : 
                currentOrder.status === "arrived_at_restaurant" ? "status-badge-nearby" :
                "status-badge-busy"
              }`}>
                {currentOrder.status === "accepted" ? "Heading to Pickup" : 
                 currentOrder.status === "arrived_at_restaurant" ? "At Restaurant" :
                 currentOrder.status === "picked_up" ? "Order Picked Up" :
                 "En Route to Customer"}
              </div>
            </div>
            
            {/* Order info */}
            <div className="bg-gray-50 rounded p-3 mb-3">
              <div className="flex items-start mb-2">
                <div className="min-w-8 mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <MapPin size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{currentOrder.restaurantName}</p>
                      <p className="text-sm text-gray-600">{currentOrder.restaurantAddress}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={`tel:${currentOrder.restaurantPhone}`}>
                        <Phone size={16} />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="min-w-8 mt-1">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <MapPin size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{currentOrder.customerName}</p>
                      <p className="text-sm text-gray-600">{currentOrder.customerAddress}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={`tel:${currentOrder.customerPhone}`}>
                        <Phone size={16} />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order details */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Order Details</h3>
              <div className="bg-gray-50 rounded p-3">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${currentOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Special instructions */}
            {currentOrder.specialInstructions && (
              <div className="mb-4">
                <div className="bg-yellow-50 border-l-4 border-secondary p-3 flex">
                  <AlertTriangle size={18} className="text-secondary mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Special Instructions:</p>
                    <p className="text-sm">{currentOrder.specialInstructions}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment method */}
            <div className="mb-4 flex items-center">
              <p className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                Payment: <span className="font-medium">{currentOrder.paymentMethod === "cash" ? "Cash on Delivery" : "Paid by Card"}</span>
              </p>
              {currentOrder.status === "arrived_at_restaurant" && (
                <p className="text-sm bg-secondary/20 px-3 py-1 rounded-full ml-2">
                  Order Code: <span className="font-medium">{currentOrder.orderCode}</span>
                </p>
              )}
            </div>
            
            {/* Action buttons */}
            {currentOrder.status === "accepted" && (
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleUpdateStatus("arrived_at_restaurant")}
              >
                I've Arrived at Restaurant
              </Button>
            )}
            
            {currentOrder.status === "arrived_at_restaurant" && (
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleUpdateStatus("picked_up")}
              >
                Order Picked Up
              </Button>
            )}
            
            {currentOrder.status === "picked_up" && (
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleUpdateStatus("en_route")}
              >
                En Route to Customer
              </Button>
            )}
            
            {currentOrder.status === "en_route" && (
              <Button 
                className="w-full bg-accent hover:bg-accent/90"
                onClick={handleCompleteDelivery}
              >
                Complete Delivery
              </Button>
            )}
          </div>
        )}
        
        {/* No orders */}
        {!currentOrder && !pendingOrder && availability === "online" && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">🚚</div>
            </div>
            <h2 className="font-semibold text-lg mb-2">Ready for Orders</h2>
            <p className="text-gray-600 mb-4">
              You're online and will receive delivery requests soon.
              Make sure you have enough fuel and are in your preferred delivery zone.
            </p>
          </div>
        )}
        
        {!currentOrder && !pendingOrder && availability === "offline" && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">💤</div>
            </div>
            <h2 className="font-semibold text-lg mb-2">You're Offline</h2>
            <p className="text-gray-600 mb-4">
              Toggle your status to online to start receiving delivery requests.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleAvailabilityChange(true)}
            >
              Go Online
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
