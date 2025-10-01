import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateToISOInput = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Ajusta para la zona horaria local y luego formatea a YYYY-MM-DD
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

export const formatISODateToLocal = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Guayaquil' });
    } catch (e) {
        console.error("Error al formatear fecha ISO:", e);
        return isoString; // Retorna original si hay error de formato
    }
};

export const formatDateTimeToLocal = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            timeZone: 'America/Guayaquil'
        });
    } catch (e) {
        console.error("Error al formatear fecha/hora ISO:", e);
        return isoString;
    }
};