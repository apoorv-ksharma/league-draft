import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Link from 'next/link';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'League Draft',
  description: 'Made by Apoorv',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} w-full h-[100vh] bg-gray-500 flex flex-col p-4`}
      >
        <div className='flex gap-4 flex-col h-[100%]'>
          <div className='flex gap-4'>
            <Link href='/players' className='p-2 bg-sky-500 rounded-md text-white'>
              Players
            </Link>
            <Link href='/drafts' className='p-2 bg-sky-500 rounded-md text-white'>
              Drafts
            </Link>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
