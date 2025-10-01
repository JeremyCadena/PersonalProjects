// ARCHIVO: /app/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { EnvelopeIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/ui/fonts';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(nickname, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error desconocido al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-4 pb-4 pt-8 md:px-6">
        <h1 className={`${lusitana.className} mb-3 text-2xl text-center`}>
          Iniciar Sesión
        </h1>
        <div className="w-full">
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="nickname">
              Usuario
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="nickname"
                type="nickname"
                name="nickname"
                placeholder="Ingrese nombre de usuario"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Ingrese su contraseña"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <Button className="mt-4 w-full" type="submit" isLoading={loading}>
          Iniciar Sesión
        </Button>
       {error && (
          <div className="flex items-end space-x-1 mt-2">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
      </div>
    </form>
  );
};