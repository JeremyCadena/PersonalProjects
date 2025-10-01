'use client';

import * as React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../login/card'; 
import { Paper, Typography, Box } from '@mui/material'; // Mantenemos algunos de MUI para el tooltip

// 1. COMPONENTE PARA EL CONTENIDO PERSONALIZADO DEL TREEMAP
interface CustomTreemapContentProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    depth?: number;
    name?: string;
    value?: number;
    index?: number;
    colors: string[];
}

const CustomTreemapContent = ({
    x, y, width, height, index, name, colors,
}: CustomTreemapContentProps) => {
    const color = colors[(index ?? 0) % colors.length];
    
    const textWidth = Math.max(width ? width - 10 : 0, 0);
    const textHeight = Math.max(height ? height - 10 : 0, 0);

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: color,
                    stroke: '#fff',
                    strokeWidth: 2,
                    opacity: 0.9,
                }}
            />
            {width && height && width > 30 && height > 20 && (
                <foreignObject
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                >
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        overflow: 'hidden'
                    }}>
                        <p style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            margin: 0,
                            padding: 0,
                            fontFamily: 'Roboto, sans-serif',
                        }}>
                        {name}
                    </p></div>
                </foreignObject>
            )}
        </g>
    );
};

// 2. COMPONENTE PARA EL TOOLTIP PERSONALIZADO
interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTreemapTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Paper
                sx={{
                    p: 1.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 3,
                    borderRadius: 1,
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {data.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Cantidad: {data.trueSize.toLocaleString('es-ES')}
                </Typography>
            </Paper>
        );
    }
    return null;
};


// COMPONENTE PARA LA VISTA DE LISTA MÓVIL
const MobileTreemapList = ({ data }: { data: { name: string; size: number }[] }) => (
    <div className="w-full h-[300px] overflow-y-auto pr-2">
        <ul className="space-y-4">
            {data.map((item, index) => (
                <li key={index} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700 truncate" title={item.name}>
                        {index + 1}. {item.name}
                    </span>
                    <span className="text-base font-bold text-gray-900 flex-shrink-0">
                        {item.size.toLocaleString('es-ES')}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

// 3. COMPONENTE PRINCIPAL DEL TREEMAP
interface TreemapChartProps {
    title: string;
    subtitle?: string;
    data: { name: string; size: number }[];
    colors: string[];
}

export default function TreemapChart({ title, subtitle, data, colors }: TreemapChartProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const sortedData = [...data].sort((a, b) => b.size - a.size);

    const treemapData = data.map(item => ({
        name: item.name,
        trueSize: item.size, 
        visualSize: Math.sqrt(item.size), 
    }));

    const EmptyStateChart = ({ message }: { message: string }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'text.secondary' }}>
            <Typography variant="body1">{message}</Typography>
        </Box>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                    {treemapData.length > 0 ? (
                        isMobile ? (
                            <MobileTreemapList data={sortedData} />
                        ) : (
                            <ResponsiveContainer>
                                <Treemap
                                    data={treemapData}
                                    dataKey="visualSize"
                                    aspectRatio={4 / 3}
                                    stroke="#fff"
                                    fill="#8884d8"
                                    content={<CustomTreemapContent colors={colors} />}
                                >
                                    <Tooltip content={<CustomTreemapTooltip />} />
                                </Treemap>
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