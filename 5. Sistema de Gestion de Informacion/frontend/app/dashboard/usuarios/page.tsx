// banana/app/dashboard/usuarios/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Usuario as UserResponse, RolUsuario as UserRole } from '@/lib/types';
import { getAllUsuarios } from '@/lib/api';
import { UsersTable } from '@/components/dashboard/usuarios/UsersTable';
import { lusitana } from '@/components/ui/fonts';

export default function UsersPage() {
  const { user, token, loadingAuth, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return; // No intentar cargar si no hay token
    setLoadingUsers(true);
    setError(null);
    try {
      const fetchedUsers = await getAllUsuarios();
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error al cargar los usuarios. Por favor, inténtalo de nuevo.');
    } finally {
      setLoadingUsers(false);
    }
  }, [token]); 

  useEffect(() => {
    // Solo intenta cargar usuarios si el usuario está autenticado y es un administrador
    if (!loadingAuth && isAuthenticated && user?.role === UserRole.ADMIN) {
      fetchUsers();
    } else if (!loadingAuth && (!isAuthenticated || user?.role !== UserRole.ADMIN)) {
      setLoadingUsers(false);
      setError('No tienes permisos para ver esta página.');
    }
  }, [loadingAuth, isAuthenticated, user, fetchUsers]);

  if (loadingAuth || loadingUsers) {
    return <div className="p-4">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return <div className="p-4 text-red-600">Acceso denegado. Solo los administradores pueden ver esta página.</div>;
  }

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} text-xl text-black-800 md:text-3xl md:leading-normal text-center mb-6`}>Gestión de Usuarios</h1>
      {/* Pasa los usuarios cargados y la función de recarga a UsersTable */}
      <UsersTable users={users} onRefresh={fetchUsers} />
    </div>
  );
}