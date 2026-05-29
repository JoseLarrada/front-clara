import RRHHLayout from '../../common/components/RRHHLayout';
import JustificacionList from '../components/JustificacionList';
import JustificacionActionModal from '../components/JustificacionActionModal';
import JustificacionFormModal from '../components/JustificacionFormModal';
import { useJustificaciones } from '../hooks/useJustificaciones';
import { FileText, ShieldCheck } from 'lucide-react';

function JustificacionPage() {
  const {
    justificaciones,
    employees,
    pagination,
    loading,
    loadingEmployees,
    actionLoading,
    apiError,
    isActionModalOpen,
    selectedJustificacion,
    actionType,
    isFormModalOpen,
    handlePageChange,
    handleActionSubmit,
    handleCreateJustificacion,
    openActionModal,
    closeActionModal,
    openFormModal,
    closeFormModal
  } = useJustificaciones();

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <FileText className="h-3 w-3" /> Control de Asistencia e Incidencias
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Justificaciones de Personal
          </h1>
          <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
            Revise los soportes médicos y técnicos cargados por sus empleados para exonerar retardos o ausencias del día laboral.
          </p>
        </div>

        {/* Justifications Table List */}
        <div className="space-y-4">
          <div className="text-left">
            <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Solicitudes de Justificación</h2>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Bandeja de decisiones para RRHH</p>
          </div>

          <JustificacionList
            justificaciones={justificaciones}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onAddClick={openFormModal}
            onActionClick={openActionModal}
          />
        </div>

        {/* Action Modal (Approve / Reject comments) */}
        <JustificacionActionModal
          isOpen={isActionModalOpen}
          onClose={closeActionModal}
          onSubmit={handleActionSubmit}
          justificacion={selectedJustificacion}
          actionType={actionType}
          apiError={apiError}
          actionLoading={actionLoading}
        />

        {/* Manual Justification Registration Modal */}
        <JustificacionFormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleCreateJustificacion}
          employees={employees}
          loadingEmployees={loadingEmployees}
          apiError={apiError}
          actionLoading={actionLoading}
        />

      </div>
    </RRHHLayout>
  );
}

export default JustificacionPage;
