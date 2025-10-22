// components/TestVoiceflowButton.tsx
"use client";

import { Button } from "@/components/ui/button";

export function TestVoiceflowButton() {
  const triggerTestOrder = () => {
    console.log("🧪 Test button clicked - Dispatching voiceflowOrderReady event");
    
    const testEvent = new CustomEvent('voiceflowOrderReady', {
      detail: {
        items: [
          {
            itemId: '8324',
            name: 'عصير رمان',
            price: 12,
            quantity: 1
          }
        ]
      }
    });
    
    window.dispatchEvent(testEvent);
    console.log("✅ Test event dispatched");
  };

  return (
    <Button 
      onClick={triggerTestOrder}
      className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700"
    >
      🧪 Test Voice Order
    </Button>
  );
}