import type React from "react"
import "./globals.css"
import { Outfit, Playfair_Display, Montserrat } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/toast"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export const metadata = {
  title: "People App",
  description: "Sistema integral de gestión de personal y requerimientos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.variable} ${playfair.variable} ${montserrat.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

