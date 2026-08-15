import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phương Thảo ơi, đi Đà Nẵng chơi! 🐝🌟",
  description: "Thiệp mời đi Đà Nẵng dành riêng cho Phương Thảo. Ăn Jollibee rồi ra Cầu Rồng ngắm phun lửa nha!",
  keywords: ["thiệp mời", "đi chơi", "Phương Thảo", "Đà Nẵng", "Cầu Rồng", "Jollibee"],
  openGraph: {
    title: "Phương Thảo ơi, đi Đà Nẵng chơi! 🐝🌟",
    description: "Bạn có một lời mời đặc biệt từ Đà Nẵng! Click để xem nhé 💌",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
