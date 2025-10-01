'use client';

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/login/card';

interface AlertCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactElement;
  onClick?: () => void; // Para hacerlo clickeable
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  title, 
  subtitle, 
  value, 
  icon, 
  onClick 
}) => {
  return (
    <Card 
      className={`
        border-red-300 bg-red-50 
        ${onClick ? 'cursor-pointer hover:bg-red-100 transition-colors' : ''}
      `}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          
          <CardTitle className="text-red-800">{title}</CardTitle>
        </div>
        <CardDescription className="text-red-700">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* El valor numérico es el elemento más prominente */}
        <div className="flex items-center gap-x-3 text-4xl font-bold text-red-900">
            {React.cloneElement(icon)}
            {value}
        </div>
      </CardContent>
    </Card>
  );
};