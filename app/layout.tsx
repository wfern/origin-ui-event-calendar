import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import { Toaster } from "@/components/ui/sonner";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
