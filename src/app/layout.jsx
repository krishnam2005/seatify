import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Seatify | Smart Spaces. Seamless Work.',
  description: 'Manage your office workspace seamlessly with Seatify.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col relative`}>
        {/* Background dark gradient accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl opacity-20 pointer-events-none z-[-1]">
          <div className="aspect-[2/1] w-full bg-gradient-to-b from-indigo-500 to-transparent blur-[120px] rounded-full" />
        </div>
        
        <Header />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-6xl">
          {children}
        </main>
      </body>
    </html>
  );
}
