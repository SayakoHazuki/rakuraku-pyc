import "../styles/globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rakuraku PYC",
  description: "A web app aiming to accommodate SPYCers.",
  generator: "Next.js",
  applicationName: "Rakuraku PYC",
  referrer: "origin-when-cross-origin",
  openGraph: {
    title: "Rakuraku PYC",
    description: "A web app aiming to accommodate SPYCers.",
    url: "https://rakuraku-pyc.vercel.app/",
    siteName: "Rakuraku PYC",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
