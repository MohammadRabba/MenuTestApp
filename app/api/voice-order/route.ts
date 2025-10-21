// app/api/cart/add-voice-order/route.ts
import { NextResponse } from 'next/server';
import { fetchMenuData, type MenuItem } from '@/lib/menu-data'; //

interface VoiceOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

// Helper function remains the same...
async function findMenuItemDetails(itemId: string, name: string): Promise<MenuItem | null> {
  try {
    const categories = await fetchMenuData(); //
    for (const category of categories) {
      const items = category.items || category.level2Categories?.flatMap(l2 => l2.items || []) || [];
      // Looser matching for debugging: check ID first, then case-insensitive name
      const foundItem = items.find(item =>
         item.id === itemId ||
         (name && item.name.toLowerCase() === name.toLowerCase())
      );
      if (foundItem) {
        return foundItem;
      }
    }
    console.warn(`[API] Item not found - ID: ${itemId}, Name: ${name}`);
    return null;
  } catch (error) {
    console.error("[API] Error in findMenuItemDetails:", error);
    return null;
  }
}


export async function POST(request: Request) {
  // --- Check 1: Log that the request was received ---
  console.log('[API] Received POST request on /api/cart/add-voice-order');

  try {
    // --- Check 2: Log the raw body text before parsing ---
    // Cloning is necessary to read the body twice (once as text, once as JSON)
    const rawText = await request.clone().text();
    console.log('[API] Raw request body text:', rawText);

    // --- Check 3: Log the parsed JSON body ---
    const body = await request.json();
    console.log('[API] Parsed request body:', JSON.stringify(body, null, 2)); // Pretty print JSON

    // --- Check 4: Log the extracted 'items' array ---
    const voiceOrderItems: VoiceOrderItem[] = body.items;
    console.log('[API] Extracted voiceOrderItems:', JSON.stringify(voiceOrderItems, null, 2));

    if (!Array.isArray(voiceOrderItems) || voiceOrderItems.length === 0) {
       console.warn('[API] Validation Failed: voiceOrderItems is not a non-empty array.');
      return NextResponse.json({ error: 'Invalid order format or empty order' }, { status: 400 });
    }

    const enrichedCartItems = [];
    let validationFailed = false;

    for (const voiceItem of voiceOrderItems) {
      // --- Check 5: Log each item being processed ---
      console.log(`[API] Processing voiceItem: ${JSON.stringify(voiceItem)}`);

      if (!voiceItem.itemId || !voiceItem.name || typeof voiceItem.price !== 'number' || typeof voiceItem.quantity !== 'number' || voiceItem.quantity <= 0) {
         console.warn('[API] Invalid item structure:', voiceItem);
         validationFailed = true;
         continue;
      }

      const menuItemDetails = await findMenuItemDetails(voiceItem.itemId, voiceItem.name);

      // --- Check 6: Log the result of finding item details ---
      if (!menuItemDetails) {
          console.warn(`[API] Menu item details not found for ID: ${voiceItem.itemId} or Name: ${voiceItem.name}. Using placeholders.`);
          enrichedCartItems.push({
              id: voiceItem.itemId,
              name: voiceItem.name,
              price: voiceItem.price,
              quantity: voiceItem.quantity,
              image: '/placeholder.svg', //
              category: 'Unknown',
          });
      } else {
         console.log(`[API] Found menuItemDetails: ${JSON.stringify(menuItemDetails)}`);
         if (menuItemDetails.price !== voiceItem.price) {
            console.warn(`[API] Price mismatch for item ${voiceItem.name}. Voiceflow: ${voiceItem.price}, MenuData: ${menuItemDetails.price}. Using MenuData price.`);
         }
         enrichedCartItems.push({
              id: menuItemDetails.id,
              name: menuItemDetails.name,
              price: menuItemDetails.price,
              quantity: voiceItem.quantity,
              image: menuItemDetails.image || '/placeholder.svg', //
              category: menuItemDetails.category || 'Unknown',
          });
      }
    } // End for loop

     if (validationFailed && enrichedCartItems.length === 0) {
        console.error('[API] Validation Failed: All items were invalid.');
        return NextResponse.json({ error: 'All items in the order were invalid' }, { status: 400 });
    }

    // --- Check 7: Log the final enriched items before sending response ---
    console.log('[API] Final enrichedCartItems:', JSON.stringify(enrichedCartItems, null, 2));

    return NextResponse.json({ success: true, cartItems: enrichedCartItems }, { status: 200 });

  } catch (error) {
    // --- Check 8: Log any errors during processing ---
    console.error('[API] Error in POST handler:', error);
    // Check if it's a JSON parsing error specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('[API] JSON Parsing Error Detail:', error.message);
         return NextResponse.json({ error: 'Failed to process order', details: `Malformed JSON received: ${error.message}` }, { status: 400 }); // Return 400 for bad JSON
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process order', details: message }, { status: 500 });
  }
}