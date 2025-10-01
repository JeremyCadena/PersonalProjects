'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

interface GaugeProps {
  value: number;
}

export const Gauge: React.FC<GaugeProps> = ({ value }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', width: 150, height: 150, mt: 2 }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={150}
        thickness={4}
        sx={{
          color: (theme) => theme.palette.grey[200],
          position: 'absolute',
          left: 0,
        }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={150}
        thickness={4}
        sx={{
            color: '#04932B', // Verde corporativo
            [`& .MuiCircularProgress-circle`]: {
                strokeLinecap: 'round',
            },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" component="div" color="text.primary" fontWeight="bold">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};