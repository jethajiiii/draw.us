import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Excalidraw Clone – Collaborative Drawing",
  description: "Real-time collaborative drawing board with chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Caveat:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
