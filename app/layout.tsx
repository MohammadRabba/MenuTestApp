import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/cart-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import "./globals.css";
import VoiceflowScriptLoader from "@/components/VoiceflowScriptLoader";
import { VoiceflowHandler } from '@/components/VoiceflowHandler'; // Adjust path if needed
export const metadata: Metadata = {
  title: "Authentic Middle Eastern Restaurant",
  description:
    "Experience authentic Middle Eastern cuisine with traditional flavors and modern presentation. Located in Ramallah, Palestine.",
  keywords:
    "Middle Eastern food, Palestinian restaurant, Arabic cuisine, dining, authentic food",
  openGraph: {
    title: "Authentic Middle Eastern Restaurant",
    description:
      "Experience authentic Middle Eastern cuisine with traditional flavors and modern presentation.",
    url: "https://tasteofarabia.co.il",
    locale: "en_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Authentic Middle Eastern Restaurant",
    description:
      "Experience authentic Middle Eastern cuisine with traditional flavors and modern presentation.",
  },
  icons: {
    icon: [
      { url: "/placeholder-logo.svg" },
      { url: "/placeholder-logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/placeholder-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/placeholder-logo.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* You can add custom head tags here if needed */}
      </head>
      <body className="font-sans">
        <VoiceflowScriptLoader />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <CartProvider>
            <FavoritesProvider>
              <VoiceflowHandler /> {/* <-- Handler component added here */}
              <Suspense fallback={null}>{children}</Suspense>
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}