'use client';

import React from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../login/card';

export interface BarChartData {
    label: string;
    value: number;
}

interface AdaptiveBarChartProps {
  title: string;
  subtitle?: string;
  data: BarChartData[];
  barColor: string; 
}

// Componente personalizado para las etiquetas del eje X en escritorio
const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    // Acorta la etiqueta si es muy larga
    const shortLabel = payload.value.length > 15 ? `${payload.value.substring(0, 13)}...` : payload.value;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)" fontSize={12}>
                {shortLabel}
            </text>
        </g>
    );
};

const MobileDataTable = ({ data, barColor }: { data: BarChartData[], barColor: string }) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
        // Contenedor que tendrá la altura fija y el scroll
        <div className="w-full h-full overflow-y-auto pr-2"> {/* pr-2 para dar espacio a la barra de scroll */}
            <ul className="space-y-3">
                {data.map((item, index) => {
                    const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                    return (
                        <li key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{item.label}</span>
                                <span className="font-semibold text-gray-800">{item.value.toLocaleString('es-ES')}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full" 
                                    style={{ width: `${percentage}%`, backgroundColor: barColor }}
                                ></div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default function AdaptiveBarChart({ title, subtitle, data, barColor }: AdaptiveBarChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const sortedData = [...data].sort((a, b) => b.value - a.value);

   return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350 }}>
          {sortedData.length > 0 ? (
            // --- 2. RENDERIZADO CONDICIONAL ---
            isMobile ? (
              <MobileDataTable data={sortedData} barColor={barColor} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 70, 
                  }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  interval={0} 
                  tick={<CustomXAxisTick />} // Usa nuestro componente de etiqueta personalizado
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
                  fill={barColor} // Color principal para las barras
                  radius={[6, 6, 0, 0]} // Bordes superiores redondeados (opcional, toque sutil)
                />
              </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No hay datos para mostrar.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}