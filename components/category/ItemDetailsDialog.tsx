// components/category/ItemDetailsDialog.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import type { MenuItem } from "@/lib/menu-data";
import { useCart } from "@/contexts/cart-context"; // Import useCart

interface ItemDetailsDialogProps {
  item: MenuItem | null;
  categoryName: string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (item: MenuItem) => void;
  // Removed onAddToCart prop
  onOpenChange: (open: boolean) => void;
}

export function ItemDetailsDialog({
  item,
  categoryName,
  isFavorite,
  onToggleFavorite,
  // Removed onAddToCart prop from parameters
  onOpenChange,
}: ItemDetailsDialogProps) {
  const { addItem } = useCart(); // Get addItem from the context
  const [dialogImageError, setDialogImageError] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Loading state

  const askAi = () => {
    if (!item) return;
    const base = `You're asking about ${item.name}. ${item.description || "No description provided."}`; // Added fallback
    const tips = `This dish is in the ${item.category} category${
      item.tags?.length ? ` and includes: ${item.tags.join(", ")}.` : "."
    }`;
    setAnswer(
      `${base}\n\n${tips}\n\nPrice: ₪${item.price.toFixed(2)}. Let me know if you'd like pairing suggestions or dietary alternatives.` // Formatted price
    );
  };

  // --- New handleAddToCart function specific to the dialog ---
  const handleAddToCart = async (itemToAdd: MenuItem | null) => {
    if (!itemToAdd) return; // Guard clause if item is null

    setIsAddingToCart(true); // Set loading state
    console.log("Adding item from dialog:", itemToAdd.name);

    const itemDataForApi = {
      itemId: itemToAdd.id.toString(),
      name: itemToAdd.name,
      price: itemToAdd.price,
      quantity: itemToAdd.quantity || 1,
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
      // Optionally close the dialog after adding
      // onOpenChange(false);
      // Optionally show a success toast here

    } catch (error) {
      console.error('Network or Fetch Error:', error);
      alert('A network error occurred while adding the item.');
    } finally {
      setIsAddingToCart(false); // Reset loading state
    }
  };
  // --- End of new handleAddToCart function ---


  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      {/* Ensure DialogContent receives className for styling */}
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 sm:rounded-lg">
        {item && (
          // Use Fragment to avoid extra div or apply padding directly if needed
          <>
            {/* Image (moved outside header, takes full width at top) */}
            <div className="relative rounded-t-lg overflow-hidden h-48 sm:h-64 w-full"> {/* Adjusted height */}
              <Image
                src={
                  dialogImageError
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
                    : item.image || "/placeholder.svg"
                }
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 600px" // Adjusted sizes
                className="object-cover"
                onError={() => setDialogImageError(true)}
                priority={false} // Only high-priority images above the fold
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /> {/* Gradient overlay */}
              <div className="absolute bottom-3 left-3 z-10"> {/* Ensure badge is above overlay */}
                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/70 text-white px-2 py-1 text-xs backdrop-blur-sm"> {/* Adjusted gap */}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating ?? 'N/A'} {/* Use actual rating */}
                  {/* Mock reviews removed for now, use actual data if available */}
                </span>
              </div>
            </div>

            {/* Content Area with Padding */}
            <div className="p-6 space-y-4">
              <DialogHeader className="p-0 text-left"> {/* Adjusted padding and alignment */}
                <DialogTitle className="text-2xl"> {/* Increased size */}
                  {item.name === "عصير جزر"
                    ? "Carrot Juice"
                    : item.name === "بيتزا خضار"
                    ? "Vegetable Pizza"
                    : item.name === "شاي"
                    ? "Tea"
                    : item.name === "قهوة"
                    ? "Coffee"
                    : item.name === "عصير رمان"
                    ? "Pomegranate Juice"
                    : item.name === "بيتزا مخصوص"
                    ? "Special Pizza"
                    : item.name}
                </DialogTitle>
                {/* Optional: Add description back if needed, but often redundant with details below */}
                {/* <DialogDescription>
                  Detailed information about this menu item.
                </DialogDescription> */}
              </DialogHeader>

              {/* Category label and price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    {categoryName === "مشروبات"
                      ? "Drinks"
                      : categoryName === "بيتزا"
                      ? "Pizza"
                      : categoryName}
                  </Badge>
                  {/* Add subcategory badge if available and different */}
                  {item.subcategory && item.subcategory !== categoryName && (
                     <Badge variant="outline">{item.subcategory}</Badge>
                  )}
                </div>
                <span className="text-xl font-semibold">₪{item.price.toFixed(2)}</span> {/* Formatted price */}
              </div>

              {/* Description */}
              {item.description && ( // Only show if description exists
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Description</h4>
                  <p className="text-sm text-muted-foreground text-pretty">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Features (tags) */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <Badge key={t} variant="outline" className="font-normal">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info grid (mock) - Consider replacing with actual data */}
              <div className="pt-3 border-t">
                <h4 className="font-semibold mb-2 text-sm">Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="text-muted-foreground">Prep Time:</div>
                  <div>~15 min</div>
                  <div className="text-muted-foreground">Calories:</div>
                  <div>~350 kcal</div>
                   {/* Add more relevant details if available */}
                </div>
              </div>

              {/* AI textbox */}
              <div className="space-y-2 pt-3 border-t">
                <h4 className="font-semibold text-sm">Ask AI about this dish</h4>
                <div className="flex gap-2">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., ingredients, allergens..."
                    className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm h-9" // Adjusted height
                  />
                  <Button type="button" size="sm" onClick={askAi}> {/* Adjusted size */}
                    Ask
                  </Button>
                </div>
                {answer && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">
                    {answer}
                  </p>
                )}
              </div>
            </div>

            {/* Footer actions with Padding */}
            <DialogFooter className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 p-6 border-t bg-muted/50 rounded-b-lg"> {/* Added padding, border, bg */}
              <Button
                variant="outline"
                onClick={() => onToggleFavorite(item)}
                className="cursor-pointer w-full sm:w-auto" // Full width on mobile
                aria-label={isFavorite(item.id.toString()) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className="h-4 w-4 mr-2" />
                {isFavorite(item.id.toString())
                  ? "Favorited" // Shorter text
                  : "Favorite"}
              </Button>
              <Button
                className="rounded-full cursor-pointer w-full sm:w-auto" // Full width on mobile
                onClick={() => handleAddToCart(item)} // Use the new handler
                disabled={isAddingToCart} // Disable button while adding
              >
                {isAddingToCart ? (
                  <>
                     <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></span> {/* Spinner */}
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart – ₪{item.price.toFixed(2)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}