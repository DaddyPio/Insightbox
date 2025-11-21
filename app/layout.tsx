import type { Metadata } from "next";
import { Inter, Noto_Sans_TC, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";

const inter = Inter({ subsets: ["latin"] });
const notoSansTC = Noto_Sans_TC({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
});
const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "InsightBox - Capture Your Ideas",
  description: "A personal idea-capturing app with AI-powered insights",
  manifest: "/manifest.webmanifest",
  themeColor: "#8B6F47",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InsightBox",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="theme-color" content="#8B6F47" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="InsightBox" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} ${notoSansTC.variable} ${notoSansJP.variable} flex flex-col min-h-screen`}>
        <PWARegister />
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

