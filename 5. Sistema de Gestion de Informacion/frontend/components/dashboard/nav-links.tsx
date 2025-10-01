'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { NAV_LINKS } from '@/lib/constants'; 

export default function NavLinks() {
  const pathname = usePathname();
  const { user } = useAuth();
  const filteredLinks = NAV_LINKS.filter(link => user?.role && link.roles.includes(user.role));

  return (
    <>
      {filteredLinks.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex items-center gap-2 rounded-md p-2 px-3 text-sm font-medium hover:bg-green-100 hover:text-green-700',
              { 'bg-green-100 text-green-700': pathname === link.href },
            )}
          >
            <LinkIcon className="w-6" />
            <p>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}