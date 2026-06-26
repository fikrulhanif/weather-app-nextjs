import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Weather Alert Indonesia",
  description:
    "Dashboard cuaca real-time dengan alert hujan, angin, dan UV untuk kota-kota di Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
