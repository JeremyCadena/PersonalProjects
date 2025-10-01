// =================================================================
// ARCHIVO: /app/layout.tsx (Layout Raíz)
// =================================================================
import { AuthProvider } from '@/context/AuthContext';
import { Metadata } from 'next';
import 'components/ui/globals.css'
import { inter } from '@/components/ui/fonts';

// Metadatos para el SEO y la pestaña del navegador
export const metadata: Metadata = {
  title: {
    template: '%s | Seguridad Palmar',
    default: 'SGPCS',
  },
  description: 'Sistema de Gestión de Procesos de la Cadena de Suministros',
  icons: {
    icon: '/ZHERUICON.ico', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}