'use client';
import { Exportadora } from '@/lib/types';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { ParametrosButtons } from '../ParametrosButtons';

interface ExportadorasTableProps {
  exportadoras: Exportadora[];
  onEdit: (exportadora: Exportadora) => void;
  onDelete: (exportadora: Exportadora) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const MobileExportadoraCard = ({ exportadora, onEdit, onDelete, canEdit, canDelete }: { exportadora: Exportadora } & Omit<ExportadorasTableProps, 'exportadoras'>) => {
    return (
        <Paper sx={{ p: 2, mb: 1.5, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="500" noWrap>
                {exportadora.nombre}
            </Typography>
            <ParametrosButtons
                onEdit={() => onEdit(exportadora)}
                onDelete={() => onDelete(exportadora)}
                canEdit={canEdit}
                canDelete={canDelete}
            />
        </Paper>
    );
};


export const ExportadorasTable: React.FC<ExportadorasTableProps> = ({ exportadoras, onEdit, onDelete, canEdit, canDelete }) => {
  const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

    // --- 2. RENDERIZADO CONDICIONAL ---
    if (isMobile) {
        return (
            <Box sx={{ mt: 2 }}>
                {exportadoras.map((exportadora) => (
                    <MobileExportadoraCard
                        key={exportadora.exportadora_id}
                        exportadora={exportadora}
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
                            <TableCell sx={{ fontWeight: 600, pl: 3 }}>Nombre de Exportadora</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right', pr: 3 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {exportadoras.map((exportadora) => (
                            <TableRow hover key={exportadora.exportadora_id}>
                                <TableCell sx={{ pl: 3 }}>
                                    <Typography variant="body2" fontWeight="500">{exportadora.nombre}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 3 }}>
                                    <ParametrosButtons
                                        onEdit={() => onEdit(exportadora)}
                                        onDelete={() => onDelete(exportadora)}
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