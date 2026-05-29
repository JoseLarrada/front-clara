import { Building2, Users } from 'lucide-react';

function DashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-3xl border border-slate-150 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-200" />
              <div className="flex-grow space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-6 w-16 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Active Companies */}
      <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm flex items-center gap-4 transition hover:shadow-md">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0f2942] to-[#1ba0f2] text-white shadow-sm">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="text-left">
          <span className="block text-4xs font-bold text-slate-400 uppercase tracking-widest leading-none">Empresas Activas</span>
          <p className="mt-1.5 text-3xl font-black text-[#0f2942] tracking-tight leading-none">
            {stats?.totalEmpresasActivas ?? 0}
          </p>
        </div>
      </div>

      {/* Global Employees */}
      <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm flex items-center gap-4 transition hover:shadow-md">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1ba0f2] to-[#22ccf2] text-white shadow-sm">
          <Users className="h-6 w-6" />
        </div>
        <div className="text-left">
          <span className="block text-4xs font-bold text-slate-400 uppercase tracking-widest leading-none">Empleados en Plataforma</span>
          <p className="mt-1.5 text-3xl font-black text-[#0f2942] tracking-tight leading-none">
            {(stats?.totalEmpleadosGlobales ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
