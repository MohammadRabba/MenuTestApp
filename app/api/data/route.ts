import { NextResponse } from "next/server";

async function fetchPosMenu() {
  const webSite = "https://test.hesabate.com"; 
  const token = "Vmc2QUhQak9WOGFoOGtmNXp5cEo4L3g4MHBmZE5uSGdKbk9LcnU0ZDdOWUZhRytna1BaTmxRSThEUEhLTWd3aTRUVk9acXlKK0hOWGQvKzFMbzJnRVNQOFBLZ2piWTZPakpUNEd2RVFqdVE9"; 
  const url = '${webSite}/store_api.php';


 

  const form = new URLSearchParams({
    token,
    action: "download",
    type: "posmenu",
  });

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
     next: { revalidate: 3600 },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: `Failed to reach POS API: ${e?.message || "network error"}`,
        url,
      },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  try {
    const data = JSON.parse(text);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream error", status: upstream.status, data },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch {
    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "Upstream non-JSON response",
          status: upstream.status,
          body: text,
        },
        { status: 502 }
      );
    }
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    return await fetchPosMenu();
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    return await fetchPosMenu();
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
