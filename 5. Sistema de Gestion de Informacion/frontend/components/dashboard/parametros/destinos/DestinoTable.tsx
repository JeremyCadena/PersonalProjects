'use client';
import { Destino } from '@/lib/types';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ParametrosButtons } from '../ParametrosButtons';

interface DestinosTableProps {
  destinos: Destino[];
  onEdit: (destino: Destino) => void;
  onDelete: (destino: Destino) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const MobileDestinoCard = ({ destino, onEdit, onDelete, canEdit, canDelete }: { destino: Destino } & Omit<DestinosTableProps, 'destinos'>) => {
    return (
        <Paper sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
            {/* Cabecera: Nombre del Destino y Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, mb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {destino.nombre}
                </Typography>
                <ParametrosButtons
                    onEdit={() => onEdit(destino)}
                    onDelete={() => onDelete(destino)}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </Box>
            {/* Cuerpo: Histórico y Código de País */}
            <Grid container spacing={2}>
                <Grid >
                    <Typography variant="caption" color="text.secondary" display="block">Histórico (Ton.)</Typography>
                    <Typography variant="body2" fontWeight="500">{destino.riesgo_historico.toLocaleString('es-ES')}</Typography>
                </Grid>
                <Grid >
                    <Typography variant="caption" color="text.secondary" display="block">Código País</Typography>
                    <Typography variant="body2" fontWeight="500">{destino.country_code}</Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export const DestinosTable: React.FC<DestinosTableProps> = ({ destinos, onEdit, onDelete, canEdit, canDelete }) => {
  const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

    // --- 2. RENDERIZADO CONDICIONAL ---
    if (isMobile) {
        return (
            <Box sx={{ mt: 2 }}>
                {destinos.map((destino) => (
                    <MobileDestinoCard
                        key={destino.destino_id}
                        destino={destino}
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
        <Paper sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden', mt: 3 }}>
            <TableContainer>
                <Table>
                    <TableHead sx={{ backgroundColor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, pl: 3 }}>Nombre de Destino</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Histórico de Contaminación (Ton.)</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Código de País</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right', pr: 3 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {destinos.map((destino) => (
                            <TableRow hover key={destino.destino_id}>
                                <TableCell sx={{ pl: 3 }}>
                                    <Typography variant="body2" fontWeight="500">{destino.nombre}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{destino.riesgo_historico.toLocaleString('es-ES')}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">{destino.country_code}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 3 }}>
                                    <ParametrosButtons
                                        onEdit={() => onEdit(destino)}
                                        onDelete={() => onDelete(destino)}
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