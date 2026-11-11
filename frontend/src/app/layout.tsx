import type { Metadata } from "next";
import { Abel, Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers/Providers";
import Navbar from "../components/navigation/Navbar";
import RegisterPage from "./(auth)/register/page";

const abel = Abel({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-abel",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "Skateboarding Slovenija",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${abel.variable} ${playfair.variable} ${roboto.variable}`}
    >
      <body>
        <Providers>
          <Navbar /> {children}
          <RegisterPage />
        </Providers>
      </body>{" "}
    </html>
  );
}
