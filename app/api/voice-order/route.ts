// app/api/cart/add-voice-order/route.ts
import { NextResponse } from 'next/server';
import { fetchMenuData, type MenuItem } from '@/lib/menu-data'; // Assuming you can reuse this

interface VoiceOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

// Helper to find full item details (Keep this function as is)
async function findMenuItemDetails(itemId: string, name: string): Promise<MenuItem | null> {
  try {
    const categories = await fetchMenuData();
    for (const category of categories) {
      const items = category.items || category.level2Categories?.flatMap(l2 => l2.items || []) || [];
      // Prioritize matching by ID, then by name as a fallback
      const foundItem = items.find(item => item.id === itemId) || items.find(item => item.name === name);
      if (foundItem) {
        return foundItem;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching menu data for lookup:", error);
    return null;
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Ensure the expected structure { "items": [...] }
    const voiceOrderItems: VoiceOrderItem[] = body.items;

    if (!Array.isArray(voiceOrderItems) || voiceOrderItems.length === 0) {
      return NextResponse.json({ error: 'Invalid order format or empty order. Expected { "items": [...] }' }, { status: 400 });
    }

    const enrichedCartItems = [];
    let validationFailed = false;

    for (const voiceItem of voiceOrderItems) {
      if (!voiceItem.itemId || !voiceItem.name || typeof voiceItem.price !== 'number' || typeof voiceItem.quantity !== 'number' || voiceItem.quantity <= 0) {
       console.warn('Invalid item structure received:', voiceItem);
       validationFailed = true;
       continue; // Skip invalid items
      }

      const menuItemDetails = await findMenuItemDetails(voiceItem.itemId, voiceItem.name);

      if (!menuItemDetails) {
        console.warn(`Menu item details not found for ID: ${voiceItem.itemId} or Name: ${voiceItem.name}. Skipping item.`);
         validationFailed = true; // Consider if not finding an item is a failure
         continue; // Skip items not found in the menu data
      } else {
        // Optional: Price check (using menu data price as source of truth)
        if (menuItemDetails.price !== voiceItem.price) {
         console.warn(`Price mismatch for item ${voiceItem.name}. Voiceflow: ${voiceItem.price}, MenuData: ${menuItemDetails.price}. Using MenuData price.`);
        }

        enrichedCartItems.push({
            id: menuItemDetails.id, // Use the canonical ID from your data
            name: menuItemDetails.name,
            price: menuItemDetails.price, // Use price from your data
            quantity: voiceItem.quantity,
            image: menuItemDetails.image || '/placeholder.svg',
            category: menuItemDetails.category || 'Unknown', // Use category from your data
        });
      }
    }

     // If any validation failed *and* no valid items were processed, return an error.
     // If some items failed but others succeeded, proceed with the valid ones.
    if (validationFailed && enrichedCartItems.length === 0) {
       return NextResponse.json({ error: 'All items in the order were invalid or not found' }, { status: 400 });
    }

    // Return the successfully processed items
    // The client (e.g., Voiceflow integration) will use this response
    return NextResponse.json({ success: true, cartItems: enrichedCartItems }, { status: 200 });

  } catch (error) {
    console.error('Error processing voice order:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process order', details: message }, { status: 500 });
  }
}