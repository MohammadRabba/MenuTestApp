// components/VoiceflowHandler.tsx

"use client";

import { useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { toast } from "@/hooks/use-toast";

// Interface for items coming *from* the API
interface ApiCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

// Interface for the payload expected *by* the API (sent from Voiceflow/client)
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
  const { addItem, openCart } = useCart();

  const processVoiceOrder = async (orderPayload: VoiceflowPayload) => {
    console.log("Received order payload from Voiceflow:", orderPayload);

    if (!orderPayload || !Array.isArray(orderPayload.items) || orderPayload.items.length === 0) {
        console.error("Invalid or empty order payload received.");
        toast({ 
          title: "Order Error", 
          description: "Received an invalid order from voice assistant.", 
          variant: "destructive" 
        });
        return;
    }

    try {
      console.log("Sending order to API /api/voice-order with body:", { items: orderPayload.items });
      const response = await fetch('/api/voice-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderPayload.items }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', response.status, responseData);
        toast({
            title: "API Error",
            description: `Failed to process voice order: ${responseData.error || `Server responded with status ${response.status}`}`,
            variant: "destructive",
        });
        return;
      }

      // --- Success Handling ---
      if (responseData.success && Array.isArray(responseData.cartItems)) {
        console.log('API successful, adding items to client cart:', responseData.cartItems);

        // --- FIXED: Loop through and add items properly ---
        responseData.cartItems.forEach((item: ApiCartItem) => {
          console.log(`Processing item: ${item.name}, Quantity: ${item.quantity}`);
          
          // Prepare the item data for addItem (without quantity)
          const itemToAdd = {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
          };

          // Call addItem multiple times based on quantity
          // Each call adds quantity of 1, so we loop item.quantity times
          for (let i = 0; i < item.quantity; i++) {
            console.log(`Adding item ${i + 1}/${item.quantity}: ${item.name}`);
            addItem(itemToAdd);
          }
        });
        // --- End of fixed loop ---

        const totalQuantityAdded = responseData.cartItems.reduce(
          (sum: number, item: ApiCartItem) => sum + item.quantity, 
          0
        );

        console.log(`Total items added to cart: ${totalQuantityAdded}`);

        toast({
            title: "Items Added!",
            description: `${totalQuantityAdded} item(s) from your voice order added to the cart.`,
        });

        // Open the cart to show the newly added items
        setTimeout(() => {
          openCart();
        }, 500); // Small delay to ensure cart updates first

      } else {
         console.error('API response format incorrect or success flag is false:', responseData);
         toast({ 
           title: "API Response Error", 
           description: "Received an unexpected success response format from the server.", 
           variant: "destructive" 
         });
      }

    } catch (error) {
      console.error('Network or Fetch/JSON Parsing Error:', error);
      toast({ 
        title: "Network Error", 
        description: "Could not connect to the server or process the response.", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    const handleVoiceflowData = (event: CustomEvent<VoiceflowPayload>) => {
      console.log("Received 'voiceflowOrderReady' event detail:", event.detail);
      
      if (event.detail && Array.isArray(event.detail.items)) {
        processVoiceOrder(event.detail);
      } else {
        console.warn("Voiceflow event data received, but format is unexpected or missing 'items' array:", event.detail);
        toast({ 
          title: "Voiceflow Error", 
          description: "Received incorrectly formatted data from voice assistant.", 
          variant: "destructive"
        });
      }
    };

    console.log("VoiceflowHandler: Adding event listener for 'voiceflowOrderReady'");
    window.addEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);

    // Cleanup
    return () => {
      console.log("VoiceflowHandler: Removing event listener for 'voiceflowOrderReady'");
      window.removeEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);
    };
  }, [addItem, openCart]);

  return null;
}