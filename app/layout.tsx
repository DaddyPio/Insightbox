import type { Metadata } from "next";
import { Inter, Noto_Sans_TC, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
      </head>
      <body className={`${inter.className} ${notoSansTC.variable} ${notoSansJP.variable}`}>
        <nav className="bg-wood-100 border-b border-wood-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-serif font-bold text-wood-800">
                  InsightBox
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Link href="/" className="text-wood-700 hover:text-wood-900 px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </Link>
                  <Link href="/cards" className="text-wood-700 hover:text-wood-900 px-3 py-2 rounded-md text-sm font-medium">
                    Cards
                  </Link>
                  <Link href="/weekly" className="text-wood-700 hover:text-wood-900 px-3 py-2 rounded-md text-sm font-medium">
                    Weekly Review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

