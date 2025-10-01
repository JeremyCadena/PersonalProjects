'use client';

import React from 'react';
import { Inspeccion } from '@/lib/types';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Grid, Chip, IconButton, Tooltip, Link, Divider, useMediaQuery, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaBoxOpen, FaFileArchive, FaFilePdf  } from 'react-icons/fa';
import { GiSittingDog } from "react-icons/gi";
import { PiShippingContainerFill } from "react-icons/pi";
import { SiOpencontainersinitiative } from "react-icons/si";
import { VscShield } from "react-icons/vsc";
import dayjs from 'dayjs';

interface InspeccionAccordionProps {
  inspeccion: Inspeccion;
  onEdit: (inspeccion: Inspeccion) => void;
  onDelete: (inspeccion: Inspeccion) => void;
}

const getInspeccionIcon = (tipo: string) => {
  switch (tipo) {
    case 'CANINA': return <GiSittingDog size={30}/>;
    case 'INTERNA': return <SiOpencontainersinitiative size={30}/>;
    case 'EXTERNA': return <PiShippingContainerFill size={30} />;
    case 'DE CARGA': return <FaBoxOpen size={30} />;
    case 'NOVEDAD': return <FaFileArchive size={30} />;
    default: return <VscShield size={20} />;
  }
};

const getRiesgoChipColor = (riesgo: string): "success" | "warning" | "error" => {
    switch (riesgo) {
      case 'BAJO': return 'success';
      case 'MEDIO': return 'warning';
      case 'ALTO': return 'error';
      default: return 'success';
    }
};
export const InspeccionAccordion: React.FC<InspeccionAccordionProps> = ({ inspeccion, onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

   return (
    <Accordion 
      sx={{ 
        borderRadius: '12px !important',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
        '&:before': { display: 'none' } 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ flexGrow: 1 }} 
        >
          {/* --- CABECERA ADAPTABLE --- */}
          {/* En móvil se apila (flex-col), en escritorio se alinea (sm:flex-row) */}
          <div className="flex flex-col sm:flex-row sm:items-center w-full gap-x-4">
            
            {/* Información Principal (siempre visible a la izquierda) */}
            <div className="flex items-center gap-2">
              {getInspeccionIcon(inspeccion.tipo_inspeccion)}
              <Typography fontWeight="bold">{inspeccion.tipo_inspeccion}</Typography>
              <Chip label={inspeccion.nivel_riesgo} color={getRiesgoChipColor(inspeccion.nivel_riesgo)} size="small" />
            </div>

            {/* Información Secundaria (se alinea a la derecha en escritorio) */}
            <div className="mt-1 sm:mt-0 sm:ml-auto">
              <Typography variant="body2" color="text.secondary">
                {dayjs(inspeccion.fecha).format('DD/MM/YYYY')}
              </Typography>
            </div>

          </div>
        </AccordionSummary>

        {/* Botones de acción (no necesitan cambio, ya son compactos) */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar Inspección">
            <IconButton size="medium" onClick={() => onEdit(inspeccion)}>
              <EditIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar Inspección">
            <IconButton size="medium" onClick={() => onDelete(inspeccion)}>
              <DeleteIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <AccordionDetails sx={{ bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
          OBSERVACIÓN: {inspeccion.observacion || "SIN NOVEDAD"}
        </Typography>
        <Box>
            {/* GALERÍA DE IMÁGENES */}
            {inspeccion.imagenes && inspeccion.imagenes.length > 0 && (
                <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Evidencia Fotográfica:</Typography>
                    <Grid container spacing={2}>
                        {inspeccion.imagenes.map(img => (
                            <Grid key={img.imagen_id}>
                                <a href={`${process.env.NEXT_PUBLIC_API_URL}/${img.url}`} target="_blank" rel="noopener noreferrer">
                                    <img 
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${img.url}`}
                                        alt={`Evidencia ${img.imagen_id}`}
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                </a>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* --- 3. SECCIÓN PARA MOSTRAR DOCUMENTOS PDF --- */}
            {inspeccion.documentos && inspeccion.documentos.length > 0 && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Documentos Adjuntos:</Typography>
                    {inspeccion.documentos.map(doc => (
                        <Link
                            key={doc.documento_id}
                            href={`${process.env.NEXT_PUBLIC_API_URL}/${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}
                        >
                            <FaFilePdf size={24} className="text-red-600" />
                            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                                VER REPORTE DE TRAZABILIDAD
                            </Typography>
                        </Link>
                    ))}
                </>
            )}

            {/* Mensaje si no hay ninguna evidencia */}
            {(!inspeccion.imagenes || inspeccion.imagenes.length === 0) && (!inspeccion.documentos || inspeccion.documentos.length === 0) && (
                 <Typography variant="caption" color="text.secondary">
                    No hay evidencias adjuntas para esta inspección.
                 </Typography>
            )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};