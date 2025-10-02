import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

interface SheetData {
  dishName: string;
  price: number;
  category: string;
}

export async function POST(request: Request) {
  try {
    // Validate request data
    const data: SheetData = await request.json();
    const { dishName, price, category } = data;

    if (!dishName || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Load and validate credentials
    const credentials = {
      email: "testmenu@testmenu-472918.iam.gserviceaccount.com",
      key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDK13qO4d8lKwuQ\nwFLIMknYNyj9KT+6VR2lI2CdMFzJ1SOUT333B3G7NktGr1AXia1kv8aIdKjYgbhE\nnmnD4va7lUZd3hKxNNG97ha7QUWXDEwB0UvNIP32Z6uNsETLaqyn4tM6xhQXwCCQ\n70U+XHUUPKJ1lI8tToO8IN713RJfYnVdSITNQfyoxPxrXfxaaK24z7hFVycd8C3p\nZX6ScjMlsUc6uSzKgd9COD/WOLebnCoMOAnEMpm37OwNgO7WANKWCUWcsZ5CFEEH\nCUgNPEoMxYGeQvrsK1a+jRtBCZGHHaL6xg05+uZ+Eq6nWzNgYZ0HeecRnkUPzyp1\nhIxavcy3AgMBAAECggEAUQQ/r1IIDpBizi4C4nMzi2h8tqEDEylr7clzjVUDupmm\n3FXjugb/JgdJibH8C2qyFsuCQH5X8iHdt4qOM+8zHTlCIbvRO3YdT/8IlUI8yVfg\nA9nUrNnAlepSWwVMdPLmgyfVtmPnIpVabIkk3wOOv8Z4HP55MV9qvnlilFD4RaAW\nxXPh17SupQR1NVLyte/TzKbgM/YSbYya7MHN8ltmq+KSsMRVBGRRlddwvXni/OAo\nyKMXR63c55xmi+yFW99bt0ubZvkgJ+hu+k0ge1n5ForKTXD4aSIW2n5wcI2OeoBv\nf35viJFKIwSP7QvbyS+mtUjbOJFZkdpz+WCcZSZoAQKBgQD8VHhYnnwpNwIjqqLY\nN8EkSKQHXlo/9RSjsF+55g/MPvpWL2roAjJ52bV3DiAvglHCos63Ag4A/OVzlQAS\n13Z5KC1wnrwgSW/3zau4ypOkfBm1QL6hi5mqWd0l6wm2uBJU+HnN2IXe5KpQ9kQ+\nVzxON956NSLgWFcEZHT1GWMxcQKBgQDNyr5DOnHkF8FWn3pHucnd+Kww8+oQHypS\nlMBX4S7U/ch7LsIBuVpynA+NHW32+fbJ6Fs9r1CtzT8J6jvW56X40P6zUuIE2KLP\ndN2cUlxl33+ps/CTVQsZ9lFWhPZ5tnzPkw+zG1iuNR4CctooJ7QspnUVOA5Odx31\nrVa7gItMpwKBgQDr+W8GqUhCHwBwLH7YJ+QHM6u6fGF4WJFxt1r+dgmmH+trODMJ\nQCzGSXRsH5i39W7S0ADzowdHozpNyjVkaX2RNqKwJLKYmzUMEJqcWU6Tz78XA7KD\nTxNo/VtUv6a46xGxxyHaALjJRx2EU5pklp5+I796mEDCf7r5D51VLeXW8QKBgEs0\ngl9zJlfizobndPptTPZPgC3LlYgau46+SaRT6Jdxvyg1KDUVFZa4rX42eQ8+vg9/\nWIisXuGFFjp7XS7mLONHDS1fZrW6rZT+8lXES3v3N2I/HfXZqFruhz8FDEXiiK4a\n4ivkHH5dbwAaFNuD1vZSRotglunZ4hr8I6wWB9IVAoGBAIa7o6VWtbVKwVpvrbsd\nPdI5Fmz8jXWEMft/SLr4bFINDX0UeVXWD9ee8c+v1l8DtaXQOI+m7x18dNF13ReU\ncE/UJHnC2luNJ07Cf+KWHsSKyg8jzik1R1Z+7ONmDTtkbE/Gvsv1hzjDvgUOadcT\nm86H7FeNhc1B8oKDJhoIdIpq\n-----END PRIVATE KEY-----\n",
      sheetId: "10ghYn5ql_7OQWlsIfwurZIKauUMIyAZApmLcFGVyL8w"
    };

    if (!credentials.email || !credentials.key || !credentials.sheetId) {
      console.error('Missing environment variables');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize the sheet with JWT auth
    const doc = new GoogleSpreadsheet(credentials.sheetId, new JWT({
      email: credentials.email,
      key: credentials.key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    }));

    // Load document and get first sheet
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    if (!sheet) {
      throw new Error('Sheet not found');
    }

    // Add row with validation
    const newRow: GoogleSpreadsheetRow = await sheet.addRow({
      dish_name: dishName.trim(),
      price: Number(price),
      category: category.trim(),
      timestamp: new Date().toISOString()
    });

    if (!newRow) {
      throw new Error('Failed to add row');
    }
    return NextResponse.json({
      message: "Data saved successfully",
      rowNumber: newRow.rowNumber
    });

  } catch (error) {
    console.error('Error saving to Google Sheet:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to save data", details: message },
      { status: 500 }
    );
  }
}