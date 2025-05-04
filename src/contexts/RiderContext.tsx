import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface Delivery {
  _id: string;
  orderId: string;
  status: 'assigned' | 'in-progress' | 'pick-up' | 'en_route' | 'completed' | 'failed';
  restaurant: {
    name: string;
    address: string;
    location: { coordinates: [number, number] };
    phone?: string;
  };
  customer: {
    name: string;
    address: string;
    location: { coordinates: [number, number] };
    phone?: string;
  };
  orderCode: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  specialInstructions?: string;
  paymentMethod: string;
  deliveryFee: number;
}

interface RiderContextType {
  availability: 'online' | 'offline' | 'busy';
  setAvailability: (status: 'online' | 'offline' | 'busy') => void;
  currentOrder: Delivery | null;
  pendingOrder: Delivery | null;
  acceptOrder: (order: Delivery) => void;
  declineOrder: () => void;
  updateOrderStatus: (status: 'in-progress' | 'pick-up' | 'en_route' | 'completed') => void;
  completeOrder: () => void;
  earnings: { today: number };
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);


export const RiderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availability, setAvailability] = useState<'online' | 'offline' | 'busy'>('offline');
  const [currentOrder, setCurrentOrder] = useState<Delivery | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Delivery | null>(null);
  const [earnings, setEarnings] = useState({ today: 0 });
  const { toast } = useToast();

  const API_BASE_URL = 'http://localhost:8000/api/deliveries';
  const token = localStorage.getItem('token') || '';
  const rider = JSON.parse(localStorage.getItem('rider') || '{}');

  // Poll for pending and active deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // Fetch pending delivery
        const pendingResponse = await axios.get(`${API_BASE_URL}/pending/${rider?._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingOrder(pendingResponse.data.delivery || null);

        // Fetch active delivery
        const activeResponse = await axios.get(`${API_BASE_URL}/active/${rider?._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentOrder(activeResponse.data.delivery || null);

        // Update availability
        if (activeResponse.data.delivery) {
          setAvailability('busy');
        } else if (!pendingResponse.data.delivery) {
          setAvailability(availability === 'busy' ? 'online' : availability);
        }
      } catch (error: any) {
        console.error('Error fetching deliveries:', error);
        if (error.code === 'ERR_NETWORK') {
          toast({
            title: 'Network Error',
            description: 'Unable to connect to the Delivery Service. Please check your connection.',
            variant: 'destructive',
          });
        }
      }
    };

    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [availability, token, toast]);

  const acceptOrder = async (order: Delivery) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${order._id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingOrder(null);
      setCurrentOrder(response.data.delivery);
      setAvailability('busy');
    } catch (error: any) {
      console.error('Error accepting delivery:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept delivery. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const declineOrder = async () => {
    if (pendingOrder) {
      try {
        await axios.put(
          `${API_BASE_URL}/${pendingOrder._id}/decline`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingOrder(null);
      } catch (error: any) {
        console.error('Error declining delivery:', error);
        toast({
          title: 'Error',
          description: 'Failed to decline delivery. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const updateOrderStatus = async (status: 'in-progress' | 'pick-up' | 'en_route' | 'completed') => {
    if (currentOrder) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/${currentOrder._id}/status/${status}`,
          { earnings: currentOrder.deliveryFee },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentOrder(response.data.updatedDelivery);
        if (status === 'completed') {
          setEarnings((prev) => ({ today: prev.today + currentOrder.deliveryFee }));
          setCurrentOrder(null);
          setAvailability('online');
        }
      } catch (error: any) {
        console.error('Error updating delivery status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update delivery status. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const completeOrder = () => {
    updateOrderStatus('completed');
  };

  return (
    <RiderContext.Provider
      value={{
        availability,
        setAvailability,
        currentOrder,
        pendingOrder,
        acceptOrder,
        declineOrder,
        updateOrderStatus,
        completeOrder,
        earnings,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error('useRider must be used within a RiderProvider');
  }
  return context;
};