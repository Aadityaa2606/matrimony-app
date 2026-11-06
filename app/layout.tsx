import type { Metadata, Viewport } from "next";
import { Noto_Sans_Tamil, Noto_Serif_Tamil } from "next/font/google";
import { Providers } from "@/components/providers";
import { getLang } from "@/lib/i18n/server";
import "./globals.css";

const sans = Noto_Sans_Tamil({
  variable: "--font-noto-sans",
  subsets: ["tamil", "latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Noto_Serif_Tamil({
  variable: "--font-noto-serif",
  subsets: ["tamil", "latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Kalyana Varan Matrimony",
  description: "Kalyana Varan Matrimony - find your life partner",
};

// viewport-fit=cover lets the bottom nav pad itself above the iPhone home bar (env(safe-area-inset-bottom)).
export const viewport: Viewport = { themeColor: "#7d1828", viewportFit: "cover" };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <Providers initialLang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
