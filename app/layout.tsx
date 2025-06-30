import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const soriaFont = localFont({
  src: "../public/soria-font.ttf",
  variable: "--font-soria",
});

const vercettiFont = localFont({
  src: "../public/Vercetti-Regular.woff",
  variable: "--font-vercetti",
});

export const metadata: Metadata = {
  title: "Lễ cưới của tụi mình",
  description: "Chúng tôi rất vui được chia sẻ ngày trọng đại nhất trong cuộc đời. Hãy cùng chúng tôi tạo nên những kỷ niệm đẹp nhất!",
  keywords: "lễ cưới, đám cưới, wedding, thiệp cưới online, lễ thành hôn, kỷ niệm đám cưới, tiệc cưới",
  authors: [{ name: "Cô dâu & Chú rể" }],
  creator: "Wedding Couple",
  publisher: "Wedding Website",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Lễ cưới của tụi mình",
    description: "Tụi mình rất vui được chia sẻ ngày trọng đại nhất trong cuộc đời. Hãy cùng tụi mình tạo nên những kỷ niệm đẹp nhất!",
    url: "https://wedding-zeta-dun.vercel.app/",
    siteName: "Lễ cưới của tụi mình",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/opengraph-image.jpg", // hoặc .png
        width: 1200,
        height: 630,
        alt: "Lễ cưới của tụi mình",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lễ cưới của tụi mình",
    description: "Tụi mình rất vui được chia sẻ ngày trọng đại nhất trong cuộc đời. Hãy cùng tụi mình tạo nên những kỷ niệm đẹp nhất!",
    images: ["/opengraph-image.png"], // hoặc .png
  },
  verification: {
    google: "GsRYY-ivL0F_VKkfs5KAeToliqz0gCrRAJKKmFkAxBA",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="overscroll-y-none">
      <body
        className={`${soriaFont.variable} ${vercettiFont.variable} font-sans antialiased`}
      >
        {children}
      </body>
      <GoogleAnalytics gaId={'G-7WD4HM3XRE'}/>
    </html>
  );
}