import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  ChevronRight, 
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dummy data
const dummyUser = {
  walletBalance: 245.75,
};

const dummyRiderData = {
  earnings: {
    today: 25.50,
    week: 152.75,
    month: 620.30,
  },
  orderHistory: [
    {
      id: "1",
      restaurantName: "Pizza Palace",
      createdAt: "2025-05-04T10:15:00Z", // Today
      deliveryFee: 8.50,
      distance: 3.2,
    },
    {
      id: "2",
      restaurantName: "Burger Bonanza",
      createdAt: "2025-05-04T14:30:00Z", // Today
      deliveryFee: 10.00,
      distance: 5.7,
    },
    {
      id: "3",
      restaurantName: "Sushi Stop",
      createdAt: "2025-05-02T12:00:00Z", // This week
      deliveryFee: 7.25,
      distance: 2.8,
    },
    {
      id: "4",
      restaurantName: "Taco Town",
      createdAt: "2025-04-20T18:45:00Z", // This month
      deliveryFee: 9.00,
      distance: 4.1,
    },
    {
      id: "5",
      restaurantName: "Pasta Place",
      createdAt: "2025-04-10T16:20:00Z", // This month
      deliveryFee: 8.75,
      distance: 3.9,
    },
  ],
};

const Earnings = () => {
  // Use dummy data instead of hooks
  const user = dummyUser;
  const { earnings, orderHistory } = dummyRiderData;
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const navigate = useNavigate();
  
  // Filter orders based on selection
  const filteredOrders = orderHistory.filter(order => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    
    if (selectedPeriod === "today") {
      return orderDate.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0);
    } else if (selectedPeriod === "week") {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= lastWeek;
    } else if (selectedPeriod === "month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return orderDate >= lastMonth;
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold ml-2">Earnings</h1>
        </div>
      </header>
      
      <main className="p-4">
        {/* Wallet Balance */}
        <div className="bg-primary text-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Wallet Balance</p>
              <h2 className="text-3xl font-bold">${user?.walletBalance.toFixed(2)}</h2>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
          </div>
          <div className="flex">
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white mr-2">
              Withdraw
            </Button>
            <Button className="bg-white text-primary hover:bg-white/90 hover:text-primary">
              Add Money
            </Button>
          </div>
        </div>
        
        {/* Period Tabs */}
        <Tabs defaultValue="today" className="mb-4" onValueChange={(value) => setSelectedPeriod(value as any)}>
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Today's Earnings</h3>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                ${earnings.today.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Deliveries</span>
                <span className="font-medium">{filteredOrders.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Base Earnings</span>
                <span className="font-medium">${(earnings.today * 0.9).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Tips</span>
                <span className="font-medium">${(earnings.today * 0.1).toFixed(2)}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">This Week's Earnings</h3>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                ${earnings.week.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Deliveries</span>
                <span className="font-medium">{filteredOrders.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Base Earnings</span>
                <span className="font-medium">${(earnings.week * 0.85).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Tips</span>
                <span className="font-medium">${(earnings.week * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Bonuses</span>
                <span className="font-medium">${(earnings.week * 0.05).toFixed(2)}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="month" className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">This Month's Earnings</h3>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                ${earnings.month.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Deliveries</span>
                <span className="font-medium">{filteredOrders.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Base Earnings</span>
                <span className="font-medium">${(earnings.month * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Tips</span>
                <span className="font-medium">${(earnings.month * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Bonuses</span>
                <span className="font-medium">${(earnings.month * 0.05).toFixed(2)}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No transactions for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <TrendingUp size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{order.restaurantName}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                        <span className="mx-1">•</span>
                        <Clock size={12} className="mr-1" />
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString(undefined, { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">+${order.deliveryFee.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.distance} km</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Earnings;