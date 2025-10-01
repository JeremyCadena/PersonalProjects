// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar esta librería: npm install jwt-decode
import { RolUsuario } from '@/lib/types'; // Asegúrate de que la ruta sea correcta para tus tipos

// Define tus rutas protegidas y roles requeridos
const AUTHENTICATED_ROUTES_PREFIX = '/dashboard'; // Todas las rutas bajo /dashboard requieren autenticación
const ADMIN_ONLY_ROUTES = [
    '/dashboard/usuarios',
    '/dashboard/agricolas',
    '/dashboard/choferes'
];
// Añade aquí cualquier otra ruta que deba ser solo para administradores.

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
    '/', // Login page
    '/register' // Registration page
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Manejar rutas públicas: Si es una ruta pública, permitir acceso sin comprobaciones
    if (PUBLIC_ROUTES.includes(pathname)) {
        // Si está autenticado e intenta ir a login/register, redirigir a dashboard
        const token = request.cookies.get('access_token_cookie')?.value;
        if (token) {
            try {
                // Opcional: decodificar para verificar si el token es válido
                jwtDecode(token);
                return NextResponse.redirect(new URL(AUTHENTICATED_ROUTES_PREFIX, request.url));
            } catch (error) {
                // Token inválido, dejar que acceda a login/register para reautenticarse
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    // 2. Rutas estáticas o API internas de Next.js: Ignorar
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static')) {
        return NextResponse.next();
    }

    // 3. Obtener el token de la cookie (establecido por el backend)
    const token = request.cookies.get('access_token_cookie')?.value;
    let decodedToken: any = null;
    let rolUsuario: RolUsuario | null = null;
    let userId: number | null = null;
    let userEmail: string | null = null;

    if (token) {
        try {
            decodedToken = jwtDecode(token);
            // Verificar si el token ha expirado (exp es en segundos UNIX)
            if (decodedToken.exp < Date.now() / 1000) {
                decodedToken = null; // Token expirado
            } else {
                rolUsuario = decodedToken.role as RolUsuario;
                userId = decodedToken.id as number;
                userEmail = decodedToken.sub as string;
            }
        } catch (error) {
            console.error('Token inválido o error al decodificar:', error);
            decodedToken = null; // Token inválido
        }
    }

    // 4. Protección para rutas autenticadas (ej. /dashboard)
    const isProtectedRoute = pathname.startsWith(AUTHENTICATED_ROUTES_PREFIX);

    if (isProtectedRoute) {
        if (!decodedToken) {
            // No autenticado o token inválido/expirado, redirigir a la página de login
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('access_token_cookie'); // Limpiar la cookie expirada/inválida
            return response;
        }

        // 5. Protección por rol para rutas específicas (ej. /dashboard/usuarios)
        const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));

        if (isAdminOnlyRoute && rolUsuario !== RolUsuario.ADMIN) {
            // No es administrador, redirigir a una página permitida (ej. /dashboard principal)
            return NextResponse.redirect(new URL(AUTHENTICATED_ROUTES_PREFIX, request.url));
        }
    }

    // Si todo está bien, permitir la solicitud
    return NextResponse.next();
}

// Configuración de rutas para el middleware
export const config = {
    // El matcher aplica el middleware a todas las rutas que comiencen con / o /dashboard
    // Esto excluye archivos estáticos en /public y rutas de API internas de Next.js
    matcher: ['/', '/register', '/dashboard/:path*'],
};