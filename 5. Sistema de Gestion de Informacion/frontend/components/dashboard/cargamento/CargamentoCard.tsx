'use client';
import React from 'react';
import { Cargamento, RolUsuario, TipoVehiculo } from '@/lib/types';
import { 
  BuildingStorefrontIcon, TruckIcon, TagIcon, GlobeAltIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { CargamentoButtons } from './CargamentoButtons';
import { useAuth } from '@/hooks/useAuth';
import { downloadCargamentoPdf } from '@/lib/api';

interface CargamentoCardProps {
  cargamento: Cargamento;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode;}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center text-sm text-gray-600">
    <Icon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
    <span className="font-semibold text-gray-800 mr-1">{label}:</span>
    <span className="truncate">{value || 'N/A'}</span>
  </div>
);

export const CargamentoCard: React.FC<CargamentoCardProps> = ({ cargamento, onEdit, onDelete, onViewDetails }) => {
  const { user: currentUser, token } = useAuth(); 
  const canManage = currentUser?.role === RolUsuario.ADMIN || currentUser?.role === RolUsuario.INSPECTOR;
  const canDelete = currentUser?.role === RolUsuario.ADMIN;
  const canDownloadPdf = canManage || currentUser?.role === RolUsuario.VISUALIZADOR; 

  const primerDetalle = cargamento.detalles?.[0];
  const nombreMarcaVariante = primerDetalle
    ? `${primerDetalle.variante_marca_rel?.marca.nombre} ${primerDetalle.variante_marca_rel?.nombre}`
    : 'No asignada';

  const esContenedor = cargamento.tipo_vehiculo === TipoVehiculo.CONTENEDOR;
  const dispositivo = esContenedor ? cargamento.rastreo_satelital_contenedor : cargamento.rastreo_satelital;
  const identificadorVehiculo = esContenedor ? cargamento.codigo_contenedor : cargamento.chofer_rel?.placa_cabezal;
  const labelIdentificador = esContenedor ? 'CONT' : cargamento.tipo_vehiculo;
  
  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadCargamentoPdf(cargamento.cargamento_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cargamento.agricola_rel.finca}_CAND${cargamento.rastreo_satelital || cargamento.rastreo_satelital_contenedor}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error al descargar el PDF:", error);
      alert(`No se pudo descargar el PDF: ${error.message}`);
    }
  };

   return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full transition-shadow hover:shadow-md">
      <div className="flex items-center p-3 border-b bg-gray-50/70">
        <BuildingStorefrontIcon className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
        <h3 className="text-base font-bold text-gray-800 flex-grow truncate" title={cargamento.agricola_rel?.finca}>
          {cargamento.agricola_rel?.finca || 'Finca no disponible'}
        </h3>
      </div>
      
      <div className="p-4 flex-grow space-y-3">
        <InfoRow icon={ShieldCheckIcon} label="Dispositivo" value={dispositivo} />
        <InfoRow icon={TruckIcon} label={labelIdentificador} value={identificadorVehiculo} />
        <InfoRow icon={TagIcon} label="Marca" value={nombreMarcaVariante} />
        <InfoRow icon={GlobeAltIcon} label="Puerto" value={cargamento.puerto_rel?.nombre_puerto} />
      </div>

      <div className="p-2 border-t bg-gray-50/70 flex justify-between items-center">
        <button
          onClick={onViewDetails}
          className="px-3 py-1.5 bg-[#144836] text-white rounded-md text-xs font-semibold hover:bg-green-800 transition-colors"
        >
          Detalles
        </button>
        <CargamentoButtons
          onEdit={onEdit}
          onDelete={onDelete}
          onDownloadPdf={handleDownloadPdf}
          canEdit={canManage}
          canDelete={canDelete}
          canDownloadPdf={canDownloadPdf}
        />
      </div>
    </div>
  );
};