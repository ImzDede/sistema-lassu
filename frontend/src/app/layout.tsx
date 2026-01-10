import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MTRegistry from "@/components/MTRegistry";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lassu",
  description: "Sistema de organização do Lassu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <MTRegistry>{children}</MTRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
