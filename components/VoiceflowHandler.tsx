"use client";

import { useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/components/ui/use-toast";

interface ApiCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export default function VoiceflowHandler() {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    console.log("🎬 VoiceflowHandler mounted - Setting up listeners");

    const handleVoiceflowResponse = async (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      if (event.data.type === "voiceflow_order_response") {
        const responseData = event.data.data;
        console.log("📦 Voiceflow response received:", responseData);

        if (
          responseData &&
          responseData.success &&
          Array.isArray(responseData.cartItems)
        ) {
          console.log("✅ Processing items from API:", responseData.cartItems);

          responseData.cartItems.forEach((item: ApiCartItem) => {
            console.log(
              `🛒 Adding item: ${item.name}, quantity: ${item.quantity}`
            );

            const itemToAdd = {
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              category: item.category,
            };

            addItem(itemToAdd, item.quantity);
          });

          const totalAdded = responseData.cartItems.reduce(
            (sum: number, item: ApiCartItem) => sum + item.quantity,
            0
          );

          toast({
            title: "✅ Order Confirmed",
            description: `${totalAdded} item(s) added to your cart.`,
          });

          console.log("🧺 Opening cart drawer...");
          openCart();
        } else {
          console.warn(
            "⚠️ Voiceflow response missing or invalid format:",
            responseData
          );
        }
      }
    };

    window.addEventListener("message", handleVoiceflowResponse);

    console.log("✅ Event listeners added");

    return () => {
      window.removeEventListener("message", handleVoiceflowResponse);
      console.log("🧹 Event listeners removed");
    };
  }, [addItem, openCart, toast]);

  return null;
}
