import RRHHLayout from '../../common/components/RRHHLayout';
import EmployeeList from '../components/EmployeeList';
import EmployeeModal from '../components/EmployeeModal';
import { useEmployees } from '../hooks/useEmployees';
import { ShieldCheck } from 'lucide-react';

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

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
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

      </div>
    </RRHHLayout>
  );
}

export default EmployeeManagementPage;
