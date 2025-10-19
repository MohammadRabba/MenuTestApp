import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MenuCategories } from "@/components/menu-categories";
import { HeroSlider } from "@/components/hero-slider";
import { fetchMenuData, type Category } from "@/lib/menu-data";

// No more "use client" - this is now a Server Component!

// The component function is now async
export default async function MenuPage() {
  // We'll fetch the data directly here, before the page renders.
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    // Await the data from your fetching function
    categories = await fetchMenuData();
    console.log("Categories fetched on the server for MenuPage:", categories);
  } catch (err: any) {
    // If the fetch fails, we'll capture the error to display a message
    error = err.message || "Failed to load menu data.";
  }

  // The component returns JSX like normal
  const MenuCategoriesAny = MenuCategories as any;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSlider />
      <main className="container mx-auto px-4 py-8">
        {/*
          No more loading state! The user won't see this page until the data is ready.
          We just need to check if an error occurred during the server fetch.
        */}
        {error ? (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <p>Please ensure the POS API is configured correctly.</p>
          </div>
        ) : (
          // If there's no error, we render the categories
          <MenuCategoriesAny categories={categories} />
        )}
      </main>
      <Footer />
    </div>
  );
}