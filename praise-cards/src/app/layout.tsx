// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "❤️ Praise Cards Generator",
  description: "Generate praise cards",
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
