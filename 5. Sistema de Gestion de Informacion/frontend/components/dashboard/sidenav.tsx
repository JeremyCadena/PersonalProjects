'use client'; 

import { PowerIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import NavLinks from './nav-links'; 
import { NAV_LINKS } from '@/lib/constants'; 

export default function SideNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const filteredLinks = NAV_LINKS.filter(link => user?.role && link.roles.includes(user.role));

  const mobileLinkClass = "flex flex-1 flex-col items-center justify-center gap-1 p-2 text-xs font-medium";

  return (
    <>
      {/* --- 1. BARRA MÓVIL --- */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex h-16 items-stretch border-t bg-white shadow-t-lg md:hidden">
        {filteredLinks.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                mobileLinkClass,
                {
                  'text-green-700 bg-green-50': pathname === link.href,
                }
              )}
            >
              <LinkIcon className="w-6" />
            </Link>
          );
        })}
        
        <form className="flex flex-1" action={async () => { logout(); }}>
          <button
            title="Cerrar Sesión"
            className={clsx(mobileLinkClass, "text-gray-600 hover:bg-red-100 hover:text-red-600")}
          >
            <PowerIcon className="w-6" />
          </button>
        </form>
      </div>

      {/* --- 2. BARRA LATERAL PARA ESCRITORIO --- */}
      <div className="hidden h-full flex-col justify-between p-2 md:flex md:px-2 md:py-4 bg-gray-50 border-r">
        <div className="flex flex-col items-stretch gap-0">
          <div className="mb-6 flex h-36 items-center justify-center rounded-md p-4">
            <div className="w-28">
              <Image src="/LOGO ZHERU.png" width={250} height={40} alt="Logo" priority className="h-auto" />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <NavLinks />
          </div>
        </div>
        <div>
          <form action={async () => { logout(); }}>
            <button className="flex h-[48px] w-full items-center justify-start gap-2 rounded-md p-3 text-sm font-medium hover:bg-red-100 hover:text-red-600">
              <PowerIcon className="w-6" />
              <div>Cerrar Sesión</div>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}