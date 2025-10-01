'use client';
import { Productor } from '@/lib/types';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ParametrosButtons } from '../ParametrosButtons';

interface ProductorsTableProps {
  productors: Productor[];
  onEdit: (productor: Productor) => void;
  onDelete: (productor: Productor) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const MobileProductorCard = ({ productor, onEdit, onDelete, canEdit, canDelete }: { productor: Productor } & Omit<ProductorsTableProps, 'productors'>) => {
    return (
        <Paper sx={{ p: 2, mb: 1.5, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="500" noWrap>
                {productor.nombre_productor}
            </Typography>
            <ParametrosButtons
                onEdit={() => onEdit(productor)}
                onDelete={() => onDelete(productor)}
                canEdit={canEdit}
                canDelete={canDelete}
            />
        </Paper>
    );
};

export const ProductorsTable: React.FC<ProductorsTableProps> = ({ productors, onEdit, onDelete, canEdit, canDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  if (isMobile) {
        return (
            <Box sx={{ mt: 2 }}>
                {productors.map((productor) => (
                    <MobileProductorCard
                        key={productor.productor_id}
                        productor={productor}
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
                            <TableCell sx={{ fontWeight: 600, pl: 3 }}>Nombre de Productor</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right', pr: 3 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productors.map((productor) => (
                            <TableRow hover key={productor.productor_id}>
                                <TableCell sx={{ pl: 3 }}>
                                    <Typography variant="body2" fontWeight="500">{productor.nombre_productor}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 3 }}>
                                    <ParametrosButtons
                                        onEdit={() => onEdit(productor)}
                                        onDelete={() => onDelete(productor)}
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