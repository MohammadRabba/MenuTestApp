// app/api/menu/route.ts
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { fetchMenuDataRaw } from "@/lib/menu-data";
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
  tags?: string[];
  rating?: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface Level2Category {
  id: string;
  name: string;
  color: string;
  img: string;
  but_mast_id: string;
  items: MenuItem[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  tagline?: string;
  items?: MenuItem[];
  level2Categories?: Level2Category[];
  color?: string;
}

const CACHE_KEY = "menuData";
const CACHE_TTL = 3600; // seconds

export async function GET() {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log("✅ Cache hit");
      return NextResponse.json(JSON.parse(cached) as Category[]);
    }

    const data = await fetchMenuDataRaw();

    await redis.set(CACHE_KEY, JSON.stringify(data), {
      EX: CACHE_TTL,
    });

    console.log("✅ Data fetched and cached");
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
