// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/cart-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { Toaster } from "@/components/ui/toaster";
import VoiceflowScriptLoader from "@/components/VoiceflowScriptLoader";
import { VoiceflowHandler } from "@/components/VoiceflowHandler";
import { TestVoiceflowButton } from "@/components/TestVoiceflowButton"; // Add this import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Authentic Restaurant - Traditional Middle Eastern Cuisine",
  description: "Experience the finest traditional Middle Eastern cuisine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <CartProvider>
            <FavoritesProvider>
              {children}
              <Toaster />
              <VoiceflowScriptLoader />
              <VoiceflowHandler />
              <TestVoiceflowButton /> {/* Add this line */}
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}