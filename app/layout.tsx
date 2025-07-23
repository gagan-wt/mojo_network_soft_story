import type React from "react"
import { Inter } from "next/font/google"
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Soft Stories",
  description: "Vertical News Stories",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Soft Stories",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
      </head>
      <body>{children}</body>
    </html>
  )
}
