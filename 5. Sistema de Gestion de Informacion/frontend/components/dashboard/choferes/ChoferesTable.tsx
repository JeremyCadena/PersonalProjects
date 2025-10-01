'use client';

import { Chofer } from '@/lib/types';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, Avatar,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ChoferButtons } from './ChoferButtons';

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name: string) {
  const initials = `${name.split(' ')[0][0]}${name.split(' ')[1]?.[0] || ''}`.toUpperCase();
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 32,
      height: 32,
      fontSize: '0.875rem'
    },
    children: initials,
  };
}

interface ChoferesTableProps {
  choferes: Chofer[];
  onEdit: (chofer: Chofer) => void;
  onDelete: (chofer: Chofer) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const MobileChoferCard = ({ chofer, onEdit, onDelete, canEdit, canDelete }: { chofer: Chofer } & Omit<ChoferesTableProps, 'choferes'>) => {
    return (
        <Paper sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
            {/* Cabecera: Avatar, Nombre y Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1.5, mb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar {...stringAvatar(`${chofer.nombres} ${chofer.apellidos}`)} />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{`${chofer.nombres} ${chofer.apellidos}`}</Typography>
                        <Typography variant="body2" color="text.secondary">{chofer.cedula}</Typography>
                    </Box>
                </Box>
                <ChoferButtons
                    onEdit={() => onEdit(chofer)}
                    onDelete={() => onDelete(chofer)}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </Box>
            {/* Cuerpo: Placa y Teléfono */}
            <Grid container spacing={2}>
                <Grid>
                    <Typography variant="caption" color="text.secondary" display="block">Placa</Typography>
                    <Typography variant="body2" fontWeight="500">{chofer.placa_cabezal}</Typography>
                </Grid>
                <Grid >
                    <Typography variant="caption" color="text.secondary" display="block">Teléfono</Typography>
                    <Typography variant="body2" fontWeight="500">{chofer.telefono}</Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export const ChoferesTable: React.FC<ChoferesTableProps> = ({ choferes, onEdit, onDelete, canEdit, canDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
  // --- 2. RENDERIZADO CONDICIONAL ---
  if (isMobile) {
    return (
      <Box sx={{ mt: 2 }}>
        {choferes.map((chofer) => (
          <MobileChoferCard 
            key={chofer.chofer_id}
            chofer={chofer}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, pl: 3 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cédula</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Placa</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right', pr: 3 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {choferes.map((chofer) => (
                <TableRow hover key={chofer.chofer_id}>
                  <TableCell sx={{ pl: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar {...stringAvatar(`${chofer.nombres} ${chofer.apellidos}`)} />
                      <Typography variant="body2" fontWeight="500">{`${chofer.nombres} ${chofer.apellidos}`}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{chofer.cedula}</TableCell>
                  <TableCell>{chofer.placa_cabezal}</TableCell>
                  <TableCell>{chofer.telefono}</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <ChoferButtons
                      onEdit={() => onEdit(chofer)}
                      onDelete={() => onDelete(chofer)}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};