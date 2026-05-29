import RRHHLayout from '../../common/components/RRHHLayout';
import VacacionesList from '../components/VacacionesList';
import VacacionesModal from '../components/VacacionesModal';
import VacacionesSaldoCard from '../components/VacacionesSaldoCard';
import { useVacaciones } from '../hooks/useVacaciones';
import { Palmtree, ShieldCheck, CheckCircle } from 'lucide-react';

function VacacionesPage() {
  const {
    vacaciones,
    employees,
    pagination,
    loading,
    loadingEmployees,
    actionLoading,
    apiError,
    success,
    balanceCheckEmployeeId,
    setBalanceCheckEmployeeId,
    checkedBalance,
    loadingBalance,
    isFormModalOpen,
    handlePageChange,
    handleApproveVacacion,
    handleRejectVacacion,
    handleCreateVacacion,
    openFormModal,
    closeFormModal
  } = useVacaciones();

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <Palmtree className="h-3 w-3" /> Control de Vacaciones y Licencias
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Gestión de Descanso Anual
          </h1>
          <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
            Consulte los saldos de días remanentes de su personal y apruebe o rechace las solicitudes de vacaciones pendientes del mes.
          </p>
        </div>

        {/* Global notification for approvals success */}
        {success && (
          <div className="rounded-xl bg-emerald-50 p-3.5 text-2xs font-bold text-emerald-750 border border-emerald-200 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Solicitud procesada correctamente. Se ha actualizado el saldo en el perfil del empleado de forma inmediata.</span>
          </div>
        )}

        {/* Multi-column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Table of pending requests */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-left">
              <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Periodos Pendientes</h2>
              <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Bandeja de solicitudes por autorizar</p>
            </div>

            <VacacionesList
              vacaciones={vacaciones}
              pagination={pagination}
              loading={loading}
              onPageChange={handlePageChange}
              onAddClick={openFormModal}
              onApprove={handleApproveVacacion}
              onReject={handleRejectVacacion}
            />
          </div>

          {/* Right panel: Settle Balance checking card */}
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Saldos de Cuentas</h2>
              <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Consulta rápida e informes internos</p>
            </div>

            <VacacionesSaldoCard
              employees={employees}
              selectedId={balanceCheckEmployeeId}
              onSelectedIdChange={setBalanceCheckEmployeeId}
              checkedBalance={checkedBalance}
              loadingBalance={loadingBalance}
            />
          </div>

        </div>

        {/* Delegated creation modal */}
        <VacacionesModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleCreateVacacion}
          employees={employees}
          loadingEmployees={loadingEmployees}
          apiError={apiError}
          actionLoading={actionLoading}
        />

      </div>
    </RRHHLayout>
  );
}

export default VacacionesPage;
