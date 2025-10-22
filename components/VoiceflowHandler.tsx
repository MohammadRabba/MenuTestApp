// components/VoiceflowHandler.tsx

"use client";

import { useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { toast } from "@/hooks/use-toast"; // For user feedback

// Interface for items coming *from* the API
interface ApiCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number; // API response includes quantity
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
  // Get addItem and openCart from the context
  const { addItem, openCart } = useCart(); // Make sure openCart is exported from CartProvider if you use it

  const processVoiceOrder = async (orderPayload: VoiceflowPayload) => {
    console.log("Received order payload from Voiceflow:", orderPayload);

    // Validate the incoming payload structure
    if (!orderPayload || !Array.isArray(orderPayload.items) || orderPayload.items.length === 0) {
        console.error("Invalid or empty order payload received.");
        toast({ title: "Order Error", description: "Received an invalid order from voice assistant.", variant: "destructive" });
        return;
    }

    try {
      console.log("Sending order to API /api/voice-order with body:", { items: orderPayload.items });
      const response = await fetch('/api/voice-order', { // Ensure API path matches your file structure
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send data wrapped in the "items" key as expected by the API
        body: JSON.stringify({ items: orderPayload.items }),
      });

      // Attempt to parse the JSON response body, regardless of status code initially
      const responseData = await response.json();

      if (!response.ok) {
        // Handle HTTP errors (e.g., 400, 500)
        console.error('API Error Response:', response.status, responseData);
        toast({
            title: "API Error",
            description: `Failed to process voice order: ${responseData.error || `Server responded with status ${response.status}`}`,
            variant: "destructive",
        });
        return;
      }

      // --- Success Handling (response.ok is true) ---
      if (responseData.success && Array.isArray(responseData.cartItems)) {
        console.log('API successful, adding items to client cart:', responseData.cartItems);

        // --- Loop through API response and call addItem ---
        responseData.cartItems.forEach((item: ApiCartItem) => {
          // Prepare the item data structure for the addItem function
          // It expects Omit<CartItem, "quantity">
          const itemToAdd = {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
          };

          // Call addItem repeatedly based on the quantity from the API response.
          // The cartReducer handles incrementing the quantity if the item already exists.
          for (let i = 0; i < item.quantity; i++) {
            addItem(itemToAdd);
          }
          console.log(`Called addItem ${item.quantity} time(s) for ${item.name} (ID: ${item.id})`);
        });
        // --- End of loop ---

        // Calculate total quantity added for the toast message
        const totalQuantityAdded = responseData.cartItems.reduce((sum: number, item: ApiCartItem) => sum + item.quantity, 0); // Added type annotation

        toast({
            title: "Items Added!",
            description: `${totalQuantityAdded} item(s) from your voice order added to the cart.`,
        });

        // Optionally open the cart drawer to show the newly added items
        openCart(); // Call openCart from the context

      } else {
         // Handle cases where response.ok is true, but the data structure isn't as expected
         console.error('API response format incorrect or success flag is false:', responseData);
         toast({ title: "API Response Error", description: "Received an unexpected success response format from the server.", variant: "destructive" });
      }

    } catch (error) {
      // Handle network errors (e.g., fetch failed to connect) or JSON parsing errors
      console.error('Network or Fetch/JSON Parsing Error:', error);
      toast({ title: "Network Error", description: "Could not connect to the server or process the response.", variant: "destructive" });
    }
  };

  // --- Integration with Voiceflow ---
  // IMPORTANT: This useEffect block contains example integration logic.
  // You MUST replace it with the specific method Voiceflow provides for sending data
  // from the widget to your web page's JavaScript environment (e.g., custom events, callbacks).
  useEffect(() => {
    // Example: Listening for a custom event named 'voiceflowOrderReady'
    const handleVoiceflowData = (event: CustomEvent<VoiceflowPayload>) => {
      console.log("Received 'voiceflowOrderReady' event detail:", event.detail);
      // Basic check if the event detail looks like our expected payload
      if (event.detail && Array.isArray(event.detail.items)) {
        processVoiceOrder(event.detail);
      } else {
        console.warn("Voiceflow event data received, but format is unexpected or missing 'items' array:", event.detail);
        toast({ title: "Voiceflow Error", description: "Received incorrectly formatted data from voice assistant.", variant: "destructive"});
      }
    };

    console.log("VoiceflowHandler: Adding event listener for 'voiceflowOrderReady'");
    // Ensure the event name 'voiceflowOrderReady' matches exactly what Voiceflow is configured to dispatch.
    window.addEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);

    // --- Example Simulation (for testing without Voiceflow) ---
    // const timer = setTimeout(() => {
    //     console.log("Simulating voice order received...");
    //     const simulatedOrder: VoiceflowPayload = {
    //         items: [
    //             // Make sure itemId, price match items in your menu-data.ts for successful lookup in the API
    //             { itemId: "8322", name: "شاي", price: 3, quantity: 2 },
    //             { itemId: "10", name: "بيتزا مخصوص", price: 55, quantity: 1 }
    //         ]
    //     };
    //    processVoiceOrder(simulatedOrder); // Uncomment this line to test the flow
    // }, 7000); // Trigger after 7 seconds
    // --- End Simulation ---

    // Cleanup function: Remove the event listener when the component unmounts
    return () => {
      console.log("VoiceflowHandler: Removing event listener for 'voiceflowOrderReady'");
      window.removeEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);
      // clearTimeout(timer); // Clear timeout if using simulation
    };
    // Dependencies for useEffect: Functions from context that are used inside.
  }, [addItem, openCart]);


  // This component typically doesn't render any visible UI itself.
  // It acts as a listener and handler in the background.
  return null;
}