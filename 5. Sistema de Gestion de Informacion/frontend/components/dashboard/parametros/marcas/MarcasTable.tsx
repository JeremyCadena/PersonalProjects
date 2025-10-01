'use client';

import React, { useEffect, useState } from 'react';
import { Marca, VarianteMarca } from '@/lib/types';
import { getVariantesByMarcaId } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, Collapse, IconButton, Button, CircularProgress,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ParametrosButtons } from '../ParametrosButtons';
import { VariantesTable } from '../variantes_marca/VarianteTable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// --- Interface para las props de la Fila (MarcaRow) ---
interface MarcaRowProps {
  marca: Marca;
  isExpanded: boolean;
  onRowClick: (marca: Marca) => void;
  onEdit: (marca: Marca) => void;
  onDelete: (marca: Marca) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  // --- Props para las acciones de variantes (se deben pasar desde la página) ---
  onEditVariante: (variante: VarianteMarca) => void;
  onDeleteVariante: (variante: VarianteMarca) => void;
  onCreateVariante: () => void;
}

// --- Interface para las props de la Tabla Principal (MarcasTable) ---
interface MarcasTableProps extends Omit<MarcaRowProps, 'marca' | 'isExpanded'> {
  marcas: Marca[];
  expandedMarcaId: number | null | undefined; 
}

const MarcaRow: React.FC<MarcaRowProps> = ({ 
    marca, isExpanded, onRowClick, onEdit, onDelete,
    canEdit, canDelete, onEditVariante, onDeleteVariante, onCreateVariante
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [variantes, setVariantes] = useState<VarianteMarca[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isExpanded) {
            setLoading(true);
            getVariantesByMarcaId(marca.marca_id)
                .then(data => setVariantes(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isExpanded, marca.marca_id]);

    const collapsedContent = (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', mb: 2, gap: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" align="center">
                    Variantes de la Marca: {marca.nombre}
                </Typography>
                {canEdit && (
                    <Button 
                        size="small" 
                        variant="contained" 
                        startIcon={<PlusIcon className="h-5 w-5"/>} 
                        onClick={onCreateVariante}
                        fullWidth 
                        sx={{color: '#ffffff', borderColor: '#144836', backgroundColor: '#144836',
                        '&:hover': {
                            backgroundColor: '#04932B', 
                            borderColor: '#ffffff',
                            color: '#ffffff'
                        },}}>
                        NUEVA VARIANTE
                    </Button>
                )}
            </Box>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
            ) : (
                <VariantesTable
                    variantes={variantes}
                    onEdit={onEditVariante}
                    onDelete={onDeleteVariante}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            )}
        </Box>
    );

    if (isMobile) {
        return (
            <Accordion expanded={isExpanded} sx={{ boxShadow: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    // Hacemos que el clic en toda la cabecera expanda/colapse
                    onClick={() => onRowClick(marca)}
                    sx={{
                        // Importante para que el contenido interno se organice bien
                        '& .MuiAccordionSummary-content': { 
                            display: 'block', 
                            width: '100%',
                            margin: 0
                        }
                    }}
                >
                    {/* --- 1. CABECERA DE DOS FILAS EN MÓVIL --- */}
                    <Box sx={{ width: '100%' }}>
                        {/* Fila 1: Nombre de la Marca */}
                        <Typography fontWeight="500">{marca.nombre}</Typography>
                        
                        <Divider sx={{ my: 1.5 }} />

                        {/* Fila 2: Botones de Acción */}
                        <Box 
                            sx={{ display: 'flex', justifyContent: 'flex-start' }}
                            // Detiene la propagación para que los botones no expandan/colapsen
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ParametrosButtons 
                                onEdit={() => onEdit(marca)} 
                                onDelete={() => onDelete(marca)} 
                                canEdit={canEdit} 
                                canDelete={canDelete} 
                            />
                        </Box>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, bgcolor: 'grey.50' }}>
                    {collapsedContent}
                </AccordionDetails>
            </Accordion>
        );
    }
    
    return (
        <React.Fragment>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell width="50px">
                    <IconButton size="small" onClick={() => onRowClick(marca)}>
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ cursor: 'pointer' }} onClick={() => onRowClick(marca)}>
                    <Typography variant="body2" fontWeight="500">{marca.nombre}</Typography>
                </TableCell>
                <TableCell align="right">
                    <ParametrosButtons onEdit={() => onEdit(marca)} onDelete={() => onDelete(marca)} canEdit={canEdit} canDelete={canDelete} />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        {collapsedContent}
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

export const MarcasTable: React.FC<MarcasTableProps> = ({ marcas, expandedMarcaId, ...props }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (isMobile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {marcas.map((marca) => (
                    <MarcaRow 
                        key={marca.marca_id} 
                        marca={marca} 
                        isExpanded={marca.marca_id === expandedMarcaId}
                        {...props}
                    />
                ))}
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table aria-label="collapsible table">
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                    <TableRow>
                        <TableCell />
                        <TableCell sx={{ fontWeight: 600 }}>Nombre de Marca</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, paddingRight: '24px' }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {marcas.map((marca) => (
                        <MarcaRow 
                            key={marca.marca_id} 
                            marca={marca} 
                            isExpanded={marca.marca_id === expandedMarcaId}
                            {...props}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};