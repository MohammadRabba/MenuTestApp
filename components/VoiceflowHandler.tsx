// Example: components/VoiceflowHandler.tsx (or integrate into your existing setup)

"use client";

import { useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { toast } from "@/hooks/use-toast"; // For user feedback

// Define the structure of the items expected *from* the API response
interface ApiCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number; // API returns quantity, but addItem usually handles increments
  image: string;
  category: string;
}

// Define the structure Voiceflow might send TO the API
interface VoiceflowPayloadItem {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
}

interface VoiceflowPayload {
    items: VoiceflowPayloadItem[];
}


export function VoiceflowHandler() {
  const { addItem } = useCart();

  // This function will call your API and update the cart
  const processVoiceOrder = async (orderPayload: VoiceflowPayload) => {
    console.log("Received order payload from Voiceflow:", orderPayload);

    if (!orderPayload || !Array.isArray(orderPayload.items) || orderPayload.items.length === 0) {
        console.error("Invalid or empty order payload received.");
        toast({ title: "Order Error", description: "Received an invalid order from voice assistant.", variant: "destructive" });
        return;
    }

    try {
      console.log("Sending order to API:", orderPayload);
      const response = await fetch('/api/voice-order', { // Ensure API path is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // IMPORTANT: Send the payload in the structure the API expects: { items: [...] }
        body: JSON.stringify({ items: orderPayload.items }),
      });

      const responseData = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        // Handle API errors (like 400 Bad Request, 500 Server Error)
        console.error('API Error Response:', responseData);
        toast({
            title: "API Error",
            description: `Failed to add items via voice: ${responseData.error || `Status ${response.status}`}`,
            variant: "destructive",
        });
        return;
      }

      // API call was successful (200 OK)
      if (responseData.success && Array.isArray(responseData.cartItems)) {
        console.log('API successful, adding items to client cart:', responseData.cartItems);

        // Add each validated item from the API response to the client-side cart
        responseData.cartItems.forEach((item: ApiCartItem) => {
          // Call addItem multiple times if quantity > 1, as addItem typically handles adding one at a time
          for (let i = 0; i < item.quantity; i++) {
            addItem({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              category: item.category,
            });
          }
          console.log(`Added ${item.quantity} x ${item.name} to cart context.`);
        });

        // Show success feedback
        toast({
            title: "Items Added!",
            description: `${responseData.cartItems.length} item(s) from your voice order have been added to the cart.`,
        });
        // Optionally open the cart drawer after adding items
        // openCart(); // You might need to import openCart from useCart if you haven't
      } else {
         console.error('API response format incorrect:', responseData);
         toast({ title: "API Error", description: "Received an unexpected response from the server.", variant: "destructive" });
      }

    } catch (error) {
      // Handle network errors (fetch itself failed)
      console.error('Network or Fetch Error:', error);
      toast({ title: "Network Error", description: "Could not connect to the server to add items.", variant: "destructive" });
    }
  };

  // --- Integration with Voiceflow ---
  // This useEffect is a PLACEHOLDER. Replace it with your actual
  // method of receiving data from the Voiceflow widget.
  useEffect(() => {
    // Example: Listening for a custom event dispatched by Voiceflow's JS
    const handleVoiceflowData = (event: CustomEvent<VoiceflowPayload>) => {
        if (event.detail && event.detail.items) {
             processVoiceOrder(event.detail);
        }
    };

    window.addEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);

    // Example: Simulating receiving an order after 5 seconds for testing
    const timer = setTimeout(() => {
        console.log("Simulating voice order received...");
        const simulatedOrder: VoiceflowPayload = {
            items: [
                { itemId: "10", name: "بيتزا مخصوص", price: 55, quantity: 1 }, // Ensure price matches roughly or API will warn
                { itemId: "8", name: "عصير جزر", price: 15, quantity: 2 }    // Ensure price matches roughly or API will warn
            ]
        };
       // processVoiceOrder(simulatedOrder); // Uncomment to test simulation
    }, 5000);


    return () => {
      // Cleanup: remove listeners and timers
      window.removeEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);
      clearTimeout(timer);
    };
  }, [addItem]); // Add addItem to dependency array


  return null; // This component might not render anything visible
}