import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "OmniEdge — Engineering IDE",
  description:
    "Unified workstation for embedded systems, TinyML, schematic, 3D and physical simulation. Designed for engineers.",
};

export const viewport = {
  themeColor: "#0b0d10",
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background dark">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
