import RRHHLayout from '../../common/components/RRHHLayout';
import CalendarGrid from '../components/CalendarGrid';
import CalendarBulkModal from '../components/CalendarBulkModal';
import { useCalendario } from '../hooks/useCalendario';
import { Calendar, Users, ChevronLeft, ChevronRight, ListPlus, CheckCircle, ShieldAlert } from 'lucide-react';

function CalendarioPage() {
  const {
    currentYear,
    currentMonth,
    employees,
    selectedEmpleadoId,
    setSelectedEmpleadoId,
    assignments,
    loadingEmployees,
    loadingAssignments,
    actionLoading,
    apiError,
    success,
    isBulkModalOpen,
    handlePrevMonth,
    handleNextMonth,
    handleToggleDay,
    handleBulkSubmit,
    openBulkModal,
    closeBulkModal
  } = useCalendario();

  const currentEmployee = employees.find(e => e.id === selectedEmpleadoId);

  // Helper for month names
  const getMonthName = (monthNum) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthNum - 1] || 'Mes';
  };

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <Calendar className="h-3 w-3" /> Calendario de Jornadas Híbridas
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Organización del Trabajo Híbrido
          </h1>
          <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
            Asigne qué días laboran los colaboradores de manera presencial en la oficina o remota desde sus hogares.
          </p>
        </div>

        {/* Alerts & Notifications */}
        {apiError && (
          <div className="rounded-xl bg-red-50 p-3.5 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2.5 text-left">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-3.5 text-2xs font-bold text-emerald-750 border border-emerald-200 flex items-start gap-2.5 text-left animate-in fade-in slide-in-from-top-1 duration-150">
            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Asignaciones masivas guardadas exitosamente en el calendario del colaborador.</span>
          </div>
        )}

        {/* Selector Bar */}
        <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-sm text-left font-semibold text-xs text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f2942]/5 text-[#0f2942] border border-[#0f2942]/10 flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <label className="block text-4xs font-bold text-slate-450 uppercase tracking-wider">Colaborador Híbrido / Activo</label>
              {loadingEmployees ? (
                <div className="h-9 w-48 bg-slate-100 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={selectedEmpleadoId}
                  onChange={(e) => setSelectedEmpleadoId(e.target.value)}
                  className="w-full sm:max-w-md rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
                >
                  {employees.length === 0 ? (
                    <option value="">No hay colaboradores activos...</option>
                  ) : (
                    employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombreCompleto} ({emp.modalidadPerfil})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>

          {currentEmployee && (
            <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#1ba0f2]/10 flex items-center justify-center text-[#1ba0f2] font-black text-xs uppercase flex-shrink-0">
                {currentEmployee.nombreCompleto.substring(0, 2)}
              </div>
              <div className="space-y-1">
                <span className="block font-extrabold text-[#0f2942]">{currentEmployee.nombreCompleto}</span>
                <span className="block text-4xs text-slate-450 font-mono leading-none truncate">{currentEmployee.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Grid & Controls */}
        {selectedEmpleadoId ? (
          <div className="space-y-4">
            
            {/* Nav controls */}
            <div className="flex items-center justify-between">
              
              {/* Month Navigation */}
              <div className="flex items-center gap-3 bg-white border border-slate-150 rounded-xl p-1.5 shadow-xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
                  title="Mes Anterior"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <span className="font-extrabold text-xs uppercase tracking-wider text-[#0f2942] min-w-[100px] text-center">
                  {getMonthName(currentMonth)} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
                  title="Mes Siguiente"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Bulk register trigger button */}
              <button
                type="button"
                onClick={openBulkModal}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition cursor-pointer"
              >
                <ListPlus className="h-4 w-4" />
                Asignación Masiva
              </button>

            </div>

            {/* Grid display */}
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              assignments={assignments}
              loading={loadingAssignments}
              onToggleDay={handleToggleDay}
            />

          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
            <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="font-extrabold uppercase tracking-wider">Seleccione un Colaborador</p>
            <p className="text-3xs text-slate-450 mt-1 max-w-sm mx-auto">Elija un colaborador de la lista superior para poder administrar y estructurar sus turnos híbridos.</p>
          </div>
        )}

        {/* Bulk modal */}
        <CalendarBulkModal
          isOpen={isBulkModalOpen}
          onClose={closeBulkModal}
          onSubmit={handleBulkSubmit}
          actionLoading={actionLoading}
          apiError={apiError}
        />

      </div>
    </RRHHLayout>
  );
}

export default CalendarioPage;
