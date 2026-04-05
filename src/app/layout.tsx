import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartModal } from "@/components/cart/CartModal";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Abuela Savia | La Ciencia de lo Natural",
  description: "Descubre la crema rejuvenecedora de la Abuela Savia. Fusión entre botánica y biotecnología para tu piel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col bg-cream text-bark">
        {children}
        <CartModal />
      </body>
    </html>
  );
}
