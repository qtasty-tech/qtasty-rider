// src/components/Home.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, AlertTriangle } from "lucide-react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRider } from "@/contexts/RiderContext";
import LocationPicker from "@/components/LocationPicker";

const mapContainerStyle = { width: "100%", height: "300px" };

const Home: React.FC = () => {
  const { user } = useAuth();
  const riderCtx = useRider();

  // Destructure everything except fetchPendingOrders,
  // supply a no-op fallback if it's missing.
  const {
    availability,
    setAvailability,
    currentOrder,
    pendingOrder,
    acceptOrder,
    declineOrder,
    updateOrderStatus,
    completeOrder,
    earnings,
  } = riderCtx;

  const fetchPendingOrders: (id: string) => Promise<void> =
    riderCtx.fetchPendingOrders ??
    (async (_: string) => {
      console.warn("⚠️ fetchPendingOrders not implemented in RiderContext");
    });

  const { toast } = useToast();
  const [orderTimer, setOrderTimer] = useState(30);
  const [showMap, setShowMap] = useState<"restaurant" | "customer" | null>(null);
  const [riderLocation, setRiderLocation] = useState<[number, number]>([0, 0]);

  // Updated getStoredRiderId function
  const getStoredRiderId = () => {
    const storedRider = localStorage.getItem("rider");
    if (!storedRider) return null;

    try {
      const parsed = JSON.parse(storedRider);
      return parsed._id;
    } catch (err) {
      console.error("Failed to parse rider from localStorage:", err);
      return null;
    }
  };

  // Load Maps API for active-delivery map
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  // 1) Fetch pending orders on mount (or when user ID changes)
  useEffect(() => {
    const riderId = user?.id || getStoredRiderId();
    if (riderId) {
      fetchPendingOrders(riderId);
    }
  }, [user?.id, fetchPendingOrders]);

  // 2) Countdown logic for pending order
  useEffect(() => {
    let iv: NodeJS.Timeout;
    if (pendingOrder && orderTimer > 0) {
      iv = setInterval(() => setOrderTimer((t) => t - 1), 1000);
    } else if (pendingOrder && orderTimer === 0) {
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
    return () => clearInterval(iv);
  }, [pendingOrder, orderTimer, declineOrder, toast]);

  // 3) Decide which map (restaurant vs customer) to show
  useEffect(() => {
    if (
      currentOrder &&
      ["in-progress", "arrived_at_restaurant"].includes(currentOrder.status)
    ) {
      setShowMap("restaurant");
    } else if (currentOrder?.status === "en_route") {
      setShowMap("customer");
    } else {
      setShowMap(null);
    }
  }, [currentOrder]);

  // 4) Availability toggle handler
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

  // 5) Accept / Decline order
  const handleAcceptOrder = () => {
    if (pendingOrder) {
      acceptOrder(pendingOrder);
      toast({
        title: "Order accepted",
        description: "Head to the restaurant for pickup.",
      });
    }
  };
  const handleDeclineOrder = () => {
    declineOrder();
    toast({
      title: "Order declined",
      description: "We'll find another driver.",
    });
  };

  // 6) Update order status
  const handleUpdateStatus = (
    status: "in-progress" | "pick-up" | "en_route" | "completed"
  ) => {
    updateOrderStatus(status);
    if (status === "in-progress") {
      toast({
        title: "Arrived at restaurant",
        description: `Show this code to staff: ${currentOrder?.orderCode}`,
      });
    } else if (status === "pick-up") {
      toast({ title: "Order picked up", description: "Heading to customer." });
    } else if (status === "en_route") {
      toast({
        title: "En route to customer",
        description: "You're on your way!",
      });
    }
  };
  const handleCompleteDelivery = () => {
    completeOrder();
    toast({ title: "Delivery completed", description: "Great job!" });
  };

  // 7) Location update handler: logs, toasts & backend PUT
  const handleLocationUpdate = async ({ lat, lng }: { lat: number; lng: number }) => {
    console.log("[LocationPicker] coords:", lat, lng);
    setRiderLocation([lng, lat]);
  
    const riderId = user?.id || getStoredRiderId(); // fallback to localStorage
    if (!riderId) {
      console.warn("No rider ID; skipping server update");
      return;
    }
  
    const token = localStorage.getItem("token"); // get auth token if protected route
  
    try {
      const res = await fetch(
        `http://localhost:8000/api/riders/updateLocation/${riderId}`, // match backend route
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "", // include if auth required
          },
          body: JSON.stringify({
            location: {
              coordinates: [lng, lat],
            },
          }),
        }
      );
  
      if (!res.ok) {
        const msg = await res.text();
        console.error("Update failed:", msg);
        toast({
          title: "Location update failed",
          description: res.statusText,
          variant: "destructive",
        });
      } else {
        console.log("✅ Location updated");
        toast({
          title: "Location saved",
          description: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        });
      }
    } catch (error) {
      console.error("Location update error:", error);
      toast({
        title: "Error updating location",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    }
  };
  
  // 8) Compute mapCenter for active order
  const mapCenter = useMemo(() => {
    if (!currentOrder || !showMap) return { lat: 0, lng: 0 };
    const coords =
      showMap === "restaurant"
        ? currentOrder.restaurant.location.coordinates
        : currentOrder.customer.location.coordinates;
    return { lat: coords[1], lng: coords[0] };
  }, [currentOrder, showMap]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white shadow-md p-4 md:p-5">
  <div className="flex justify-between items-center max-w-7xl mx-auto">
    <div className="flex items-center space-x-2">
      <span className="text-gray-900 text-3xl font-bold flex items-center">
        Q<span className="text-[#F15D36]">Tasty</span>
      </span>
      <span className="text-sm font-medium text-gray-600 border-l border-gray-300 pl-3 ml-2">Delivery Partner</span>
    </div>
    
  </div>
</header>
      {/* Main Content */}
      <main className="p-4">
        {/* Location Picker + Debug */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-3">Update Your Location</h2>
          <LocationPicker onLocationUpdate={handleLocationUpdate} />
          <p className="text-xs text-gray-500 mt-2">
            Current location: {riderLocation[1].toFixed(5)},{" "}
            {riderLocation[0].toFixed(5)}
          </p>
        </div>

        {/* Availability Toggle */}
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
              <span
                className={`status-badge ${
                  availability === "online"
                    ? "status-badge-online"
                    : availability === "busy"
                    ? "status-badge-busy"
                    : "status-badge-offline"
                }`}
              >
                {availability === "online"
                  ? "Online"
                  : availability === "busy"
                  ? "Busy"
                  : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Earnings */}
        {!currentOrder && !pendingOrder && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">Today's Earnings</h2>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">
                  ${earnings.today.toFixed(2)}
                </p>
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="font-medium">5 km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Time</p>
                <p className="font-medium">30 mins</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Earning</p>
                <p className="font-medium text-primary">
                  ${pendingOrder.deliveryFee.toFixed(2)}
                </p>
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

        {/* Active Order */}
        {currentOrder && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="mb-3 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Active Delivery</h2>
              <div
                className={`status-badge ${
                  currentOrder.status === "in-progress"
                    ? "status-badge-online"
                    : currentOrder.status === "pick-up"
                    ? "status-badge-nearby"
                    : "status-badge-busy"
                }`}
              >
                {currentOrder.status === "in-progress"
                  ? "Heading to Pickup"
                  : currentOrder.status === "pick-up"
                  ? "Order Picked Up"
                  : currentOrder.status === "en_route"
                  ? "En Route to Customer"
                  : currentOrder.status}
              </div>
            </div>

            {/* Map (restaurant or customer) */}
            {showMap && (
              <>
                {!isMapLoaded ? (
                  <div>Loading map…</div>
                ) : mapLoadError ? (
                  <div>Error loading map</div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                  >
                    <Marker position={mapCenter} />
                  </GoogleMap>
                )}
              </>
            )}

            {/* Order route info */}
            <div className="bg-gray-50 rounded p-3 mb-3">
              {/* Restaurant */}
              <div className="flex items-start mb-2">
                <div className="min-w-8 mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <MapPin size={14} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">
                    {currentOrder.restaurant.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentOrder.restaurant.address}
                  </p>
                </div>
              </div>
              {/* Customer */}
              <div className="flex items-start">
                <div className="min-w-8 mt-1">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <MapPin size={14} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{currentOrder.customer.name}</p>
                  <p className="text-sm text-gray-600">
                    {currentOrder.customer.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Order Details</h3>
              <div className="bg-gray-50 rounded p-3">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
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
                  <AlertTriangle
                    size={18}
                    className="text-secondary mr-2 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-sm">
                      Special Instructions:
                    </p>
                    <p className="text-sm">
                      {currentOrder.specialInstructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Code */}
            <div className="mb-4 flex items-center">
              <p className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                Payment:{" "}
                <span className="font-medium">
                  {currentOrder.paymentMethod === "cash"
                    ? "Cash on Delivery"
                    : "Paid by Card"}
                </span>
              </p>
              {currentOrder.status === "in-progress" && (
                <p className="text-sm bg-secondary/20 px-3 py-1 rounded-full ml-2">
                  Order Code:{" "}
                  <span className="font-medium">
                    {currentOrder.orderCode}
                  </span>
                </p>
              )}
            </div>

            {/* Action buttons */}
            {currentOrder.status === "in-progress" && (
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleUpdateStatus("pick-up")}
              >
                Order Picked Up
              </Button>
            )}
            {currentOrder.status === "pick-up" && (
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

        {/* No orders, online */}
        {!currentOrder && !pendingOrder && availability === "online" && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">🚚</div>
            </div>
            <h2 className="font-semibold text-lg mb-2">Ready for Orders</h2>
            <p className="text-gray-600 mb-4">
              You're online and will receive delivery requests soon. Make sure
              you have enough fuel and are in your preferred delivery zone.
            </p>
          </div>
        )}

        {/* No orders, offline */}
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
