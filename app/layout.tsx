import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "QuantumTrades",
  description:
    "Beginner-friendly real-time trading demo built with Next.js + SQLite.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
