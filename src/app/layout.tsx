import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AmplifyProvider } from "@/components/providers/amplify-provider";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Jamii Connect — Diaspora Communities in the UK",
  description: "Where African and Caribbean diaspora communities in the UK find each other. Jobs, events, services, and real connections from the continent to your city.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} antialiased min-h-screen bg-background`}>
        <AmplifyProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AmplifyProvider>
        <Toaster />
      </body>
    </html>
  );
}
