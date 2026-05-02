import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import AuthProvider from "@/components/auth/AuthProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Wedding Fonts for Puck Visual Builder */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Tangerine:wght@400;700&family=Alex+Brush&family=Pinyon+Script&family=Sacramento&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=Josefin+Sans:wght@300;400;600&family=Montserrat:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '16px', padding: '12px 16px', fontSize: '14px' }}} />
        </AuthProvider>
      </body>
    </html>
  );
}
