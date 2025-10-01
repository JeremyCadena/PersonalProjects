// ARCHIVO: /components/auth/RegisterForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { registerUser } from '@/lib/api';
import Link from 'next/link';
import { lusitana } from '../ui/fonts';
import { Button } from '../ui/Button';

type FormErrors = Partial<Record<'nickname' | 'nombres_apellidos' | 'password' | 'confirmPassword', string>>;

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nickname: '',
    nombres_apellidos: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nickname) newErrors.nickname = 'El nickname es requerido.';
    if (!formData.nombres_apellidos) newErrors.nombres_apellidos = 'El nombre es requerido.';
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await registerUser({
        nickname: formData.nickname,
        nombres_apellidos: formData.nombres_apellidos,
        password: formData.password,
      });
      setSuccessMessage('¡Registro exitoso! Redirigiendo al inicio de sesión...');
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setApiError(err.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <h1 className={`${lusitana.className} mb-3 text-2xl text-center`}>
        Crear una Cuenta
      </h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
          {successMessage}
        </div>
      )}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {apiError}
        </div>
      )}

      {/* Campo Nickname */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium" htmlFor="nickname">Nickname</label>
        <div className="relative">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm"
            id="nickname" type="text" name="nickname"
            placeholder="Ingresa tu nickname"
            value={formData.nickname} onChange={handleChange}
            required disabled={loading}
          />
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
        {fieldErrors.nickname && <p className="text-red-500 text-xs mt-1">{fieldErrors.nickname}</p>}
      </div>

      {/* Campo Nombres Apellidos */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium" htmlFor="nombres_apellidos">Nombre y Apellido</label>
        <div className="relative">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm"
            id="nombres_apellidos" type="text" name="nombres_apellidos"
            placeholder="Ingresa tu Nombre y Apellido"
            value={formData.nombres_apellidos} onChange={handleChange}
            required disabled={loading}
          />
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
        {fieldErrors.nombres_apellidos && <p className="text-red-500 text-xs mt-1">{fieldErrors.nombres_apellidos}</p>}
      </div>

      {/* Campo Contraseña */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium" htmlFor="password">Contraseña</label>
        <div className="relative">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm"
            id="password" type="password" name="password"
            placeholder="Crea una contraseña"
            value={formData.password} onChange={handleChange}
            required minLength={6} disabled={loading}
          />
          <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
        {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
      </div>

      {/* Campo Confirmar Contraseña */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium" htmlFor="confirmPassword">Confirma Contraseña</label>
        <div className="relative">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm"
            id="confirmPassword" type="password" name="confirmPassword"
            placeholder="Confirma tu contraseña"
            value={formData.confirmPassword} onChange={handleChange}
            required disabled={loading}
          />
          <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
        {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
      </div>

      <Button className="mt-4 w-full" type="submit" isLoading={loading}>
        Registrarse
      </Button>
      
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-green-700 hover:underline">
          ¿Ya tienes cuenta? Inicia Sesión
        </Link>
      </div>
    </form>
  );
};