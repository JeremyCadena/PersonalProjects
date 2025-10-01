'use client';

import React from 'react';
import { Chip, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface RiskBadgeProps {
  destinoName: string;
  riesgo: number;
}

// Función auxiliar para determinar el nivel de riesgo y el color
const getRiskInfo = (riesgo: number) => {
  if (riesgo >= 1000) {
    return { label: 'ALTO', color: 'error', description: 'El riesgo es ALTO debido a un histórico de decomisos superior a 1000 toneladas.' };
  }
  if (riesgo >= 100) {
    return { label: 'MEDIO', color: 'warning', description: 'El riesgo es MEDIO debido a un histórico de decomisos entre 100 y 999 toneladas.' };
  }
  return { label: 'BAJO', color: 'success', description: 'El riesgo es BAJO debido a un histórico de decomisos inferior a 100 toneladas.' };
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ destinoName, riesgo }) => {
  const { label, color, description } = getRiskInfo(riesgo);

  const tooltipContent = (
    <React.Fragment>
      <Typography variant="body2" gutterBottom>
        <b>{destinoName}</b>
      </Typography>
      <Typography variant="caption">{description}</Typography>
      <br />
      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
        TOTAL DE DROGA: {riesgo} toneladas decomisadas.
      </Typography>
      <br />
      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
        FUENTE: POLICIA NACIONAL DEL ECUADOR (TENDENCIAS DEL NARCOTRAFICO)
      </Typography>
    </React.Fragment>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Chip
        label={label}
        color={color as "error" | "warning" | "success"}
        size="small"
        sx={{ fontWeight: 'bold', cursor: 'help' }}
        icon={<InfoOutlinedIcon fontSize="small" />}
      />
    </Tooltip>
  );
};