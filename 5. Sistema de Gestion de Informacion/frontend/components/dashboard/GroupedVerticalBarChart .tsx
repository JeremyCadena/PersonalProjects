'use client';

import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/login/card';

interface GroupedChartData {
    variante: string;
    [key: string]: string | number;
}

interface GroupedBarChartProps {
  title: string;
  subtitle?: string;
  data: GroupedChartData[];
  categories: string[]; 
  colors: string[]; 
}

const MobileGroupedList = ({ data, categories, colors }: GroupedBarChartProps) => (
    <div className="w-full h-[400px] overflow-y-auto pr-2">
        <div className="space-y-6">
            {data.map((item, index) => (
                <div key={index}>
                    <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">{item.variante}</h4>
                    <ul className="space-y-2">
                        {categories.map((category, catIndex) => (
                            <li key={category} className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                    <span 
                                        className="w-3 h-3 rounded-full mr-2" 
                                        style={{ backgroundColor: colors[catIndex % colors.length] }}
                                    ></span>
                                    <span className="text-gray-600">{category}</span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {(item[category] as number).toLocaleString('es-ES')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

export default function GroupedVerticalBarChart({ title, subtitle, data, categories, colors }: GroupedBarChartProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
   
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ height: 400 }}>
                    {data.length > 0 ? (
                        isMobile ? (
                            <MobileGroupedList title={title} data={data} categories={categories} colors={colors} />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="variante" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(230, 230, 230, 0.4)' }}
                                        contentStyle={{
                                            background: 'white', border: '1px solid #ccc',
                                            borderRadius: '5px', padding: '5px 10px'
                                        }}
                                    />
                                    <Legend />
                                    {categories.map((category, index) => (
                                        <Bar 
                                            key={category} 
                                            dataKey={category} 
                                            fill={colors[index % colors.length]} 
                                            radius={[6, 6, 0, 0]}
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