'use client';

import { Agricola } from '@/lib/types';
import { AgricolaButtons } from './AgricolaButtons';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';

interface AgricolasTableProps {
  agricolas: Agricola[];
  onEdit: (agricola: Agricola) => void;
  onDelete: (agricola: Agricola) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const MobileAgricolaCard = ({ agricola, onEdit, onDelete, canEdit, canDelete }: { agricola: Agricola } & Omit<AgricolasTableProps, 'agricolas'>) => {
    return (
        <Paper sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
            {/* Cabecera: Finca, Productor y Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1.5, mb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{agricola.finca}</Typography>
                    <Typography variant="body2" color="text.secondary">{agricola.productor_rel?.nombre_productor || 'N/A'}</Typography>
                </Box>
                <AgricolaButtons
                    onEdit={() => onEdit(agricola)}
                    onDelete={() => onDelete(agricola)}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </Box>
            {/* Cuerpo: Afiliación, MAGAP y Código */}
            <Grid container spacing={2}>
                <Grid >
                    <Typography variant="caption" color="text.secondary" display="block">Afiliación</Typography>
                    <Typography variant="body2" fontWeight="500">{agricola.afiliacion}</Typography>
                </Grid>
                <Grid >
                    <Typography variant="caption" color="text.secondary" display="block">MAGAP</Typography>
                    <Typography variant="body2" fontWeight="500">{agricola.magap}</Typography>
                </Grid>
                <Grid >
                    <Typography variant="caption" color="text.secondary" display="block">Código</Typography>
                    <Typography variant="body2" fontWeight="500">{agricola.codigo}</Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export const AgricolasTable: React.FC<AgricolasTableProps> = ({ agricolas, onEdit, onDelete, canEdit, canDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- RENDERIZADO CONDICIONAL ---
  if (isMobile) {
    return (
      <Box sx={{ mt: 2 }}>
        {agricolas.map((agricola) => (
          <MobileAgricolaCard 
            key={agricola.agricola_id}
            agricola={agricola}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
      </Box>
    );
  }

  // --- VISTA DE ESCRITORIO (TABLA) ---
  return (
    <Paper sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden', mt: 3 }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, pl: 3 }}>Afiliación</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Productor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Finca</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right', pr: 3 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agricolas.map((agricola) => (
              <TableRow hover key={agricola.agricola_id}>
                <TableCell sx={{ pl: 3 }}>{agricola.afiliacion}</TableCell>
                <TableCell>{agricola.productor_rel?.nombre_productor || 'N/A'}</TableCell>
                <TableCell>{agricola.finca}</TableCell>
                <TableCell>{agricola.codigo}</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  <AgricolaButtons
                    onEdit={() => onEdit(agricola)}
                    onDelete={() => onDelete(agricola)}
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
  );
};