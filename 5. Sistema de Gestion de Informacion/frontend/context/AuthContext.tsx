// /context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthToken, Usuario, RolUsuario } from '@/lib/types';
import { loginUser, getCurrentUser } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
// import Cookies from 'js-cookie'; // <-- ELIMINAR: js-cookie no puede leer cookies HTTP-only

// Define la forma del contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null;
  token: string | null; // El token puede ser null si se lee solo de la cookie
  role: RolUsuario | null;
  loadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null); // Mantener por si acaso, aunque el principal es la cookie
  const [role, setRole] = useState<RolUsuario | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  const clearAuthData = useCallback(() => {
    // sessionStorage.removeItem('auth_token'); // Ya estaba comentado, buen trabajo.
    // Cookies.remove('access_token_cookie'); // <-- ELIMINAR: No funciona para cookies HTTP-only.
                                          // El backend debe tener un endpoint de logout para esto.
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const loadUserSession = async () => {
      setLoadingAuth(true);
      try {
        // Intentar obtener el usuario actual. Si la cookie HTTP-only es válida,
        // el navegador la enviará automáticamente y la llamada tendrá éxito.
        // Si no hay cookie, está expirada o es inválida, el backend devolverá 401.
        const currentUser = await getCurrentUser(); // Ya no pasamos el token, se confía en la cookie
        setToken("valid_from_cookie"); // Puedes poner un valor simbólico o null si no necesitas el valor del token en el frontend
        setUser(currentUser);
        setRole(currentUser.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al verificar la sesión (posiblemente no autenticado o token expirado):', error);
        clearAuthData(); // Limpiar el estado local si la verificación falla
      } finally {
        setLoadingAuth(false);
      }
    };

    loadUserSession();
  }, [clearAuthData]);

  const saveAuthData = useCallback((authToken: AuthToken, userData: Usuario) => {
    // sessionStorage.setItem('auth_token', authToken.access_token); // Ya estaba comentado.
    setToken(authToken.access_token); // Esto actualiza el estado local (opcional si no se usa directamente)
    setUser(userData);
    setRole(userData.role);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const authToken = await loginUser(email, password);
        // Después de un login exitoso, la cookie HTTP-only ya debería estar establecida por el backend.
        // Ahora, volvemos a llamar a getCurrentUser para obtener los datos del usuario
        // y confirmar que la sesión está activa a través de la cookie.
        const currentUser = await getCurrentUser(); 
        saveAuthData(authToken, currentUser); // Actualiza el estado local
      } catch (error) {
        clearAuthData();
        throw error;
      }
    },
    [saveAuthData, clearAuthData],
  );

  const logout = useCallback(() => {
    clearAuthData();
    // IMPORTANTE: Aquí deberías llamar a un endpoint de logout en tu backend
    // que sea el encargado de invalidar la cookie HTTP-only en el servidor.
    // Ejemplo: apiFetch('/logout', { method: 'POST' });
    router.push('/');
  }, [clearAuthData, router]);

  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const value = { isAuthenticated, user, token, role, loadingAuth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};