// app/api/cart/add-voice-order/route.ts
import { NextResponse } from 'next/server';
import { fetchMenuData, type MenuItem } from '@/lib/menu-data'; // Assuming you can reuse this

interface VoiceOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

// Helper to find full item details (replace with your actual data fetching/lookup)
async function findMenuItemDetails(itemId: string, name: string): Promise<MenuItem | null> {
  try {
    // Fetch all menu data (consider caching this if performance is an issue)
    const categories = await fetchMenuData();
    for (const category of categories) {
      const items = category.items || category.level2Categories?.flatMap(l2 => l2.items || []) || [];
      const foundItem = items.find(item => item.id === itemId || item.name === name);
      if (foundItem) {
        return foundItem;
      }
    }
    return null; // Not found
  } catch (error) {
    console.error("Error fetching menu data for lookup:", error);
    return null;
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const voiceOrderItems: VoiceOrderItem[] = body.items; // Assuming Voiceflow sends { "items": [...] }

    if (!Array.isArray(voiceOrderItems) || voiceOrderItems.length === 0) {
      return NextResponse.json({ error: 'Invalid order format or empty order' }, { status: 400 });
    }

    const enrichedCartItems = [];
    let validationFailed = false;

    for (const voiceItem of voiceOrderItems) {
      // Validate basic structure
      if (!voiceItem.itemId || !voiceItem.name || typeof voiceItem.price !== 'number' || typeof voiceItem.quantity !== 'number' || voiceItem.quantity <= 0) {
         console.warn('Invalid item structure received:', voiceItem);
         validationFailed = true;
         continue; // Skip invalid items or handle error differently
      }

      // Find full item details to get image and category
      const menuItemDetails = await findMenuItemDetails(voiceItem.itemId, voiceItem.name);

      if (!menuItemDetails) {
          console.warn(`Menu item details not found for ID: ${voiceItem.itemId} or Name: ${voiceItem.name}`);
          // Decide how to handle: skip, use placeholders, or fail validation
          // Using placeholders for now:
          enrichedCartItems.push({
              id: voiceItem.itemId, // Use itemId as id
              name: voiceItem.name,
              price: voiceItem.price,
              quantity: voiceItem.quantity,
              image: '/placeholder.svg', // Placeholder image
              category: 'Unknown', // Placeholder category
          });
      } else {
         // Ensure price matches, or handle discrepancies if needed
         if (menuItemDetails.price !== voiceItem.price) {
            console.warn(`Price mismatch for item ${voiceItem.name}. Voiceflow: ${voiceItem.price}, MenuData: ${menuItemDetails.price}. Using MenuData price.`);
         }
         enrichedCartItems.push({
              id: menuItemDetails.id, // Use the ID from menu-data
              name: menuItemDetails.name,
              price: menuItemDetails.price, // Use price from menu-data as source of truth
              quantity: voiceItem.quantity,
              image: menuItemDetails.image || '/placeholder.svg', // Use image from menu-data
              category: menuItemDetails.category || 'Unknown', // Use category from menu-data
          });
      }
    }

     if (validationFailed && enrichedCartItems.length === 0) {
        return NextResponse.json({ error: 'All items in the order were invalid' }, { status: 400 });
    }

    // You could potentially save this enriched order somewhere server-side if needed

    // Return the processed items - Voiceflow might use this response
    return NextResponse.json({ success: true, cartItems: enrichedCartItems }, { status: 200 });

  } catch (error) {
    console.error('Error processing voice order:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process order', details: message }, { status: 500 });
  }
}