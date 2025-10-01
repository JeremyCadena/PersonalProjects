'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/login/card';
import { Box, Typography, Stack, LinearProgress, linearProgressClasses } from '@mui/material';
import { FlagIcon } from 'react-flag-kit';
import { code3to2 } from '@/lib/country_data'

interface LeaderboardData {
  id: string;
  label: string;
  value: number;
}

interface CountryLeaderboardProps {
  title: string;
  data: LeaderboardData[];
  colors: string[];
}

export default function CountryLeaderboard({ title, data, colors }: CountryLeaderboardProps) {
  const totalCount = data.reduce((sum, item) => sum + item.value, 0);

  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .map((item, index) => {
      const percentage = totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0;
      const countryCode2Letters = code3to2[item.id]; 

      return {
        name: item.label,
        value: item.value,
        percentage: percentage,
        color: colors[index % colors.length],
        countryCode: countryCode2Letters,
      };
    });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Total: {totalCount.toLocaleString('es-ES')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        <Stack spacing={3}>
          {sortedData.map((item) => (
            <Box key={item.name}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  {item.countryCode && <FlagIcon code={item.countryCode} size={24} />}
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                </div>
                <p className="text-sm font-medium text-gray-600">{item.value.toLocaleString('es-ES')}</p>
              </div>
              <LinearProgress
                variant="determinate"
                value={item.percentage}
                sx={{
                  height: 6,
                  borderRadius: 5,
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: item.color,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}