import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentForge CMS - Headless Content Management Platform",
  description:
    "A developer-first headless CMS platform built with Next.js. Create dynamic content models, manage content, and expose REST APIs for any frontend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-slate-950 text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
