import type { Metadata } from 'next';
import { Providers } from '../components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'huh — Next.js Example',
  description: 'Next.js App Router example for @sanghyuk-2i/huh-react',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
