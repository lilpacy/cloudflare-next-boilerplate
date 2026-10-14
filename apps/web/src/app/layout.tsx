import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import GoogleAnalytics from "./components/GoogleAnalytics";
import Navigation from "./components/navigation";
import Footer from "./components/footer";
import "./styles/globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CF Next Boilerplate",
    template: "%s | CF Next Boilerplate",
  },
  description: "Next.js on Cloudflare Workers with D1 and R2",
  keywords: ["nextjs", "cloudflare", "d1", "r2", "boilerplate"],
  authors: [{ name: "CF Next Boilerplate" }],
  creator: "CF Next Boilerplate",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "CF Next Boilerplate",
    title: "CF Next Boilerplate",
    description: "Next.js on Cloudflare Workers with D1 and R2",
  },
  twitter: {
    card: "summary_large_image",
    title: "CF Next Boilerplate",
    description: "Next.js on Cloudflare Workers with D1 and R2",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
        >
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
