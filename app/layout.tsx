import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'StudyFlow - Professional Polish',
  description: 'Midterm Prep Study Planner Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-slate-50 font-sans text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
