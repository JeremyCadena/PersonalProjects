'use client';

import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/login/card';

interface StackedChartData {
    finca: string;
    [key: string]: string | number;
}

interface StackedBarChartProps {
  title: string;
  data: StackedChartData[];
  variants: string[]; 
  colors: string[]; 
}

const MobileStackedList = ({ data, variants, colors }: StackedBarChartProps) => {
    return (
        <div className="w-full h-[400px] overflow-y-auto pr-2">
            <div className="space-y-6"> {/* Aumentamos el espacio entre fincas */}
                {data.map((item, index) => {
                    const totalValue = variants.reduce((sum, variant) => sum + (item[variant] as number), 0);
                    return (
                        <div key={index}>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-bold text-gray-800">{item.finca}</span>
                                <span className="text-sm font-semibold text-gray-600">
                                    Total: {totalValue.toLocaleString('es-ES')}
                                </span>
                            </div>
                            {/* Barra de progreso segmentada */}
                            <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-200">
                                {variants.map((variant, catIndex) => {
                                    const percentage = totalValue > 0 ? ((item[variant] as number) / totalValue) * 100 : 0;
                                    return (
                                        <div 
                                            key={variant}
                                            title={`${variant}: ${item[variant]}`}
                                            className="h-full" 
                                            style={{ 
                                                width: `${percentage}%`, 
                                                backgroundColor: colors[catIndex % colors.length] 
                                            }}
                                        ></div>
                                    );
                                })}
                            </div>

                            {/* --- INICIO DE LA LEYENDA MÓVIL --- */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                {variants.map((variant, catIndex) => (
                                    <div key={variant} className="flex items-center">
                                        <span 
                                            className="w-2 h-2 rounded-full mr-1.5"
                                            style={{ backgroundColor: colors[catIndex % colors.length] }}
                                        ></span>
                                        <span className="text-xs text-gray-600">{variant}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function StackedVerticalBarChart({ title, data, variants, colors }: StackedBarChartProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: 400 }}>
                    {data.length > 0 ? (
                        // --- 2. RENDERIZADO CONDICIONAL ---
                        isMobile ? (
                            <MobileStackedList title={title} data={data} variants={variants} colors={colors} />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="finca" 
                                        angle={-35}
                                        textAnchor="end"
                                        tick={{ fontSize: 11 }} 
                                        interval={0}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(230, 230, 230, 0.4)' }}
                                        contentStyle={{
                                            background: 'white', border: '1px solid #ccc',
                                            borderRadius: '5px', padding: '5px 10px'
                                        }}
                                    />
                                    <Legend />
                                    {variants.map((variant, index) => (
                                        <Bar 
                                            key={variant} 
                                            dataKey={variant} 
                                            stackId="a" 
                                            fill={colors[index % colors.length]} 
                                            radius={[6, 6, 0, 0]} // Solo redondea la barra superior
                                        />
                                    ))}
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