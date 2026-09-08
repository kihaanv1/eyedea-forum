import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientAuthSync from '@/components/ClientAuthSync';

export const metadata: Metadata = {
  title: 'EyeDea | Discussion & Idea-Sharing Forum',
  description: 'The premier bulletin board forum for innovators, developers, startup founders, and creators to share ideas, validate MVPs, and discuss tech.',
  icons: {
    icon: [
      { url: '/view.png' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/view.png',
    apple: '/view.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090c15] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <ClientAuthSync />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
