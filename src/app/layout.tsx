//src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'OneServis - Gestión de Órdenes de Trabajo',
  description: 'Sistema de gestión de órdenes de trabajo para equipos médicos y técnicos especializados',
  keywords: ['gestión', 'órdenes de trabajo', 'equipos médicos', 'mantenimiento', 'oneservis'],
  authors: [{ name: 'OneServis SPA', url: 'https://oneservis.com' }],
  robots: 'noindex, nofollow', // Solo para desarrollo
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#ea580c', // Color naranja de OneServis
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'OneServis - Gestión de Órdenes de Trabajo',
    description: 'Sistema de gestión de órdenes de trabajo para equipos médicos',
    type: 'website',
    locale: 'es_CL',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`h-full ${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <AuthProvider>
          <div className="min-h-full">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}