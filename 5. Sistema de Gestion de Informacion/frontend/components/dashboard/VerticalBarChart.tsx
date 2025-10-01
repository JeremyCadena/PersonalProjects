'use client';

import React from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { CardContent, Typography, Box } from '@mui/material';
import { Card, CardDescription, CardHeader, CardTitle } from '../login/card';

export interface BarChartData {
    label: string;
    value: number;
}

interface VerticalBarChartProps {
  title: string;
  subtitle?: string;
  data: BarChartData[];
  colors: string[]; 
}

// Componente personalizado para renderizar las etiquetas del eje X
const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={16} // Desplazamiento vertical para dar espacio
                textAnchor="end"
                fill="#666"
                transform="rotate(-35)" // 1. ETIQUETAS INCLINADAS A 35 GRADOS
                fontSize={12}
            >
                {payload.value}
            </text>
        </g>
    );
};


export default function VerticalBarChart({ title, subtitle, data, colors }: VerticalBarChartProps) {
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const EmptyState = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
      <Typography color="text.secondary">No hay datos para mostrar.</Typography>
    </Box>
  );

  return (
    <Card >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {sortedData.length > 0 ? (
          <Box sx={{ width: '100%', height: 350, flexGrow: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0, // 3. GRÁFICO MÁS A LA IZQUIERDA
                  bottom: 70, // Espacio para las etiquetas inclinadas
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  height={80} // Altura reservada para el eje X
                  interval={0} // Muestra todas las etiquetas
                  tick={<CustomTick />} // Usa nuestro componente de etiqueta personalizado
                />
                <YAxis />
                <Tooltip 
                    cursor={{fill: 'rgba(230, 230, 230, 0.4)'}}
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        padding: '5px 10px'
                    }}
                    formatter={(value: number, name: string) => [`${value.toLocaleString('es-ES')}`, 'Total']}
                    labelFormatter={(label: string) => <span style={{ fontWeight: 'bold' }}>{label}</span>}
                />
                <Bar 
                  dataKey="value" 
                  fill={colors[0]} // Color principal para las barras
                  radius={[6, 6, 0, 0]} // Bordes superiores redondeados (opcional, toque sutil)
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}