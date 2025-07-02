'use client';
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script src="https://kit.fontawesome.com/1dc5e8d3e7.js" strategy="afterInteractive" crossOrigin="anonymous" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
