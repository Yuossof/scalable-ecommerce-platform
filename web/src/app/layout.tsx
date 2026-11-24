import type { Metadata } from "next";

import "./globals.css";
import MainLayout from "@/shared/components/layout/header/main-layout";
import { ToastContainer } from "@/shared/components/toast/toast-container";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "TechZone - Premium Electronics & Gear",
  description: "Modern E-Commerce Storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>

        <ToastContainer />
      </body>
    </html>
  );
}
