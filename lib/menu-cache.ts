import { redis } from "@/lib/redis";
import { fetchMenuDataRaw } from "./menu-data";
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
const CACHE_TTL = 3600; // 1 hour

export async function fetchMenuData(): Promise<Category[]> {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log("✅ Returning menu data from Redis");
      return JSON.parse(cached);
    }

    const data = await fetchMenuDataRaw();

    if (data.length > 0) {
      await redis.set(CACHE_KEY, JSON.stringify(data), { EX: CACHE_TTL });
      console.log("✅ Cached new menu data in Redis");
    }

    return data;
  } catch (error) {
    console.error("❌ Failed to get or cache menu data:", error);
    return [];
  }
}