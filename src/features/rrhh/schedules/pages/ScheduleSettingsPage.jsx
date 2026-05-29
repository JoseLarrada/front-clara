import { useState } from 'react';
import RRHHLayout from '../../common/components/RRHHLayout';
import RuleList from '../components/RuleList';
import RuleModal from '../components/RuleModal';
import SurchargesForm from '../components/SurchargesForm';
import { useScheduleRules } from '../hooks/useScheduleRules';
import { useSurcharges } from '../hooks/useSurcharges';
import { Clock, Percent, ShieldCheck } from 'lucide-react';

function ScheduleSettingsPage() {
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' or 'surcharges'

  // Schedule Rules logic
  const {
    rules,
    pagination,
    loading: rulesLoading,
    actionLoading: rulesActionLoading,
    apiError: rulesApiError,
    isModalOpen,
    activeRule,
    handlePageChange,
    handleCreateOrUpdate,
    handleDeleteRule,
    openCreateModal,
    openEditModal,
    closeModal
  } = useScheduleRules();

  // Surcharges logic
  const {
    surcharges,
    loading: surchargesLoading,
    actionLoading: surchargesActionLoading,
    error: surchargesError,
    success: surchargesSuccess,
    handleSave: handleSaveSurcharges
  } = useSurcharges();

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <Clock className="h-3 w-3" /> Control de Tiempos y Normativa
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Jornadas y Políticas Financieras
          </h1>
          <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
            Defina los turnos de entrada y salida laboral oficiales y configure las tasas de recargos financieros por horas extras o penalizaciones por retardos.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('schedules')}
            className={`py-3 px-5 text-2xs font-extrabold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schedules'
                ? 'border-[#1ba0f2] text-[#1ba0f2] bg-[#1ba0f2]/5 rounded-t-xl'
                : 'border-transparent text-slate-450 hover:text-slate-650 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Jornadas Laborales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('surcharges')}
            className={`py-3 px-5 text-2xs font-extrabold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'surcharges'
                ? 'border-[#1ba0f2] text-[#1ba0f2] bg-[#1ba0f2]/5 rounded-t-xl'
                : 'border-transparent text-slate-450 hover:text-slate-650 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Percent className="h-3.5 w-3.5" />
            Recargos y Multas
          </button>
        </div>

        {/* Tab Views */}
        <div className="space-y-6">
          {activeTab === 'schedules' ? (
            <div className="space-y-4">
              <div className="text-left">
                <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Jornadas Registradas</h2>
                <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Horarios asignables para el control de asistencia diaria</p>
              </div>

              <RuleList
                rules={rules}
                pagination={pagination}
                loading={rulesLoading}
                onPageChange={handlePageChange}
                onEdit={openEditModal}
                onDelete={handleDeleteRule}
                onAddClick={openCreateModal}
              />

              <RuleModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleCreateOrUpdate}
                activeRule={activeRule}
                apiError={rulesApiError}
                actionLoading={rulesActionLoading}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-left">
                <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Tasas de Cálculo</h2>
                <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Políticas de recargos del mes y multas aplicadas en nómina</p>
              </div>

              <SurchargesForm
                surcharges={surcharges}
                loading={surchargesLoading}
                actionLoading={surchargesActionLoading}
                error={surchargesError}
                success={surchargesSuccess}
                onSave={handleSaveSurcharges}
              />
            </div>
          )}
        </div>

      </div>
    </RRHHLayout>
  );
}

export default ScheduleSettingsPage;
