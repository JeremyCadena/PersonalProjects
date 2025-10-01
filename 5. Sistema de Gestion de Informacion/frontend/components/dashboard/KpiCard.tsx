// /components/dashboard/KpiCard.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/login/card';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface KpiCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  trendPercentage?: number;
  trendData: any[];
  trendDataKey: string;
  trendName: string;
  trendColor: string;
  icon?: React.ReactElement; 
  growth?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box sx={{
        backgroundColor: '#1a1a1a', // Fondo oscuro del tooltip
        border: '1px solid #444', p: 1, borderRadius: 1, color: 'white'}}>
        <Typography variant="body2">{`Día: ${data.date}`}</Typography>
        <Typography variant="body2">{`${payload[0].name}: ${data[payload[0].dataKey]}`}</Typography>
      </Box>
    );
  }
  return null;
};

const GrowthIndicator = ({ value }: { value?: number }) => {
  // No renderiza nada si 'value' no es un número válido
  if (value === undefined || value === null || isNaN(value)) {
    return null;
  }

  const isPositive = value >= 0;
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const Icon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <div className={`flex items-center text-sm font-semibold ${color}`}>
      <Icon className="h-4 w-4 mr-1" />
      <span>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({
  title, value, icon, subtitle, trendData, trendDataKey, trendName, trendColor, growth
}) => {
  return (
    <Card>
      <CardHeader>
        <div className={`flex items-center gap-x-3`}>
          <CardTitle>{title}</CardTitle>
          <GrowthIndicator value={growth} />
        </div>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>

      {/* 4. Usamos CardContent para el resto del contenido visual */}
      <CardContent>
        {/* 5. La lógica responsive 'flex-col md:flex-row' se mantiene aquí dentro */}
        <div className="flex flex-col md:flex-row items-center gap-x-4">
          
          {/* Sección del Valor (ocupa 1/4 en escritorio) */}
          <div className="w-full md:w-1/4 flex items-center gap-x-3 mb-4 md:mb-0">
            {icon && React.cloneElement(icon)}
            <span className="text-4xl font-bold" style={{ color: trendColor }}>
              {value}
            </span>
          </div>

          {/* Sección del Gráfico (ocupa 3/4 en escritorio) */}
          <div className="h-[100px] w-full md:w-3/4">
            {trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id={`colorTrend-${trendColor}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendColor} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={trendDataKey}
                    name={trendName}
                    stroke={trendColor}
                    fillOpacity={1}
                    fill={`url(#colorTrend-${trendColor})`}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyStateChart message="No hay datos de tendencia." />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyStateChart = ({ message }: { message: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
    <Typography>{message}</Typography>
  </Box>
);

export default KpiCard;