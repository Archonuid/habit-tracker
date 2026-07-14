import type { Metadata, Viewport } from "next";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "Mythlog — Life Roleplay System",
  description:
    "Engage in a personalized adventure where you choose a character archetype, complete daily quests, and transform your life into an epic story with AI support.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
