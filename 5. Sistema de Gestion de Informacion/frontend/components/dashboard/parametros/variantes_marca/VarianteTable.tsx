'use client';
import { VarianteMarca } from '@/lib/types';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Box, Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { ParametrosButtons } from '../ParametrosButtons';

interface VariantesTableProps {
    variantes: VarianteMarca[];
    onEdit: (variante: VarianteMarca) => void;
    onDelete: (variante: VarianteMarca) => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

const MobileVarianteCard = ({ variante, onEdit, onDelete, canEdit, canDelete }: { variante: VarianteMarca } & Omit<VariantesTableProps, 'variantes'>) => {
    return (
        <Box sx={{ p: 2, mb: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider' }}>
            {/* Fila superior con nombre de variante y acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>{variante.nombre}</Typography>
                <ParametrosButtons
                    onEdit={() => onEdit(variante)}
                    onDelete={() => onDelete(variante)}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </Box>
            {/* Destino */}
            <Typography variant="body2" color="text.secondary">
                {variante.destino.nombre}
            </Typography>
        </Box>
    );
};

export const VariantesTable: React.FC<VariantesTableProps> = ({ variantes, onEdit, onDelete, canEdit, canDelete }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Usamos 'sm' como breakpoint

    // --- 2. RENDERIZADO CONDICIONAL ---
    if (isMobile) {
        return (
            <Box>
                {variantes.length > 0 ? (
                    variantes.map((variante) => (
                        <MobileVarianteCard 
                            key={variante.variacion_id}
                            variante={variante}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))
                ) : (
                    <Typography color="text.secondary" textAlign="center" sx={{ p: 4 }}>
                        No se encontraron variantes para esta marca.
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        // Usamos Paper solo como contenedor, sin estilos extra para no interferir
        <Paper variant="outlined" sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <TableContainer>
                <Table size="small"> {/* Tabla más compacta */}
                    <TableHead sx={{ backgroundColor: 'grey.100' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, pl: 2 }}>Nombre de Variante</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Destino</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right', pr: 2 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {variantes.length > 0 ? (
                            variantes.map((variante) => (
                                <TableRow hover key={variante.variacion_id}>
                                    <TableCell sx={{ pl: 2 }}>
                                        <Typography variant="body2" fontWeight="500">{variante.nombre}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{variante.destino.nombre}</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 2 }}>
                                        <ParametrosButtons
                                            onEdit={() => onEdit(variante)}
                                            onDelete={() => onDelete(variante)}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No se encontraron variantes para esta marca.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};