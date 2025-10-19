import { redis } from "@/lib/redis";
import { fetchMenuDataRaw, Category } from "@/lib/menu-data";

const CACHE_KEY = "menuData";
const CACHE_TTL = 3600; // 1 hour in seconds

export async function fetchMenuData(): Promise<Category[]> {
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    console.log("✅ Returning menu data from Redis");
    return JSON.parse(cached);
  }

  const data = await fetchMenuDataRaw();

  await redis.set(CACHE_KEY, JSON.stringify(data), {
    EX: CACHE_TTL,
  });

  console.log("✅ Menu data fetched from API and cached");
  return data;
}
