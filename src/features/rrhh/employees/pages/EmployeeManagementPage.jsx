import { useState } from 'react';
import RRHHLayout from '../../common/components/RRHHLayout';
import EmployeeList from '../components/EmployeeList';
import EmployeeModal from '../components/EmployeeModal';
import EmployeeContractsModal from '../components/EmployeeContractsModal';
import MyContractModal from '../components/MyContractModal';
import MyPrenominaModal from '../components/MyPrenominaModal';
import { useEmployees } from '../hooks/useEmployees';
import { ShieldCheck, Briefcase, Receipt } from 'lucide-react';

function EmployeeManagementPage() {
  const {
    employees,
    searchTerm,
    setSearchTerm,
    pagination,
    loading,
    actionLoading,
    apiError,
    isModalOpen,
    activeEmployee,
    handlePageChange,
    handleSortChange,
    handleCreateOrUpdate,
    handleToggleActive,
    handleModalidadChange,
    handleDeleteEmployee,
    openCreateModal,
    openEditModal,
    closeModal
  } = useEmployees();

  const [isContractsModalOpen, setIsContractsModalOpen] = useState(false);
  const [contractsTargetEmployee, setContractsTargetEmployee] = useState(null);
  const [isMyContractOpen, setIsMyContractOpen] = useState(false);
  const [isMyPrenominaOpen, setIsMyPrenominaOpen] = useState(false);

  const handleManageContracts = (emp) => {
    setContractsTargetEmployee(emp);
    setIsContractsModalOpen(true);
  };

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-l-4 border-[#1ba0f2] pl-4 gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
              <ShieldCheck className="h-3 w-3" /> Administración de Personal
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
              Directorio de Colaboradores
            </h1>
            <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
              Consulte y actualice los perfiles laborales, estados de cuenta, modalidades de trabajo y saldos de vacaciones de sus empleados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 font-bold uppercase tracking-wider text-5xs shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsMyContractOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-purple-250 bg-purple-50 text-purple-700 hover:bg-purple-100/50 hover:border-purple-300 transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-500/5 w-full sm:w-auto justify-center"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Mi Contrato</span>
            </button>
            <button
              onClick={() => setIsMyPrenominaOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-sky-250 bg-sky-50 text-[#1ba0f2] hover:bg-sky-100/50 hover:border-sky-350 transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#1ba0f2]/5 w-full sm:w-auto justify-center"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Mis Pre-Nóminas</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="space-y-4">
          <div className="text-left">
            <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Plantilla Laboral</h2>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Gestión de inquilinos de personal activo</p>
          </div>

          <EmployeeList
            employees={employees}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            pagination={pagination}
            sort="creadoEn,desc"
            loading={loading}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onEdit={openEditModal}
            onToggleActive={handleToggleActive}
            onModalidadChange={handleModalidadChange}
            onDelete={handleDeleteEmployee}
            onAddClick={openCreateModal}
            onManageContracts={handleManageContracts}
          />
        </div>

        {/* Create / Edit Modal Form */}
        <EmployeeModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleCreateOrUpdate}
          activeEmployee={activeEmployee}
          apiError={apiError}
          actionLoading={actionLoading}
        />

        {/* Manage Contracts Modal Form */}
        <EmployeeContractsModal
          isOpen={isContractsModalOpen}
          onClose={() => { setIsContractsModalOpen(false); setContractsTargetEmployee(null); }}
          employee={contractsTargetEmployee}
        />

        {/* Portal Employee Modals */}
        <MyContractModal
          isOpen={isMyContractOpen}
          onClose={() => setIsMyContractOpen(false)}
        />

        <MyPrenominaModal
          isOpen={isMyPrenominaOpen}
          onClose={() => setIsMyPrenominaOpen(false)}
        />

      </div>
    </RRHHLayout>
  );
}

export default EmployeeManagementPage;
