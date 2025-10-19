import { redis } from "@/lib/redis";

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

// Constants
const CACHE_KEY = "menuData";
const CACHE_TTL = 3600; // 1 hour in seconds
const localImages = [
  "/pizza1.jpg",
  "/pizza2.jpg",
  "/cold-drinks.jpg",
  "/hot-drinks.jpg",
];

function getLocalImageUrl(index: number): string {
  return localImages[index % localImages.length];
}

export async function fetchMenuDataRaw(): Promise<Category[]> {
  try {
    const webSite = "https://test.hesabate.com"; 
    const token = "YOUR_TOKEN_HERE";

    const url = `${webSite}/store_api.php`;
    const formData = new URLSearchParams();
    formData.append("token", token);
    formData.append("action", "download");
    formData.append("type", "posmenu");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Origin: webSite,
      },
      body: formData.toString(),
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const rawData = await response.json();

    // نفس المعالجة السابقة...
    let categoriesArray: any[] = [];
    if (rawData?.table?.[0]) categoriesArray = rawData.table[0];
    else if (Array.isArray(rawData)) categoriesArray = rawData;
    else if (Array.isArray(rawData.categories)) categoriesArray = rawData.categories;
    else return [];

    let imageIndex = 0;

    const processedCategories: Category[] = categoriesArray.map((cat: any) => {
      if (cat.id === "1" && Array.isArray(cat.level2)) {
        const level2Categories: Level2Category[] = cat.level2.map((level2Cat: any) => ({
          id: level2Cat.id.toString(),
          name: level2Cat.name,
          color: level2Cat.color || "",
          img: level2Cat.img || "",
          but_mast_id: level2Cat.but_mast_id.toString(),
          items: (level2Cat.items || []).map((item: any): MenuItem => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description || "",
            price: item.price || 0,
            image: item.img || getLocalImageUrl(imageIndex++),
            category: cat.id.toString(),
            subcategory: level2Cat.name,
            tags: item.tags || [],
            rating: item.rating || 0,
            isPopular: item.isPopular || false,
            isNew: item.isNew || false,
          })),
        }));

        return {
          id: cat.id.toString(),
          name: cat.name,
          description: cat.description || "",
          image: cat.img || getLocalImageUrl(imageIndex++),
          tagline: cat.tagline || "",
          level2Categories,
          color: cat.color || "",
        };
      } else {
        const items: MenuItem[] = (cat.level2 || cat.items || []).map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || "",
          price: item.price || 0,
          image: item.img || getLocalImageUrl(imageIndex++),
          category: cat.id.toString(),
          subcategory: item.subcategory || "general",
          tags: item.tags || [],
          rating: item.rating || 0,
          isPopular: item.isPopular || false,
          isNew: item.isNew || false,
        }));

        return {
          id: cat.id.toString(),
          name: cat.name,
          description: cat.description || "",
          image: cat.img || getLocalImageUrl(imageIndex++),
          tagline: cat.tagline || "",
          items,
          color: cat.color || "",
        };
      }
    });

    return processedCategories;
  } catch (error) {
    console.error("❌ Failed to fetch menu data:", error);
    return [];
  }
}