'use client';
import { PiTruckTrailerDuotone, PiTruckDuotone, PiShippingContainerFill } from "react-icons/pi"; 
import React from 'react';
import { Cargamento, TipoVehiculo } from '@/lib/types';
import { TruckIcon, PlusIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface CargamentoHorizontalCardProps {
  cargamento: Cargamento;
  onAddInspeccion: (cargamentoId: number) => void;
  onViewAllInspecciones: (cargamentoId: number) => void;
  canAddInspeccion?: boolean; 
  canViewAllInspecciones?: boolean; 
}

export const CargamentoHorizontalCard: React.FC<CargamentoHorizontalCardProps> = ({
  cargamento,
  onAddInspeccion,
  onViewAllInspecciones,
  canAddInspeccion = false,
  canViewAllInspecciones = false,
}) => {
  const getCardDetails = () => {
    switch (cargamento.tipo_vehiculo) {
      case TipoVehiculo.CONTENEDOR:
        return { IconComponent: PiShippingContainerFill, mainLabel: 'CÓDIGO', mainValue: cargamento.codigo_contenedor || 'N/A' };
      case TipoVehiculo.CAMION:
        return { IconComponent: PiTruckDuotone, mainLabel: 'PLACA', mainValue: cargamento.chofer_rel?.placa_cabezal || 'N/A' };
      case TipoVehiculo.FURGON:
        return { IconComponent: PiTruckTrailerDuotone, mainLabel: 'PLACA', mainValue: cargamento.chofer_rel?.placa_cabezal || 'N/A' };
      default:
        return { IconComponent: TruckIcon, mainLabel: 'ID', mainValue: 'Desconocido' };
    }
  };

  const { IconComponent, mainLabel, mainValue } = getCardDetails();

 return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg h-full">
      
      {/* --- CONTENIDO RESPONSIVO MEJORADO --- */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start p-4 flex-grow">
        
        <div className="flex-shrink-0 w-24 h-24 lg:w-20 lg:h-20 flex items-center justify-center mb-3 lg:mb-0 lg:mr-4">
          <IconComponent className="w-12 h-12 lg:w-10 lg:h-10 text-green-700" />
        </div>

        {/* La alineación y tamaño del texto cambian en 'lg' */}
        <div className="flex-grow text-center lg:text-left">
          <h3 className="text-lg lg:text-xl font-bold text-black truncate mb-1">
            {cargamento.agricola_rel?.finca || 'Finca Desconocida'}
          </h3>
          <p className="text-gray-600 text-sm">
            <span className="font-semibold">{mainLabel}:</span> {mainValue}
          </p>
          <p className="text-gray-600 text-sm">
            <span className="font-semibold">MARCA: </span> 
            {cargamento.detalles && cargamento.detalles.length > 0 
              ? `${cargamento.detalles[0].variante_marca_rel?.marca?.nombre || ''} ${cargamento.detalles[0].variante_marca_rel?.nombre || ''}`
              : 'N/A'}
          </p>

          <div className="mt-2 flex items-center justify-center lg:justify-start gap-1.5 text-green-800">
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm font-bold">
              {cargamento.inspecciones_count} {cargamento.inspecciones_count === 1 ? 'Inspección' : 'Inspecciones'}
            </span>
          </div>
        </div>
      </div>

      {/* --- Sección de botones (sin cambios) --- */}
      <div className="border-t p-2 bg-gray-50 flex justify-stretch gap-2">
        {canViewAllInspecciones && (
          <button
            onClick={() => onViewAllInspecciones(cargamento.cargamento_id)}
            className="flex-1 flex items-center justify-center px-3 py-2 rounded-md bg-gray-200 text-gray-800 text-xs font-semibold hover:bg-gray-300 transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-1.5" />
            Visualizar
          </button>
        )}
        {canAddInspeccion && (
          <button
            onClick={() => onAddInspeccion(cargamento.cargamento_id)}
            className="flex-1 flex items-center justify-center px-3 py-2 rounded-md bg-[#144836] text-white text-xs font-semibold shadow-sm hover:bg-green-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Inspección
          </button>
        )}
      </div>
    </div>
  );
};