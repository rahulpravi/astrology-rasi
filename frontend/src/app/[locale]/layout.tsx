import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "Astrology Rasi Chart Generator | Vedic Kundali",
  description: "High precision Vedic Astrology and Rasi Chart generation with planetary positions in English, Malayalam, Tamil, and Hindi.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.variable} ${cinzel.variable} font-sans bg-cosmic-950 text-slate-100 antialiased min-h-screen selection:bg-celestial-gold selection:text-black`}>
        <NextIntlClientProvider messages={messages}>
          <div className="relative overflow-x-hidden min-h-screen flex flex-col bg-celestial-gradient">
            {/* Background constellation layer */}
            <div 
              className="pointer-events-none fixed inset-0 -z-10 bg-repeat opacity-40" 
              style={{ backgroundImage: `url('/starry-backdrop.svg')`, backgroundSize: '100% auto' }}
            />
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
