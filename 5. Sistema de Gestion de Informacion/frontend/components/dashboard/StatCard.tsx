'use client';

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/login/card';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactElement;
  colorClassName?: string; // Para pasar clases de color de Tailwind
  growth?: number;
}

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

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  subtitle, 
  value, 
  icon, 
  colorClassName = 'text-gray-800', // Color por defecto
  growth
}) => {
  return (
    <Card>
      <CardHeader>
        <div className={`flex items-center gap-x-3`}>
          <CardTitle>{title}</CardTitle>
          <GrowthIndicator value={growth} />
        </div>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center gap-x-3 ${colorClassName}`}>
            {React.cloneElement(icon)}
            <span className="text-4xl font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
};