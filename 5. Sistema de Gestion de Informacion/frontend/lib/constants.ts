import {
  TruckIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import { RolUsuario as UserRole } from '@/lib/types';

export const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard', icon: PresentationChartBarIcon, roles: [UserRole.ADMIN, UserRole.INSPECTOR, UserRole.VISUALIZADOR] },
  { name: 'Rastreos Satélitales', href: '/dashboard/rastreos', icon: TruckIcon, roles: [UserRole.ADMIN, UserRole.INSPECTOR] },
  { name: 'Inspecciones', href: '/dashboard/inspecciones', icon: MagnifyingGlassIcon, roles: [UserRole.ADMIN, UserRole.INSPECTOR] },
  { name: 'Operación', href: '/dashboard/parametros/agricolas', icon: DisplaySettingsIcon, roles: [UserRole.ADMIN] },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: UserCircleIcon, roles: [UserRole.ADMIN] },
];

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_SIZE_RASTREOS = 40;
export const DEFAULT_TOP = 5;