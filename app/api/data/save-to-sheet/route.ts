import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";
import credentials from "@/app/api/data/save-to-sheet/credentials.json";

// ✅ Make sure this matches your actual sheet name
const SHEET_NAME = "Menu";
const SPREADSHEET_ID = "10ghYn5ql_7OQWlsIfwurZIKauUMIyAZApmLcFGVyL8w";

export async function POST(req: Request) {
  const body = await req.json();
  const { dishName, price, category } = body;

  if (!dishName || !category) {
    return NextResponse.json({ error: "Missing required data" }, { status: 400 });
  }

  try {
    // ✅ Use JWT instead of deprecated GoogleAuth + fromJSON
    const authClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: authClient });

    // ✅ Check if item already exists
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:C`,
    });

    const rows = readRes.data.values || [];

    const alreadyExists = rows.some(
      (row) =>
        row[0]?.toLowerCase().trim() === dishName.toLowerCase().trim() &&
        row[1]?.toString().trim() === price.toString().trim() &&
        row[2]?.toLowerCase().trim() === category.toLowerCase().trim()
    );

    if (alreadyExists) {
      console.log("✅ Duplicate item skipped:", dishName);
      return NextResponse.json({ status: "skipped", message: "Item already exists" });
    }

    // ✅ Append new item
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dishName, price, category]],
      },
    });

    console.log("✅ Item added:", dishName);
    return NextResponse.json({ status: "success", message: "Item added" });
  } catch (err) {
    console.error("❌ Google Sheets API error:", err);
    return NextResponse.json({ error: "Failed to write to sheet" }, { status: 500 });
  }
}
