import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Define as variable for more flexible usage
});

export const metadata: Metadata = {
  title: "RAFA's productivity tool",
  description: "Little tool to help nerd with their school stuff!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add Safari font fix - ensure system fonts are used */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @supports (-webkit-touch-callout: none) {
            body, button, input, textarea, select, div, span, p, h1, h2, h3, h4, h5, h6 {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
            }
          }
        `,
          }}
        />
        {/* Add favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className={`${inter.className} ${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
