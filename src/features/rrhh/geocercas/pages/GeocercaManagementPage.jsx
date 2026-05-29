import RRHHLayout from '../../common/components/RRHHLayout';
import GeocercaList from '../components/GeocercaList';
import GeocercaModal from '../components/GeocercaModal';
import { useGeocercas } from '../hooks/useGeocercas';
import { MapPin, Users, HelpCircle, Laptop, Landmark, RefreshCw } from 'lucide-react';

function GeocercaManagementPage() {
  const {
    employees,
    selectedEmpleadoId,
    setSelectedEmpleadoId,
    geocercas,
    loadingEmployees,
    loadingGeocercas,
    actionLoading,
    apiError,
    isModalOpen,
    activeGeocerca,
    handleCreateOrUpdate,
    handleDeleteGeocerca,
    openCreateModal,
    openEditModal,
    closeModal,
    refetch
  } = useGeocercas();

  // Find currently selected employee object
  const currentEmployee = employees.find(e => e.id === selectedEmpleadoId);

  // Helper to render profile modality badge
  const renderModalityBadge = (modality) => {
    switch (modality) {
      case 'REMOTO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-4xs font-bold uppercase tracking-wider text-sky-650">
            <Laptop className="h-3 w-3" /> Remoto
          </span>
        );
      case 'HIBRIDO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-4xs font-bold uppercase tracking-wider text-purple-650">
            <Laptop className="h-3 w-3" /> Híbrido
          </span>
        );
      case 'PRESENCIAL':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-4xs font-bold uppercase tracking-wider text-amber-650">
            <Landmark className="h-3 w-3" /> Presencial
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <MapPin className="h-3 w-3" /> Perímetros de Marcación
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Geocercas de Colaboradores
          </h1>
          <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
            Gestione las ubicaciones autorizadas desde las cuales los empleados bajo modalidades virtuales pueden registrar su entrada y salida.
          </p>
        </div>

        {/* Selection bar */}
        <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-sm text-left font-semibold text-xs text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f2942]/5 text-[#0f2942] border border-[#0f2942]/10 flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <label className="block text-4xs font-bold text-slate-400 uppercase tracking-wider">Buscar Colaborador Activo</label>
              {loadingEmployees ? (
                <div className="h-9 w-48 bg-slate-100 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={selectedEmpleadoId}
                  onChange={(e) => setSelectedEmpleadoId(e.target.value)}
                  className="w-full sm:max-w-md rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
                >
                  {employees.length === 0 ? (
                    <option value="">No hay colaboradores activos registrados</option>
                  ) : (
                    employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombreCompleto} ({emp.email})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Selected Employee details */}
          {currentEmployee && (
            <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#1ba0f2]/10 flex items-center justify-center text-[#1ba0f2] font-black text-xs uppercase flex-shrink-0">
                {currentEmployee.nombreCompleto.substring(0, 2)}
              </div>
              <div className="space-y-1">
                <span className="block font-extrabold text-[#0f2942]">{currentEmployee.nombreCompleto}</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xs text-slate-400 font-mono">{currentEmployee.email}</span>
                  {renderModalityBadge(currentEmployee.modalidadPerfil)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Callout */}
        {currentEmployee && currentEmployee.modalidadPerfil === 'PRESENCIAL' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-left flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-2xs font-bold text-amber-850">
              <span>Nota de Modalidad: </span>
              <span className="font-semibold text-slate-600 block mt-1">
                El colaborador seleccionado tiene configurada una modalidad **Presencial**. Las geocercas solo restringen las marcaciones realizadas de forma remota/móvil. Asegúrese de que esto sea lo esperado.
              </span>
            </div>
          </div>
        )}

        {/* Geofences listing */}
        {selectedEmpleadoId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Geocercas Configuradas</h2>
                <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Límites activos para la cuenta seleccionada</p>
              </div>
              
              <button
                type="button"
                onClick={refetch}
                disabled={loadingGeocercas}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
                title="Actualizar listado"
              >
                <RefreshCw className={`h-4 w-4 ${loadingGeocercas ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <GeocercaList
              geocercas={geocercas}
              loading={loadingGeocercas}
              onEdit={openEditModal}
              onDelete={handleDeleteGeocerca}
              onAddClick={openCreateModal}
            />

            <GeocercaModal
              isOpen={isModalOpen}
              onClose={closeModal}
              onSubmit={handleCreateOrUpdate}
              activeGeocerca={activeGeocerca}
              apiError={apiError}
              actionLoading={actionLoading}
            />
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
            <MapPin className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="font-extrabold uppercase tracking-wider">Seleccione un Colaborador</p>
            <p className="text-3xs text-slate-450 mt-1 max-w-sm mx-auto">Elija un colaborador de la lista superior para poder administrar y visualizar sus perímetros autorizados.</p>
          </div>
        )}

      </div>
    </RRHHLayout>
  );
}

export default GeocercaManagementPage;
