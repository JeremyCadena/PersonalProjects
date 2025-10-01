'use client';

import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles'; // styled se mantiene para el SVG
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/login/card';


// ----------------------------------------------------------------------------------
// COMPONENTES ESTILIZADOS PARA EL TEXTO DEL CENTRO DEL GRÁFICO
// ----------------------------------------------------------------------------------

// Definición de las props para el componente estilizado
interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

// Componente estilizado para el texto dentro del PieChart (SVG)
const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

// ----------------------------------------------------------------------------------
// COMPONENTE PARA EL TEXTO CENTRAL DEL GRÁFICO DE ANILLO
// ----------------------------------------------------------------------------------
interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

// ----------------------------------------------------------------------------------
// COMPONENTE PARA LA BARRA DE PROGRESO INDIVIDUAL
// ----------------------------------------------------------------------------------
interface CustomProgressBarProps {
  name: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

const CustomProgressBar = ({ name, value, color }: { name: string; value: number; color: string }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1 gap-4"> {/* Añadimos gap-4 para dar espacio */}
      
      <p className="text-[9px] font-medium text-gray-700" title={name} >
        {name}
      </p>

      <p className="text-xs text-gray-500 flex-shrink-0">{value}%</p> {/* flex-shrink-0 evita que el % se encoja */}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div 
        className="h-1.5 rounded-full" 
        style={{ width: `${value}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

// ----------------------------------------------------------------------------------
// COMPONENTE PRINCIPAL REUTILIZABLE
// ----------------------------------------------------------------------------------
interface CustomPieChartProps {
  title: string;
  subtitle?: string;
  data: { label: string; value: number }[];
  colors: string[];
  totalLabel?: string;
  itemIcons?: React.ReactNode[];
  showProgressBarLegend?: boolean;
}

export default function CustomPieChart({ title, data, colors, subtitle, showProgressBarLegend = true }: CustomPieChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const totalCount = data.reduce((sum, item) => sum + item.value, 0);

  const progressData = data.map((item, index) => ({
    name: item.label,
    value: totalCount > 0 ? Math.round(item.value / totalCount * 100) : 0,
    color: colors[index % colors.length],
  }));

  return (
    // 3. Estructura Principal con tus Componentes Semánticos de Card
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        {/* 4. Layout Principal Adaptable con Flexbox de Tailwind */}
        {/* En móvil se apila, en escritorio se alinea horizontalmente */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* Contenedor del Gráfico */}
          <div className="w-full md:w-1/2 flex justify-center">
            <PieChart
              colors={colors}
              series={[{
                data,
                innerRadius: 60,
                outerRadius: 80,
                paddingAngle: 2,
                highlightScope: { fade: 'global', highlight: 'item' },
              }]}
              height={200} // Altura fija para el gráfico
              width={200}  // Ancho fijo para el gráfico
              margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
              hideLegend
            >
              <PieCenterLabel primaryText={totalCount.toLocaleString('es-ES')} secondaryText="Total" />
            </PieChart>
          </div>

          {/* Contenedor de la Leyenda */}
          {showProgressBarLegend && (
            <div className="w-full md:w-1/2">
              {progressData.map((item, index) => (
                <CustomProgressBar
                  key={index}
                  name={item.name}
                  value={item.value}
                  color={item.color}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}