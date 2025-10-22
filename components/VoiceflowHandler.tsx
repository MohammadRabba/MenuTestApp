// components/VoiceflowHandler.tsx
"use client";

import { useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { toast } from "@/hooks/use-toast";

interface ApiCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

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
    console.log("🎯 processVoiceOrder called with:", orderPayload);

    if (!orderPayload || !Array.isArray(orderPayload.items) || orderPayload.items.length === 0) {
        console.error("❌ Invalid or empty order payload received.");
        toast({ 
          title: "Order Error", 
          description: "Received an invalid order from voice assistant.", 
          variant: "destructive" 
        });
        return;
    }

    try {
      console.log("📤 Sending order to API /api/voice-order");
      const response = await fetch('/api/voice-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderPayload.items }),
      });

      const responseData = await response.json();
      console.log("📥 API Response:", responseData);

      if (!response.ok) {
        console.error('❌ API Error Response:', response.status, responseData);
        toast({
            title: "API Error",
            description: `Failed to process voice order: ${responseData.error || `Server responded with status ${response.status}`}`,
            variant: "destructive",
        });
        return;
      }

      if (responseData.success && Array.isArray(responseData.cartItems)) {
        console.log('✅ API successful, adding items to client cart:', responseData.cartItems);

        responseData.cartItems.forEach((item: ApiCartItem) => {
          console.log(`🔄 Processing item: ${item.name}, Quantity: ${item.quantity}`);
          
          const itemToAdd = {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
          };

          for (let i = 0; i < item.quantity; i++) {
            console.log(`➕ Adding item ${i + 1}/${item.quantity}: ${item.name} (ID: ${item.id})`);
            addItem(itemToAdd);
          }
        });

        const totalQuantityAdded = responseData.cartItems.reduce(
          (sum: number, item: ApiCartItem) => sum + item.quantity, 
          0
        );

        console.log(`✅ Total items added to cart: ${totalQuantityAdded}`);

        toast({
            title: "Items Added! 🎉",
            description: `${totalQuantityAdded} item(s) from your voice order added to the cart.`,
        });

        setTimeout(() => {
          console.log("🛒 Opening cart drawer");
          openCart();
        }, 300);

      } else {
         console.error('❌ API response format incorrect:', responseData);
         toast({ 
           title: "API Response Error", 
           description: "Received an unexpected response format from the server.", 
           variant: "destructive" 
         });
      }

    } catch (error) {
      console.error('❌ Network or Fetch Error:', error);
      toast({ 
        title: "Network Error", 
        description: "Could not connect to the server or process the response.", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    console.log("🎬 VoiceflowHandler mounted - Setting up listeners");

    // Handler for custom event
    const handleVoiceflowData = (event: CustomEvent<VoiceflowPayload>) => {
      console.log("🎉 RECEIVED 'voiceflowOrderReady' event!");
      console.log("📦 Event detail:", event.detail);
      
      if (event.detail && Array.isArray(event.detail.items)) {
        processVoiceOrder(event.detail);
      } else {
        console.warn("⚠️ Voiceflow event data has unexpected format:", event.detail);
        toast({ 
          title: "Voiceflow Error", 
          description: "Received incorrectly formatted data from voice assistant.", 
          variant: "destructive"
        });
      }
    };

    // Handler for postMessage from Voiceflow iframe
    const handlePostMessage = (event: MessageEvent) => {
      console.log("📬 PostMessage received from:", event.origin);
      console.log("📬 PostMessage data:", event.data);
      
      // Check if it's a Voiceflow order message
      if (event.data && event.data.type === 'voiceflow-order' && event.data.items) {
        console.log("🎯 Voiceflow order detected via postMessage");
        
        const payload: VoiceflowPayload = {
          items: event.data.items
        };
        
        processVoiceOrder(payload);
      }
    };

    // Add event listeners
    window.addEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);
    window.addEventListener('message', handlePostMessage);
    console.log("✅ Event listeners added");

    // Cleanup
    return () => {
      console.log("🧹 VoiceflowHandler unmounting - Removing event listeners");
      window.removeEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);
      window.removeEventListener('message', handlePostMessage);
    };
  }, []); // Empty dependency array

  return null;
}