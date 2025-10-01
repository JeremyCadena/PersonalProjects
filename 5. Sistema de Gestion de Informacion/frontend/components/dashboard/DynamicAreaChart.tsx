// /components/dashboard/DynamicAreaChart.tsx
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart, LineSeries } from '@mui/x-charts/LineChart';
import { Box, useMediaQuery } from '@mui/material';
import { CardDescription, CardHeader, CardTitle } from '../login/card';

interface DynamicAreaChartProps {
  title: string;
  mainValue: string | number;
  trendPercentage?: number;
  subtitle: string;
  data: any[]; 
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

const COLOR_PALETTE = [
  '#FFBB28', // Amarillo
  '#0088FE', // Azul
  '#FF8042', // Naranja
  '#7E57C2', // Violeta
  '#FF0000', // Rojo
  '#4CAF50', // Verde oscuro
  '#FFC107', // Ámbar
];

export default function DynamicAreaChart({
  title,
  mainValue,
  trendPercentage,
  subtitle,
  data,
}: DynamicAreaChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isPositive = trendPercentage && trendPercentage >= 0;

  const { series, gradients } = React.useMemo(() => {
    if (!data || data.length === 0) return { series: [], gradients: [] };
    const firstEntry = data[0];
    const keys = Object.keys(firstEntry).filter(key => key !== 'date');
    const series: LineSeries[] = keys.map((key, index) => {
      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
      return { id: key, label: key.replace(/_/g, ' ').toUpperCase(), dataKey: key, color, showMark: false, curve: 'linear', stack: 'total', area: true };
    });
    const gradients = series
      .filter((s): s is LineSeries & { id: string; color: string } => !!s.id && !!s.color)
      .map(s => <AreaGradient key={s.id} color={s.color} id={s.id} />);
    return { series, gradients };
  }, [data]);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </CardHeader>

          <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="h4" component="p" fontWeight="bold">
                {mainValue}
              </Typography>
              {trendPercentage !== undefined && (
                <Chip
                  size="small"
                  color={isPositive ? 'success' : 'error'}
                  label={`${isPositive ? '+' : ''}${trendPercentage}%`}
                />
              )}
            </Stack>
          </div>
        </div>
       
        <Box sx={{ height: isMobile ? 180 : 240, width: '100%' }}>
          {data && data.length > 0 ? (
            <LineChart
              dataset={data}
              xAxis={[
                {
                  scaleType: 'point',
                  dataKey: 'date',
                  tickInterval: isMobile ? (value, index) => index % 7 === 0 : (value, index) => index % 5 === 0,
                  },
              ]}
              yAxis={isMobile ? [{ hideTooltip: true }] : [{ width: 50 }]}
              series={series}
              height={isMobile ? 180 : 240}
              margin={{ left: isMobile ? 5 : 20, right: 20, top: 20, bottom: 30 }}
              grid={{ horizontal: true }}
              sx={{
                ...series.reduce((acc, s) => ({
                  ...acc,
                  [`& .MuiAreaElement-series-${s.id}`]: { fill: `url('#${s.id}')` },
                }), {}),
              }}
              hideLegend
            >
              {gradients}
            </LineChart>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
              <Typography>No hay datos para mostrar.</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}