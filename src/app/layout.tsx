import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bikestube - Finde Fahrradwerkstätten in deiner Nähe",
  description: "Finde und buche Fahrradreparaturen bei lokalen Werkstätten",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
