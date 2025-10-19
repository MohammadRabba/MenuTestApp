// app/category/[slug]/page.tsx

import { fetchMenuData } from "@/lib/menu-data";
import type { Category } from "@/lib/menu-data";
import CategoryClientPage from "./CategoryClientPage"; // Corrected relative import
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// This async Server Component receives props which must be awaited.
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  // FIX: Await the params object to resolve its properties.
  const { slug } = await params;

  // 1. Fetch all data on the server
  const allCategories = await fetchMenuData();

  // 2. Find the specific category needed for this page
  const categoryData = allCategories.find((cat) => cat.id === slug);

  // 3. Handle the case where the category is not found
  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Category Not Found</h1>
          <p className="text-muted-foreground">
            The category you are looking for does not exist.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // 4. Pass the fetched data as a prop to the Client Component
  return <CategoryClientPage initialCategoryData={categoryData} />;
}