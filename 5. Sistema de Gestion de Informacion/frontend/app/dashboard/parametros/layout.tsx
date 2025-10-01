'use client';

import React from 'react';
import { Box, Tabs, Tab, Paper, Typography, useMediaQuery, useTheme, Divider } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

const TABS = [
  { label: 'Agrícolas', href: '/dashboard/parametros/agricolas' },
  { label: 'Choferes', href: '/dashboard/parametros/choferes' },  
  { label: 'Marcas', href: '/dashboard/parametros/marcas' },
  { label: 'Jefes de Planta', href: '/dashboard/parametros/jefesPlanta' },
  { label: 'Productores', href: '/dashboard/parametros/productores' },
  { label: 'Puertos', href: '/dashboard/parametros/puertos' },
  { label: 'Destinos', href: '/dashboard/parametros/destinos' },
  { label: 'Exportadoras', href: '/dashboard/parametros/exportadoras' },
];

export default function ParametrosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ width: '100%', padding: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} className={lusitana.className} fontWeight="bold">
          Parámetros de Operación
        </Typography>
      </Box>

      {/* El Paper ahora simplemente contiene las pestañas y el contenido verticalmente */}
      <Paper sx={{ width: '100%', borderRadius: '12px' }}>
        {/* Pestañas Horizontales y Desplazables */}
        <Tabs
          value={pathname}
          variant="scrollable" // <-- Permite el scroll horizontal si no caben
          scrollButtons="auto"
          aria-label="pestañas de parámetros"
          sx={{
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: '#144836',
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#144836',
              fontWeight: 'bold',
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.href}
              label={tab.label}
              value={tab.href}
              component={Link}
              href={tab.href}
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            />
          ))}
        </Tabs>
        
        {/* Contenido que se muestra debajo de las pestañas */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
}