'use client';

import { JefePlanta } from '@/lib/types';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, Avatar,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ParametrosButtons } from '../ParametrosButtons';

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

interface JefesTableProps {
  jefes_planta: JefePlanta[];
  onEdit: (jefes_planta: JefePlanta) => void;
  onDelete: (jefes_planta: JefePlanta) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const MobileJefeCard = ({ jefe_planta, onEdit, onDelete, canEdit, canDelete }: { jefe_planta: JefePlanta } & Omit<JefesTableProps, 'jefes_planta'>) => {
    return (
        <Paper sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
            {/* Cabecera: Avatar, Nombre y Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1.5, mb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar {...stringAvatar(`${jefe_planta.nombres} ${jefe_planta.apellidos}`)} />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{`${jefe_planta.nombres} ${jefe_planta.apellidos}`}</Typography>
                        <Typography variant="body2" color="text.secondary">{jefe_planta.cedula}</Typography>
                    </Box>
                </Box>
                <ParametrosButtons
                    onEdit={() => onEdit(jefe_planta)}
                    onDelete={() => onDelete(jefe_planta)}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </Box>
            {/* Cuerpo: Placa y Teléfono */}
            <Grid container spacing={2}>
                <Grid >
                    <Typography variant="caption" color="text.secondary" display="block">Teléfono</Typography>
                    <Typography variant="body2" fontWeight="500">{jefe_planta.telefono}</Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export const JefesTable: React.FC<JefesTableProps> = ({ jefes_planta, onEdit, onDelete, canEdit, canDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

  // --- 2. RENDERIZADO CONDICIONAL ---
    if (isMobile) {
      return (
        <Box sx={{ mt: 2 }}>
          {jefes_planta.map((jefe_planta) => (
            <MobileJefeCard 
              key={jefe_planta.jefe_planta_id}
              jefe_planta={jefe_planta}
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
      <Paper sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, paddingLeft: '24px' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cédula</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right', paddingRight: '60px' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jefes_planta.map((jefe_planta) => (
                <TableRow hover key={jefe_planta.jefe_planta_id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ paddingLeft: '24px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar {...stringAvatar(`${jefe_planta.nombres} ${jefe_planta.apellidos}`)} />
                      <Typography variant="body2" fontWeight="500">{`${jefe_planta.nombres} ${jefe_planta.apellidos}`}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{jefe_planta.cedula}</TableCell>
                  <TableCell>{jefe_planta.telefono}</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <ParametrosButtons
                      onEdit={() => onEdit(jefe_planta)}
                      onDelete={() => onDelete(jefe_planta)}
                      canEdit
                      canDelete
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