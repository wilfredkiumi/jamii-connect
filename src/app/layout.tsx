import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AmplifyProvider } from "@/components/providers/amplify-provider";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Jamii Connect - Pan-African Diaspora Community",
  description: "Connect with fellow Africans worldwide, find opportunities, and build your life abroad with the support of your continental community.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen bg-background`}>
        <AmplifyProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </AmplifyProvider>
        <Toaster />
      </body>
    </html>
  );
}
