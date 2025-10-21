// // components/category/CategoryClientPage.tsx

// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { ArrowLeft } from "lucide-react";

// import { Header } from "@/components/header";
// import { Footer } from "@/components/footer";
// import { useCart } from "@/contexts/cart-context";
// import { useFavorites } from "@/contexts/favorites-context";

// import type { MenuItem, Category } from "@/lib/menu-data";
// import { CategoryHero } from "@/components/category/CategoryHero";
// import { CategoryFilters } from "@/components/category/CategoryFilters";
// import { ItemCard } from "@/components/category/ItemCard";
// import { ItemDetailsDialog } from "@/components/category/ItemDetailsDialog";

// interface CategoryClientPageProps {
//   initialCategoryData: Category;
// }

// export default function CategoryClientPage({ initialCategoryData }: CategoryClientPageProps) {
//   // Data is now passed via props, so we use it directly.
//   // No more loading, error, or data fetching states are needed here.
//   const [categoryData] = useState<Category>(initialCategoryData);
//   const [selectedFilters, setSelectedFilters] = useState<string[]>(["all"]);
//   const [openItem, setOpenItem] = useState<MenuItem | null>(null);

//   const { addItem } = useCart();
//   const { toggleFavorite, isFavorite } = useFavorites();

//   let subcategories: string[] = [];
//   let allItems: MenuItem[] = [];

//   if (categoryData.level2Categories && categoryData.level2Categories.length > 0) {
//     subcategories = Array.from(
//       new Set(categoryData.level2Categories.map((cat) => cat.name))
//     ).sort();
//     allItems = categoryData.level2Categories.flatMap((cat) => cat.items || []);
//   } else if (categoryData.items) {
//     subcategories = Array.from(
//       new Set(categoryData.items.map((item) => item.subcategory))
//     ).sort();
//     allItems = categoryData.items;
//   }

//   const filteredItems = allItems.filter((item) => {
//     if (selectedFilters.includes("all")) return true;
//     return selectedFilters.includes(item.subcategory);
//   });

//   const toggleFilter = (sub: string) => {
//     setSelectedFilters((prev) => {
//       if (sub === "all") return ["all"];
//       const next = prev.includes(sub)
//         ? prev.filter((s) => s !== sub)
//         : [...prev.filter((s) => s !== "all"), sub];
//       return next.length === 0 ? ["all"] : next;
//     });
//   };

//   const handleAddToCart = (item: MenuItem) => {
//     addItem({
//       id: item.id.toString(),
//       name: item.name,
//       price: item.price,
//       image: item.image,
//       category: item.category,
//     });
//   };

//   const handleToggleFavorite = (item: MenuItem) => {
//     toggleFavorite({
//       id: item.id.toString(),
//       name: item.name,
//       price: item.price,
//       image: item.image,
//       category: item.category,
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />

//       <CategoryHero
//         name={
//           categoryData.name === "بيتزا" ? "Pizza" : categoryData.name === "مشروبات" ? "Drinks" : categoryData.name
//         }
//         tagline={categoryData.description}
//         heroImage={
//           categoryData.name === "بيتزا" ? "/pizza2.jpg" : categoryData.name === "مشروبات" ? "/cold-drinks.jpg" : "/placeholder.jpg"
//         }
//       />

//       <section className="container mx-auto px-4">
//         <div className="flex items-center gap-2 py-4 text-sm">
//           <Link href="/menu" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
//             <ArrowLeft className="h-4 w-4 mr-1" /> Back to Menu
//           </Link>
//           <span className="text-muted-foreground">/</span>
//           <span className="px-2 py-1 rounded-full bg-muted text-foreground">
//             {categoryData.name === "بيتزا" ? "Pizza" : categoryData.name === "مشروبات" ? "Drinks" : categoryData.name}
//           </span>
//         </div>
//       </section>

//       <section className="py-8 md:py-12">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-2xl md:text-3xl font-bold text-foreground">
//             Our {categoryData.name === "بيتزا" ? "Pizza" : categoryData.name === "مشروبات" ? "Drinks" : categoryData.name} Selection
//           </h2>
//           <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
//             Explore our carefully curated menu, featuring fresh ingredients and expertly crafted dishes.
//           </p>
//         </div>
//       </section>

//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <CategoryFilters
//             selected={selectedFilters}
//             subcategories={["all", ...subcategories]}
//             onToggle={toggleFilter}
//             onClear={() => setSelectedFilters(["all"])}
//             total={filteredItems.length}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredItems.map((item) => (
//               <ItemCard
//                 key={item.id}
//                 item={item}
//                 isFavorite={(id) => isFavorite(id.toString())}
//                 onToggleFavorite={handleToggleFavorite}
//                 onAddToCart={handleAddToCart}
//                 onViewDetails={setOpenItem}
//               />
//             ))}
//           </div>

//           {filteredItems.length === 0 && (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">🍽️</div>
//               <h3 className="text-xl font-semibold text-foreground mb-2">No items found in this category</h3>
//               <p className="text-muted-foreground">Try filtering by a different type or browse all items.</p>
//             </div>
//           )}
//         </div>
//       </section>

