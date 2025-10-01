'use client';
import { Puerto } from '@/lib/types';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PuertosButtons } from './PuertoButtons';

interface PuertosTableProps {
  puertos: Puerto[];
  onEdit: (puerto: Puerto) => void;
  onDelete: (puerto: Puerto) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const MobilePuertoCard = ({ puerto, onEdit, onDelete, canEdit, canDelete }: { puerto: Puerto } & Omit<PuertosTableProps, 'puertos'>) => {
    return (
        <Paper sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
            {/* Cabecera: Nombre del Puerto y Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {puerto.nombre_puerto}
                </Typography>
                <PuertosButtons
                    onEdit={() => onEdit(puerto)}
                    onDelete={() => onDelete(puerto)}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </Box>
            {/* Cuerpo: Ciudad de Origen */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {puerto.ciudad_origen}
            </Typography>
        </Paper>
    );
};

export const PuertosTable: React.FC<PuertosTableProps> = ({ puertos, onEdit, onDelete, canEdit, canDelete }) => {
   const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

    // --- 2. RENDERIZADO CONDICIONAL ---
    if (isMobile) {
        return (
            <Box sx={{ mt: 2 }}>
                {puertos.map((puerto) => (
                    <MobilePuertoCard
                        key={puerto.puerto_id}
                        puerto={puerto}
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
                            <TableCell sx={{ fontWeight: 600, pl: 3 }}>Nombre de Puerto</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Ciudad de Origen</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right', pr: 3 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {puertos.map((puerto) => (
                            <TableRow hover key={puerto.puerto_id}>
                                <TableCell sx={{ pl: 3 }}>
                                    <Typography variant="body2" fontWeight="500">{puerto.nombre_puerto}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">{puerto.ciudad_origen}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 3 }}>
                                    <PuertosButtons
                                        onEdit={() => onEdit(puerto)}
                                        onDelete={() => onDelete(puerto)}
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