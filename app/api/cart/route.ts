import { NextResponse } from 'next/server';

interface CartItemPayload {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  // Add any other fields you expect from the frontend
}

// Handles POST requests to /api/cart
export async function POST(req: Request) {
  try {
    // Parse the incoming request body (the JSON data you send from Postman)
    const body = await req.json();

    // Validate the payload (make sure required fields are present)
    const { itemId, name, price, quantity } = body as CartItemPayload;
    if (!itemId || !name || price === undefined || quantity === undefined || quantity <= 0) {
      console.error("Invalid item data received:", body);
      return NextResponse.json({ error: 'Invalid item data provided' }, { status: 400 });
    }

    // --- Server-Side Logic Placeholder ---
    // This is where you would normally save the cart data (e.g., to a database or session)
    // For now, we'll just log it to the console to confirm it's received.
    console.log(`✅ Received item via API: ${quantity}x ${name} (ID: ${itemId}, Price: ${price})`);
    // --- End Placeholder ---

    // Respond with success
    return NextResponse.json(
      {
        message: `${name} processed successfully via API.`,
        receivedItem: { itemId, name, price, quantity }, // Echo back the received item
      },
      { status: 200 } // OK status
    );

  } catch (error) {
    console.error('❌ Error processing /api/cart request:', error);
    if (error instanceof SyntaxError) {
        // Error parsing JSON
        return NextResponse.json({ error: 'Invalid JSON payload provided' }, { status: 400 });
    }
    // General server error
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// You can add GET, PUT, DELETE functions here later if needed
// export async function GET(req: Request) { ... }