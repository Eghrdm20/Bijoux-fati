import type { Metadata } from "next";
import { PiAuthProvider } from "@/contexts/PiAuthContext";

export const metadata: Metadata = {
  title: "Bijoux Fati - متجر المجوهرات",
  description: "متجر المجوهرات الفاخرة على Pi Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f5f5f5" }}>
        <PiAuthProvider>
          {children}
        </PiAuthProvider>
      </body>
    </html>
  );
}
