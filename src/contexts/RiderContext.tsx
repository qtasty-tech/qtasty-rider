
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type OrderStatus = 
  | "pending" 
  | "accepted" 
  | "arrived_at_restaurant" 
  | "picked_up" 
  | "en_route" 
  | "delivered" 
  | "cancelled";

export type Order = {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  specialInstructions?: string;
  totalAmount: number;
  deliveryFee: number;
  createdAt: Date;
  estimatedDeliveryTime: number; // in minutes
  distance: number; // in km
  status: OrderStatus;
  paymentMethod: "cash" | "card";
  orderCode: string;
};

export type RiderAvailability = "online" | "offline" | "busy";

type RiderContextType = {
  availability: RiderAvailability;
  setAvailability: (status: RiderAvailability) => void;
  currentOrder: Order | null;
  pendingOrder: Order | null;
  orderHistory: Order[];
  earnings: {
    today: number;
    week: number;
    month: number;
  };
  acceptOrder: (order: Order) => void;
  declineOrder: () => void;
  updateOrderStatus: (status: OrderStatus) => void;
  completeOrder: () => void;
};

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const useRider = () => {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error("useRider must be used within a RiderProvider");
  }
  return context;
};

type RiderProviderProps = {
  children: ReactNode;
};

// Mock order data
const mockOrders: Order[] = [
  {
    id: "o123456",
    restaurantName: "Burger King",
    restaurantAddress: "123 Main St, Anytown",
    restaurantPhone: "+1234567890",
    customerName: "John Doe",
    customerAddress: "456 Oak St, Anytown",
    customerPhone: "+9876543210",
    items: [
      { name: "Whopper", quantity: 1, price: 5.99 },
      { name: "Fries (Large)", quantity: 1, price: 2.99 },
      { name: "Soda", quantity: 2, price: 1.99 }
    ],
    specialInstructions: "Please include extra ketchup",
    totalAmount: 12.96,
    deliveryFee: 2.50,
    createdAt: new Date(Date.now() - 3600000),
    estimatedDeliveryTime: 30,
    distance: 3.2,
    status: "delivered",
    paymentMethod: "card",
    orderCode: "BK1234"
  },
  {
    id: "o123457",
    restaurantName: "Pizza Hut",
    restaurantAddress: "789 Pine St, Anytown",
    restaurantPhone: "+1234567891",
    customerName: "Jane Smith",
    customerAddress: "321 Elm St, Anytown",
    customerPhone: "+9876543211",
    items: [
      { name: "Large Pepperoni Pizza", quantity: 1, price: 12.99 },
      { name: "Breadsticks", quantity: 1, price: 3.99 },
      { name: "Soda (2L)", quantity: 1, price: 2.99 }
    ],
    totalAmount: 19.97,
    deliveryFee: 3.00,
    createdAt: new Date(Date.now() - 86400000),
    estimatedDeliveryTime: 35,
    distance: 4.5,
    status: "delivered",
    paymentMethod: "cash",
    orderCode: "PH5678"
  }
];

export const RiderProvider = ({ children }: RiderProviderProps) => {
  const [availability, setAvailability] = useState<RiderAvailability>("offline");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>(mockOrders);
  const [earnings, setEarnings] = useState({
    today: 24.50,
    week: 324.75,
    month: 1245.80
  });

  // Simulate incoming orders when rider goes online
  useEffect(() => {
    let orderTimer: NodeJS.Timeout;
    
    if (availability === "online" && !currentOrder && !pendingOrder) {
      orderTimer = setTimeout(() => {
        const newOrder: Order = {
          id: "o" + Math.floor(Math.random() * 1000000),
          restaurantName: "Tasty Thai",
          restaurantAddress: "555 Food St, Anytown",
          restaurantPhone: "+1234567892",
          customerName: "Alex Johnson",
          customerAddress: "777 Park Ave, Anytown",
          customerPhone: "+9876543212",
          items: [
            { name: "Pad Thai", quantity: 1, price: 11.99 },
            { name: "Spring Rolls", quantity: 2, price: 3.99 },
            { name: "Thai Iced Tea", quantity: 1, price: 2.49 }
          ],
          specialInstructions: "Ring doorbell twice, leave at door",
          totalAmount: 22.46,
          deliveryFee: 3.50,
          createdAt: new Date(),
          estimatedDeliveryTime: 25,
          distance: 2.7,
          status: "pending",
          paymentMethod: Math.random() > 0.5 ? "cash" : "card",
          orderCode: "TT" + Math.floor(Math.random() * 10000)
        };
        
        setPendingOrder(newOrder);
      }, 5000);
    }
    
    return () => {
      clearTimeout(orderTimer);
    };
  }, [availability, currentOrder, pendingOrder]);

  const acceptOrder = (order: Order) => {
    const updatedOrder = { ...order, status: "accepted" as OrderStatus };
    setCurrentOrder(updatedOrder);
    setPendingOrder(null);
    setAvailability("busy");
  };

  const declineOrder = () => {
    setPendingOrder(null);
  };

  const updateOrderStatus = (status: OrderStatus) => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, status });
    }
  };

  const completeOrder = () => {
    if (currentOrder) {
      const completedOrder = { ...currentOrder, status: "delivered" as OrderStatus };
      setOrderHistory([completedOrder, ...orderHistory]);
      
      // Update earnings
      setEarnings({
        today: earnings.today + completedOrder.deliveryFee,
        week: earnings.week + completedOrder.deliveryFee,
        month: earnings.month + completedOrder.deliveryFee
      });
      
      setCurrentOrder(null);
      setAvailability("online");
    }
  };

  return (
    <RiderContext.Provider
      value={{
        availability,
        setAvailability,
        currentOrder,
        pendingOrder,
        orderHistory,
        earnings,
        acceptOrder,
        declineOrder,
        updateOrderStatus,
        completeOrder
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};
