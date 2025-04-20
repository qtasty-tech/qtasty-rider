
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showEmergency, setShowEmergency] = useState(false);
  
  const handleContactSupport = () => {
    toast({
      title: "Support requested",
      description: "A support agent will contact you shortly.",
    });
  };
  
  const handleEmergencyRequest = () => {
    toast({
      title: "Emergency assistance requested",
      description: "Emergency services have been notified. Stay safe.",
      variant: "destructive"
    });
  };
  
  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold ml-2">Help & Support</h1>
        </div>
      </header>
      
      <main className="p-4">
        {/* Emergency Support */}
        <div className="bg-accent/10 rounded-lg border border-accent/20 p-4 mb-4">
          <div className="flex justify-between items-center" onClick={() => setShowEmergency(!showEmergency)}>
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-accent mr-3" />
              <h2 className="font-semibold">Emergency Support</h2>
            </div>
            <Button variant="ghost" size="icon">
              {showEmergency ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
          </div>
          
          {showEmergency && (
            <div className="mt-4 space-y-3">
              <p className="text-sm">
                If you're in an emergency situation, please use one of the options below:
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-accent hover:bg-accent/90 py-6"
                  onClick={handleEmergencyRequest}
                >
                  <AlertTriangle size={18} className="mr-2" />
                  SOS Alert
                </Button>
                
                <Button 
                  variant="outline" 
                  className="bg-white border-accent text-accent hover:text-accent py-6"
                  asChild
                >
                  <a href="tel:911">
                    <Phone size={18} className="mr-2" />
                    Call Emergency
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-4">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I get paid for my deliveries?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">
                  Earnings from your deliveries are added to your wallet after every completed delivery. 
                  You can withdraw your earnings to your bank account from the "Earnings" page. 
                  Withdrawals typically process within 1-2 business days.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>What if the restaurant is closed when I arrive?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">
                  If you arrive at a restaurant that's closed, please use the "Restaurant closed" option 
                  in the delivery screen. Take a photo as proof, and our system will cancel the order 
                  and compensate you for the travel distance.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I handle damaged items during delivery?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">
                  If items are damaged during delivery, document the damage with photos and contact 
                  customer support immediately. Do not deliver damaged items to the customer without 
                  consulting support first.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>What if the customer doesn't respond?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">
                  If a customer doesn't respond, follow these steps:
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Call the customer at least 3 times</li>
                    <li>Message them through the app</li>
                    <li>Wait for 5 minutes at the delivery location</li>
                    <li>If still no response, use the "Customer not responding" option</li>
                    <li>Follow the instructions provided to complete or return the order</li>
                  </ol>
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I update my vehicle information?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">
                  To update your vehicle information, go to Profile → Edit Profile → Vehicle Information. 
                  You'll need to provide new documentation for verification if you change your vehicle type.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={30} className="text-primary" />
          </div>
          
          <h2 className="font-semibold text-lg mb-2">Need more help?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is available 24/7 to assist you with any issues or questions.
          </p>
          
          <div className="space-y-3">
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleContactSupport}>
              Contact Support
            </Button>
            
            <Button variant="outline" className="w-full" asChild>
              <a href="tel:+18001234567">Call Support Center</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Help;
