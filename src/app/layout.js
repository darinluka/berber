// Triggering fresh redeployment of the original stable version.
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

import { ThemeProvider } from "./theme-provider";

export const metadata = {
  title: "Berber.al - Rezervoni Berberin Tuaj Ideal në Tiranë",
  description: "Platforma #1 në Shqipëri për menaxhimin dhe rezervimin e salloneve të bukurisë. Gjeni berberët më të mirë, shikoni vlerësimet dhe rezervoni orarin tuaj online.",
  keywords: "berber, tirana, rezervime, salon, beauty, shqiperi, haircut, men grooming",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sq" className={`${inter.variable} ${outfit.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <ThemeProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
