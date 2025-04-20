
import { useState } from "react";
import { MapPin, ArrowRight, Calendar, Clock } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRider } from "@/contexts/RiderContext";

const History = () => {
  const { orderHistory } = useRider();
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");
  
  // Filter orders based on selection
  const filteredOrders = orderHistory.filter(order => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    
    if (filter === "week") {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= lastWeek;
    } else if (filter === "month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return orderDate >= lastMonth;
    }
    
    return true; // "all" filter
  });
  
  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Delivery History</h1>
          <Select value={filter} onValueChange={(value: "all" | "week" | "month") => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      
      <main className="p-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">🚫</div>
            </div>
            <h2 className="font-semibold text-lg mb-2">No Deliveries Found</h2>
            <p className="text-gray-600">
              You don't have any delivery history for the selected period.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="font-semibold">{order.restaurantName}</h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <Clock size={14} className="mr-1" />
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString(undefined, { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={`status-badge ${
                    order.status === "delivered" ? "status-badge-online" : "status-badge-busy"
                  }`}>
                    {order.status === "delivered" ? "Delivered" : "Cancelled"}
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
                      <p className="text-sm text-gray-600">{order.restaurantAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-1">
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                  
                  <div className="flex items-start">
                    <div className="min-w-8 mt-1">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <MapPin size={14} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{order.customerAddress}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="text-sm">{order.items.length} items</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="text-sm">{order.distance} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Earning</p>
                    <p className="text-sm font-medium text-primary">${order.deliveryFee.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
