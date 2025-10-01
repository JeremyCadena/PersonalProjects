// ARCHIVO: /components/ui/DptoLogo.tsx
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { lusitana } from './fonts';

export default function DptoLogo() {
  return (
    <div className={`${lusitana.className} flex flex-row items-center leading-none text-white`}>
      <ShieldCheckIcon className="h-10 w-10 md:h-12 md:w-12" />
      <div className="ml-4">
        <p className="hidden text-[24px] md:block md:text-[32px]">Departamento de Seguridad Física</p>
        <p className="text-[20px] md:hidden"> Dpto. Seguridad</p>
      </div>
    </div>
  );
}