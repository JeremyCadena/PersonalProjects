// ARCHIVO: /components/dashboard/usuarios/EditUserForm.tsx
'use client';

import React, { useState } from 'react';
import { Usuario, UsuarioUpdate, RolUsuario} from '@/lib/types';
import { updateUsuario } from '@/lib/api';
import { EnvelopeIcon, LockClosedIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/ui/fonts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface EditUserFormProps {
  user: Usuario;
  onClose: () => void;
  onSuccess: () => void;
}

type UserEditFormData = Omit<UsuarioUpdate, 'is_active'>;

export const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UserEditFormData>({
    nickname: user.nickname,
    nombres_apellidos: user.nombres_apellidos,
    role: user.role,
    password: '', 
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserEditFormData, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof UserEditFormData]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof UserEditFormData];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserEditFormData, string>> = {};
    if (!formData.nickname?.trim()) {
        newErrors.nickname = 'El nombre de usuario es requerido.';
    }
    if (!formData.nombres_apellidos?.trim()) {
        newErrors.nombres_apellidos = 'El nickname es requerido.';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!token) {
      setApiError("No autorizado.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const dataToSend: UsuarioUpdate = {
        nickname: formData.nickname,
        nombres_apellidos: formData.nombres_apellidos,
        role: formData.role,
      };
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      await updateUsuario(user.user_id, dataToSend);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al actualizar el usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Editar Usuario: {user.nombres_apellidos}</h2>
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {/* Nombres y Apellidos */}
            <div className="mb-4">
              <label htmlFor="nombres_apellidos-edit" className="mb-2 block text-sm font-medium">Nombre y Apellido</label>
              <div className="relative">
                <input type="text" id="nombres_apellidos-edit" name="nombres_apellidos" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.nombres_apellidos} onChange={handleChange} disabled={isLoading} />
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.nombres_apellidos && <p className="text-red-500 text-xs mt-1">{fieldErrors.nombres_apellidos}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="nickname-edit" className="mb-2 block text-sm font-medium">Nombre de Usuario</label>
              <div className="relative">
                <input type="nickname" id="nickname-edit" name="nickname" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.nickname} onChange={handleChange} disabled={isLoading} />
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.nickname && <p className="text-red-500 text-xs mt-1">{fieldErrors.nickname}</p>}
            </div>

            {/* Rol */}
            <div className="mb-4">
              <label htmlFor="role-edit" className="mb-2 block text-sm font-medium">Rol</label>
              <div className="relative">
                <select id="role-edit" name="role" className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2.5 pl-10 text-sm" value={formData.role} onChange={handleChange} disabled={isLoading}>
                  {Object.values(RolUsuario).map(roleValue => (
                    <option key={roleValue} value={roleValue}>{roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}</option>
                  ))}
                </select>
                <UserGroupIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password-edit" className="mb-2 block text-sm font-medium">Nueva Contraseña</label>
              <div className="relative">
                <input type="password" id="password-edit" name="password" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" placeholder="Dejar vacío para no cambiar" value={formData.password} onChange={handleChange} disabled={isLoading} />
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};