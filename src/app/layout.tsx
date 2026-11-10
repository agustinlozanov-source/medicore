import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ProveedorDatos } from '@/lib/datos';
import { Marco } from '@/components/Marco';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ variable: '--font-jakarta', subsets: ['latin'], weight: ['600', '700', '800'] });

export const metadata: Metadata = {
  title: 'Medical Hub OS · Monte Sinaí',
  description: 'Demo de Medical Hub OS para Clínica de Visión Monte Sinaí y Óptica Shalom.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jakarta.variable} font-sans`}>
        <ProveedorDatos>
          <Marco>{children}</Marco>
        </ProveedorDatos>
      </body>
    </html>
  );
}
