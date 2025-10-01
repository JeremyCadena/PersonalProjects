import React from 'react';
import { Cargamento, TipoVehiculo } from '@/lib/types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/ui/fonts';

interface CargamentoDetailModalProps {
  cargamento: Cargamento;
  onClose: () => void;
}

export const CargamentoDetailModal: React.FC<CargamentoDetailModalProps> = ({ cargamento, onClose }) => {
  const getHeaderTitle = () => {
    if (cargamento.tipo_vehiculo === TipoVehiculo.CONTENEDOR && cargamento.codigo_contenedor) {
      return `CONTENEDOR - ${cargamento.codigo_contenedor}`;
    } else if (cargamento.tipo_vehiculo === TipoVehiculo.CAMION && cargamento.rastreo_satelital) {
      return `${cargamento.tipo_vehiculo}: ${cargamento.chofer_rel.placa_cabezal}`;
    } else if (cargamento.tipo_vehiculo === TipoVehiculo.FURGON && cargamento.rastreo_satelital) {
      return `${cargamento.tipo_vehiculo}: ${cargamento.chofer_rel.placa_cabezal}`;
    }
    return `Detalles del Cargamento`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full my-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center text-black`}>
          {getHeaderTitle()}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          {/* Información General del Cargamento */}
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-black">Información General</h3>
            <p><span className="font-medium text-black">Marca: </span> 
                {cargamento.detalles && cargamento.detalles.length > 0 
                  ? `${cargamento.detalles[0].variante_marca_rel?.marca?.nombre || ''} ${cargamento.detalles[0].variante_marca_rel?.nombre || ''}`: 'N/A'}</p>
            <p><span className="font-medium text-black">Vapor: </span> 
                {cargamento.detalles && cargamento.detalles.length > 0 
                  ? `${cargamento.detalles[0].vapor || 'S/N'}`: 'N/A'}</p>
            <p><span className="font-medium text-black">Puerto:</span> {cargamento.puerto_rel.nombre_puerto}</p>
            <p><span className="font-medium text-black">Fecha de Emisión:</span> {cargamento.fecha}</p>
          </div>

          {/* Información del Chofer */}
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-black">Datos del Chofer</h3>
            {cargamento.chofer_rel ? (
              <>
                <p><span className="font-medium text-black">Cédula:</span> {cargamento.chofer_rel.cedula}</p>
                <p><span className="font-medium text-black">Nombres:</span> {cargamento.chofer_rel.nombres} {cargamento.chofer_rel.apellidos}</p>
                <p><span className="font-medium text-black">Placa Asociada:</span> {cargamento.chofer_rel.placa_cabezal}</p>
                <p><span className="font-medium text-black">Teléfono:</span> {cargamento.chofer_rel.telefono}</p>
              </>
            ) : (
              <p>Información del chofer no disponible.</p>
            )}
          </div>

          {/* Información del Registro Agrícola */}
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-black">Datos de Agrícola</h3>
            {cargamento.agricola_rel ? (
              <>
                <p><span className="font-medium text-black">Finca:</span> {cargamento.agricola_rel.finca}</p>
                <p><span className="font-medium text-black">Productor:</span> {cargamento.agricola_rel.productor_rel.nombre_productor}</p>
                <p><span className="font-medium text-black">Exportadora:</span> {cargamento.exportadora_rel.nombre}</p>
              </>
            ) : (
              <p>Información agrícola no disponible.</p>
            )}
          </div>

          {/* Detalles Específicos del Cargamento */}
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-900">Detalles Específicos</h3>
            {cargamento.tipo_vehiculo == TipoVehiculo.CAMION || cargamento.tipo_vehiculo == TipoVehiculo.FURGON ? (
              <>
                <p><span className="font-medium text-black">Rastreo Asociado:</span> {cargamento.rastreo_satelital || 'N/A'}</p>
              </>
            ) : (
              <>
                <p><span className="font-medium text-black">Código Contenedor:</span> {cargamento.codigo_contenedor || 'N/A'}</p>
                <p><span className="font-medium text-black">Rastreo de Barra:</span> {cargamento.rastreo_satelital_contenedor || 'N/A'}</p>
                <p><span className="font-medium text-black">Sello de Botella:</span> {cargamento.sello_contenedor || 'N/A'}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};