// ARCHIVO: /app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { Spinner } from '@/components/ui/Spinner';
import { LoginForm } from '@/components/auth/LoginForm';
import DptoLogo from '@/components/ui/dpto-logo';

export default function LoginPage() {
  const { isAuthenticated, loadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loadingAuth, router]);

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <Spinner />
        <p className="mt-4">Verificando autenticación...</p>
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col p-4 bg-gray-50 md:p-6">
      <div className="flex h-20 shrink-0 items-center justify-between rounded-lg bg-[#144836] p-4 md:h-32">
        <DptoLogo />
        <div className="flex items-center gap-4"> 
          <Image
            src="/Grupo-Palmar-Logotipo.png"
            width={100} 
            height={100} 
            className="md:w-[150px] md:h-auto object-contain" 
            alt="Logotipo de Grupo Palmar"
            priority
          />
        </div>
      </div>

      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="hidden flex-col items-center justify-center p-6 md:flex md:w-3/5 md:px-20">
            <Image
              src="/LOGO SGPCS.png"
              width={500} 
              height={500} 
              className="w-auto h-auto object-contain" 
              alt="Logotipo del Sistema SGPCS"
              priority
            />      
        </div>
        
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-white shadow-md px-6 py-10 md:w-2/5 md:px-12">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}