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

// Helper function to extract order from Voiceflow messages
function extractOrderFromVoiceflowSession(sessionData: any): VoiceflowPayloadItem[] | null {
  console.log("🔍 Extracting order from session data...");
  
  if (!sessionData?.session?.turns) {
    console.warn("⚠️ No turns found in session data");
    return null;
  }

  const turns = sessionData.session.turns;
  
  // Look for order confirmation in the latest messages
  for (let i = turns.length - 1; i >= 0; i--) {
    const turn = turns[i];
    
    if (turn.type === 'system' && turn.messages) {
      for (const message of turn.messages) {
        if (message.type === 'text' && message.text) {
          const text = message.text;
          
          // Check if this is an order confirmation message
          if (text.includes('تم تأكيد طلبك') || text.includes('ملخص الطلب')) {
            console.log("📋 Found order confirmation message:", text);
            
            // Parse the order from the text
            // Example: "2 × شاي = 6 ريال"
            const orderItems: VoiceflowPayloadItem[] = [];
            
            // Extract شاي (tea) order
            const teaMatch = text.match(/(\d+)\s*×\s*شاي/);
            if (teaMatch) {
              orderItems.push({
                itemId: '8322',
                name: 'شاي',
                price: 3,
                quantity: parseInt(teaMatch[1])
              });
            }
            
            // Extract قهوة (coffee) order
            const coffeeMatch = text.match(/(\d+)\s*×\s*قهوة/);
            if (coffeeMatch) {
              orderItems.push({
                itemId: '8323',
                name: 'قهوة',
                price: 5,
                quantity: parseInt(coffeeMatch[1])
              });
            }
            
            // Extract عصير رمان (pomegranate juice) order
            const pomMatch = text.match(/(\d+)\s*×\s*عصير رمان/);
            if (pomMatch) {
              orderItems.push({
                itemId: '8324',
                name: 'عصير رمان',
                price: 12,
                quantity: parseInt(pomMatch[1])
              });
            }
            
            // Extract عصير جزر (carrot juice) order
            const carrotMatch = text.match(/(\d+)\s*×\s*عصير جزر/);
            if (carrotMatch) {
              orderItems.push({
                itemId: '8325',
                name: 'عصير جزر',
                price: 10,
                quantity: parseInt(carrotMatch[1])
              });
            }
            
            if (orderItems.length > 0) {
              console.log("✅ Extracted order items:", orderItems);
              return orderItems;
            }
          }
        }
        
        // Also check for END type message (order completed)
        if (message.type === 'END') {
          console.log("🏁 Order END signal detected, looking for previous order details...");
          // The order details should be in previous messages
        }
      }
    }
  }
  
  console.warn("⚠️ No order found in session data");
  return null;
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

     // داخل processVoiceOrder بعد التأكد من responseData.success
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

    // نمرّر الكمية كلها مرة واحدة
    addItem(itemToAdd, item.quantity);
  });

  const totalQuantityAdded = responseData.cartItems.reduce(
    (sum: number, item: ApiCartItem) => sum + item.quantity,
    0
  );

  console.log(`✅ Total items added to cart: ${totalQuantityAdded}`);

  toast({
    title: "Order Confirmed! 🎉",
    description: `${totalQuantityAdded} item(s) added to your cart.`,
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

    // Handler for custom event (from test button)
    const handleVoiceflowData = (event: CustomEvent<VoiceflowPayload>) => {
      console.log("🎉 RECEIVED 'voiceflowOrderReady' event!");
      console.log("📦 Event detail:", event.detail);
      
      if (event.detail && Array.isArray(event.detail.items)) {
        processVoiceOrder(event.detail);
      } else {
        console.warn("⚠️ Voiceflow event data has unexpected format:", event.detail);
      }
    };

    // Handler for postMessage from Voiceflow iframe
    const handlePostMessage = (event: MessageEvent) => {
      // Only log voiceflow-specific messages to reduce noise
      if (event.data?.type?.includes('voiceflow')) {
        console.log("📬 Voiceflow PostMessage:", event.data.type);
      }
      
      // Check for explicit order message
      if (event.data && event.data.type === 'voiceflow-order' && event.data.items) {
        console.log("🎯 Explicit voiceflow-order detected!");
        const payload: VoiceflowPayload = { items: event.data.items };
        processVoiceOrder(payload);
        return;
      }
      
      // Check for voiceflow:interact or voiceflow:save_session messages with order confirmation
      if (event.data?.type === 'voiceflow:interact' || event.data?.type === 'voiceflow:save_session') {
        const orderItems = extractOrderFromVoiceflowSession(event.data.payload);
        
        if (orderItems && orderItems.length > 0) {
          console.log("🎊 Order extracted from Voiceflow session!");
          const payload: VoiceflowPayload = { items: orderItems };
          processVoiceOrder(payload);
        }
      }
    };

    // Add event listeners
    window.addEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);
    window.addEventListener('message', handlePostMessage);
    console.log("✅ Event listeners added");

    // Cleanup
    return () => {
      console.log("🧹 VoiceflowHandler unmounting");
      window.removeEventListener('voiceflowOrderReady', handleVoiceflowData as EventListener);
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  return null;
}