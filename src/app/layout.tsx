import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserProvider } from '@/contexts/UserContext'; // 1. Import UserProvider

export const metadata: Metadata = {
  title: 'Idiomatch',
  description: 'Learn idioms with style.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-green-50 to-blue-50 text-gray-900">
        {/* 2. Bungkus semua komponen di dalam body dengan UserProvider */}
        <UserProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}

