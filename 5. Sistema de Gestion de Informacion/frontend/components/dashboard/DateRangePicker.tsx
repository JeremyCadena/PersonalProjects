'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import { Button, Popover, Box, useMediaQuery, useTheme, PopoverOrigin } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import '@/components/ui/day-picker.css';

interface DateRangePickerProps {
  range: DateRange | undefined; 
  onDateChange: (range: DateRange | undefined) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, onDateChange, className }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  let buttonText = 'Seleccionar Rango';
  if (range?.from) {
    const dateFormat = isMobile ? 'd MMM' : 'd LLL, y';
    if (range.to) {
      buttonText = `${format(range.from, dateFormat, { locale: es })} - ${format(range.to, dateFormat, { locale: es })}`;
    } else {
      buttonText = `Desde ${format(range.from, dateFormat, { locale: es })}`;
    }
  }

  const anchorOrigin: PopoverOrigin = {
    vertical: 'bottom',
    horizontal: isMobile ? 'center' : 'right',
  };

  const transformOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: isMobile ? 'center' : 'right',
  };

  return (
    <div className={className}>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        sx={{
          height: '40px',
          color: 'text.secondary',
          borderColor: 'rgba(0, 0, 0, 0.23)',
          width: { xs: '100%', sm: 'auto' }, 
        }}
      >
        <CalendarTodayIcon sx={{ mr: 1 }} />
        <span className="whitespace-nowrap">{buttonText}</span>
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}       
        transformOrigin={transformOrigin}
        PaperProps={{
          sx: {
            width: isMobile ? 'calc(100vw - 32px)' : 'auto',
            maxWidth: isMobile ? '400px' : 'none',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={onDateChange}
            locale={es} 
            numberOfMonths={isMobile ? 1 : 2}
            pagedNavigation
            showWeekNumber = {!isMobile}
            showOutsideDays = {isMobile ? true : false}
          />
        </Box>
      </Popover>
    </div>
  );
};