//       <ItemDetailsDialog
//         item={openItem}
//         categoryName={categoryData.name}
//         isFavorite={(id) => isFavorite(id.toString())}
//         onToggleFavorite={handleToggleFavorite}
//         onAddToCart={handleAddToCart}
//         onOpenChange={(open) => !open && setOpenItem(null)}
//       />

//       <Footer />
//     </div>
//   );
// }

// components/category/CategoryClientPage.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
// Removed useCart import as handleAddToCart is no longer defined here
import { useFavorites } from "@/contexts/favorites-context";

import type { MenuItem, Category } from "@/lib/menu-data";
import { CategoryHero } from "@/components/category/CategoryHero";
import { CategoryFilters } from "@/components/category/CategoryFilters";
import { ItemCard } from "@/components/category/ItemCard"; // ItemCard now handles its own AddToCart
import { ItemDetailsDialog } from "@/components/category/ItemDetailsDialog";

interface CategoryClientPageProps {
  initialCategoryData: Category;
}

export default function CategoryClientPage({ initialCategoryData }: CategoryClientPageProps) {
  const [categoryData] = useState<Category>(initialCategoryData);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["all"]);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);

  // Removed addItem from useCart() as it's not directly used here anymore
  const { toggleFavorite, isFavorite } = useFavorites();

  let subcategories: string[] = [];
  let allItems: MenuItem[] = [];

  // Logic to determine subcategories and allItems remains the same
  if (categoryData.level2Categories && categoryData.level2Categories.length > 0) {
    subcategories = Array.from(
      new Set(categoryData.level2Categories.map((cat) => cat.name))
    ).sort();
    allItems = categoryData.level2Categories.flatMap((cat) => cat.items || []);
  } else if (categoryData.items) {
    subcategories = Array.from(
      new Set(categoryData.items.map((item) => item.subcategory || "general")) // Added fallback
    ).sort();
    allItems = categoryData.items;
  }

  const filteredItems = allItems.filter((item) => {
    if (selectedFilters.includes("all")) return true;
    // Ensure item.subcategory exists before checking includes
    return item.subcategory && selectedFilters.includes(item.subcategory);
  });

  const toggleFilter = (sub: string) => {
    setSelectedFilters((prev) => {
      if (sub === "all") return ["all"];
      const next = prev.includes(sub)
        ? prev.filter((s) => s !== sub)
        : [...prev.filter((s) => s !== "all"), sub];
      return next.length === 0 ? ["all"] : next;
    });
  };

  // Removed the local handleAddToCart function

  // handleToggleFavorite remains the same
  const handleToggleFavorite = (item: MenuItem) => {
    toggleFavorite({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
  };

  // Function to pass to ItemDetailsDialog (assuming it might need its own internal handler too)
  // For now, let's keep it simple and assume ItemDetailsDialog will also use useCart internally
  // If ItemDetailsDialog needs a specific handler passed, we would define it here similarly
  // to how ItemCard's handler works.

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <CategoryHero
        name={
          categoryData.name === "بيتزا" ? "Pizza" : categoryData.name === "مشروبات" ? "Drinks" : categoryData.name
        }
        tagline={categoryData.description || "Explore our selection"} // Fallback tagline
        heroImage={
          categoryData.name === "بيتزا" ? "/pizza2.jpg" : categoryData.name === "مشروبات" ? "/cold-drinks.jpg" : categoryData.image || "/placeholder.jpg" // Use category image if available
        }
      />

      <section className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4 text-sm">
          <Link href="/menu" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Menu
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="px-2 py-1 rounded-full bg-muted text-foreground">
            {categoryData.name === "بيتزا" ? "Pizza" : categoryData.name === "مشروبات" ? "Drinks" : categoryData.name}
          </span>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Our {categoryData.name === "بيتزا" ? "Pizza" : categoryData.name === "مشروبات" ? "Drinks" : categoryData.name} Selection
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-pretty"> {/* Added text-pretty */}
            Explore our carefully curated {categoryData.name === "بيتزا" ? "Pizza" : categoryData.name === "مشروبات" ? "Drinks" : categoryData.name} menu, featuring fresh ingredients and expertly crafted dishes.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <CategoryFilters
            selected={selectedFilters}
            subcategories={["all", ...subcategories]}
            onToggle={toggleFilter}
            onClear={() => setSelectedFilters(["all"])}
            total={filteredItems.length}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isFavorite={(id) => isFavorite(id.toString())}
                onToggleFavorite={handleToggleFavorite}
                // Removed onAddToCart prop - ItemCard handles this internally now
                onViewDetails={setOpenItem}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No items found matching your filters</h3>
              <p className="text-muted-foreground">Try selecting different filters or browse all items.</p>
            </div>
          )}
        </div>
      </section>

      <ItemDetailsDialog
        item={openItem}
        categoryName={categoryData.name}
        isFavorite={(id) => isFavorite(id.toString())}
        onToggleFavorite={handleToggleFavorite}
        // Removed onAddToCart prop - Assuming ItemDetailsDialog will handle this internally too
        // If not, you'd need to define a handler here similar to the one in ItemCard
        onOpenChange={(open) => !open && setOpenItem(null)}
      />

      <Footer />
    </div>
  );
}