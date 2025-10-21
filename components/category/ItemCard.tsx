"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { MenuItem } from "@/lib/menu-data"; // Ensure MenuItem is imported
import { useState } from "react";
import { useCart } from "@/contexts/cart-context"; // Import useCart

interface ItemCardProps {
  item: MenuItem;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (item: MenuItem) => void;
  // Removed onAddToCart from props, as we'll define the handler inside
  onViewDetails: (item: MenuItem) => void;
}

export function ItemCard({
  item,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
}: ItemCardProps) {
  const { addItem } = useCart(); // Get addItem from the context
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Optional: for loading state

  // --- Updated handleAddToCart function ---
  const handleAddToCart = async (itemToAdd: MenuItem) => {
    setIsAddingToCart(true); // Set loading state
    console.log("Adding item:", itemToAdd.name);

    const itemDataForApi = {
      itemId: itemToAdd.id.toString(),
      name: itemToAdd.name,
      price: itemToAdd.price,
      quantity: 1,
    };

    const apiUrl = '/api/cart';

    try {
      console.log("Sending POST request to:", apiUrl, "with data:", itemDataForApi);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemDataForApi),
      });

      if (!response.ok) {
        let errorMsg = `API request failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) { /* Ignore JSON parsing error */ }
        console.error('API Error:', errorMsg);
        alert(`Failed to add item: ${errorMsg}`);
        setIsAddingToCart(false); // Reset loading state on error
        return;
      }

      const result = await response.json();
      console.log('API Success Response:', result);

      // Add to client-side cart context AFTER successful API call
      console.log("API call successful, now calling addItem for client state.");
      addItem({
        id: itemToAdd.id.toString(),
        name: itemToAdd.name,
        price: itemToAdd.price,
        image: itemToAdd.image,
        category: itemToAdd.category,
      });
      console.log(`${itemToAdd.name} added to client cart context.`);
      // Optionally show a success toast here

    } catch (error) {
      console.error('Network or Fetch Error:', error);
      alert('A network error occurred while adding the item.');
    } finally {
      setIsAddingToCart(false); // Reset loading state whether success or failure
    }
  };
  // --- End of updated handleAddToCart function ---

  return (
    <div className="group overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 flex justify-between flex-col">
      {/* Image area */}
      <div className="relative rounded-t-2xl overflow-hidden h-48">
        <Image
          src={
            imageError
              ? "/placeholder.svg"
              : item.name === "بيتزا خضار"
              ? "/pizza2.jpg"
              : item.name === "شاي"
              ? "/tea.jpg"
              : item.name === "قهوة"
              ? "/coffee.jpg"
              : item.name === "عصير رمان"
              ? "/pomegranate juice.jpg"
              : item.name === "عصير جزر"
              ? "/juice2.jpg"
              : item.name === "بيتزا مخصوص"
              ? "/pizza1.jpg"
              : item.image || "/placeholder.svg" // Fallback if item.image is missing
          }
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={() => setImageError(true)}
          priority={false} // Only set priority=true for above-the-fold images
        />
        {/* Hover dark overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-black/40 opacity-40 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />
        {/* Center hover CTA */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={() => onViewDetails(item)}
            variant="secondary"
            size="sm"
            className="pointer-events-auto rounded-full bg-white/90 text-foreground hover:bg-white cursor-pointer dark:bg-white/90 dark:text-black"
          >
            View Details
          </Button>
        </div>
        {/* Favorite and badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10"> {/* Added z-10 */}
          {item.isPopular && (
            <Badge className="bg-primary text-primary-foreground dark:text-white">
              Most Popular
            </Badge>
          )}
          {item.isNew && (
            <Badge className="bg-secondary text-secondary-foreground">
              New
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isFavorite(item.id.toString()) ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-3 left-3 h-8 w-8 rounded-full z-10 ${ // Added z-10
            isFavorite(item.id.toString())
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/80 hover:bg-white hover:text-red-500"
          }`}
          onClick={() => onToggleFavorite(item)}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite(item.id.toString()) ? "fill-current" : ""
            }`}
          />
        </Button>
      </div>

      {/* Content */}
      <div className="pb-3 px-6 pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0"> {/* Added flex-1 and min-w-0 for wrapping */}
            <h3 className="text-lg font-semibold text-card-foreground truncate"> {/* Added truncate */}
              {item.name === "بيتزا خضار"
                ? "Vegetable Pizza"
                : item.name === "شاي"
                ? "Tea"
                : item.name === "قهوة"
                ? "Coffee"
                : item.name === "عصير رمان"
                ? "Pomegranate Juice"
                : item.name === "عصير جزر"
                ? "Carrot Juice"
                : item.name === "بيتزا مخصوص"
                ? "Special Pizza"
                : item.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">
              {item.description || "No description available."} {/* Fallback for description */}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full border text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right pl-2"> {/* Added padding-left */}
            <div className="flex items-center justify-end gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-amber-400" />
              <span className="text-sm font-medium">{item.rating ?? 'N/A'}</span> {/* Handle missing rating */}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-0 px-6 pb-4 mt-auto"> {/* Added mt-auto */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-primary">
            ₪{item.price.toFixed(2)} {/* Ensure price formatting */}
          </span>
          <Button
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
            onClick={() => handleAddToCart(item)} // Call the updated handler
            disabled={isAddingToCart} // Disable button while processing
          >
            {isAddingToCart ? (
              <>
                <span className="animate-spin mr-2">⏳</span> {/* Basic loading indicator */}
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}