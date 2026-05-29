import { Edit3, Trash2, MapPin, Plus, ExternalLink } from 'lucide-react';

function GeocercaList({
  geocercas,
  loading,
  onEdit,
  onDelete,
  onAddClick
}) {
  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="h-4.5 w-4.5 text-[#1ba0f2]" /> Perímetros Autorizados (Geocercas)
          </h3>
          <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Límites espaciales para el registro de jornada remota</p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Añadir Perímetro
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto relative min-h-[150px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5">Descripción de Ubicación</th>
              <th className="px-6 py-3.5 text-center">Latitud</th>
              <th className="px-6 py-3.5 text-center">Longitud</th>
              <th className="px-6 py-3.5 text-center">Radio Tolerancia</th>
              <th className="px-6 py-3.5 text-center">Mapa</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 bg-white">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando geocercas...</span>
                  </div>
                </td>
              </tr>
            ) : geocercas.length > 0 ? (
              geocercas.map((geo) => (
                <tr key={geo.id} className="hover:bg-[#0f2942]/5 transition">
                  
                  {/* Descripcion */}
                  <td className="px-6 py-4 font-extrabold text-[#0f2942]">
                    {geo.descripcion}
                  </td>
                  
                  {/* Latitud */}
                  <td className="px-6 py-4 text-center font-mono text-slate-650">
                    {Number(geo.latitud).toFixed(6)}
                  </td>
                  
                  {/* Longitud */}
                  <td className="px-6 py-4 text-center font-mono text-slate-650">
                    {Number(geo.longitud).toFixed(6)}
                  </td>

                  {/* Radio */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-[#1ba0f2]">
                    {geo.radioToleranciaMetros} metros
                  </td>

                  {/* Mapa */}
                  <td className="px-6 py-4 text-center">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${geo.latitud}&mlon=${geo.longitud}#map=17/${geo.latitud}/${geo.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-450 hover:text-[#1ba0f2] hover:underline font-bold text-3xs uppercase transition"
                    >
                      Ver mapa <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(geo)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-[#1ba0f2] hover:border-[#1ba0f2]/50 hover:bg-[#1ba0f2]/5 transition cursor-pointer"
                        title="Editar Perímetro"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(geo.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-red-650 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar Perímetro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <span className="font-extrabold uppercase tracking-wider">Sin perímetros registrados</span>
                    <span className="text-3xs text-slate-450">Este colaborador no cuenta con límites de geocercas configurados.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default GeocercaList;
