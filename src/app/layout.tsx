import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بيت العائلة - المشتريات، الضمانات والفواتير",
  description: "تطبيق عائلي متكامل لمتابعة المشتريات والضمانات، الفواتير الشهرية، دورة ماء العمارة، وإيجار الشقة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#1C1917] selection:bg-amber-200 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
