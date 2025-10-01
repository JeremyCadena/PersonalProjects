// ARCHIVO: /components/users/ChangeUserRoleForm.tsx
'use client';

import React, { useState } from 'react';
import { Usuario, RolUsuario } from '@/lib/types';
import { updateUsuarioRol } from '@/lib/api';
import { UserIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/ui/fonts';
import { useAuth } from '@/hooks/useAuth';

interface ChangeUserRoleFormProps {
  user: Usuario;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeUserRoleForm: React.FC<ChangeUserRoleFormProps> = ({ user, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<RolUsuario>(user.role);
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);
  const { token } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 
    if (!token) { setError("No autorizado. Por favor, inicia sesión."); return; }

    setLoading(true);
    try {
      await updateUsuarioRol(user.user_id, selectedRole);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el rol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className={`${lusitana.className} text-xl font-bold mb-4 text-center`}>Cambiar Rol de: {user.nombres_apellidos}</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="new-role" className="mb-2 block text-sm font-medium">Nuevo Rol</label>
            <div className="relative">
              <select
                id="new-role"
                name="role"
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                value={selectedRole}
                onChange={(e) => {
                    setSelectedRole(e.target.value as RolUsuario);
                    if (error) setError(null);
                }}
                disabled={loading}
              >
                {Object.values(RolUsuario).map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
              {loading ? 'Guardando...' : 'Cambiar Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};