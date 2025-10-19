// components/MenuCategories.tsx

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchMenuData } from "@/lib/menu-cache"; // ✅ Not from `menu-data`
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
// The component is now async
export async function MenuCategories() {
  // Fetch data directly on the server before rendering.
  const categories: Category[] = await fetchMenuData();

  // The image error handling will be done on the client in a separate component.
  // For now, let's simplify the main component.
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Our Menu
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Explore Our Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover our wide selection of authentic Middle Eastern dishes, from
            traditional appetizers to hearty main courses and delightful desserts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.id}`}>
              <Card className="group relative cursor-pointer py-0 overflow-hidden rounded-3xl border border-black/5 bg-transparent shadow-md hover:shadow-lg transition-all duration-300">
                <div className="relative h-56 md:h-64 w-full overflow-hidden">
                  <Image
                    src={
                      category.name === "بيتزا"
                        ? "/pizza2.jpg"
                        : category.name === "مشروبات"
                        ? "/cold-drinks.jpg"
                        : category.image || "/placeholder.svg"
                    }
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    // onError is a client-side event, so it can't be used directly in a Server Component.
                    // For progressive enhancement, a simple client component could be wrapped around the Image if needed.
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-extrabold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                      {category.name === "بيتزا"
                        ? "Pizza"
                        : category.name === "مشروبات"
                        ? "Drinks"
                        : category.name}
                    </h3>
                    <p className="mt-1 text-white/90 text-sm leading-snug line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}