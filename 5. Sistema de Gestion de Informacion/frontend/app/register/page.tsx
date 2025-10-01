import { RegisterForm } from '@/components/auth/RegisterForm';
import DptoLogo from '@/components/ui/dpto-logo';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-50">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-[#144836] p-4 md:h-32">
        <DptoLogo />
      </div>
      {/*<div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-white shadow-md px-6 py-10 md:w-2/5 md:px-20">
          <RegisterForm />
        </div>
        <div className="flex flex-col items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
           <Image
            src="/Grupo-Palmar-Logotipo.png"
            width={800}
            height={760}
            className="mb-8 w-full h-auto max-w-sm md:max-w-md lg:max-w-lg"
            alt="Logotipo de Grupo Palmar"
            priority
          />
          <Image
            src="/DIV-EXP-LOGO.png"
            width={240}
            height={760}
            className="w-full h-auto max-w-[150px] md:max-w-[200px]"
            alt="Logotipo de División Exportadora"
          />
        </div>
      </div>*/}
    </main>
  );
}
  