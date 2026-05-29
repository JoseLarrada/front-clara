import { 
  Users, CheckCircle2, XCircle, Smartphone, 
  Building, Clock, AlertTriangle, Coffee 
} from 'lucide-react';

function RealTimeStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse rounded-3xl border border-slate-150 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-200" />
              <div className="flex-grow space-y-1.5">
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="h-5 w-8 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      name: 'Total Colaboradores',
      value: stats.totalActivos,
      icon: Users,
      colorClass: 'from-[#0f2942] to-[#1ba0f2]',
      bgIcon: 'bg-[#0f2942]/10 text-[#0f2942]'
    },
    {
      name: 'Presentes hoy',
      value: stats.totalPresentes,
      icon: CheckCircle2,
      colorClass: 'from-[#2abf5e] to-emerald-400',
      bgIcon: 'bg-[#2abf5e]/10 text-[#2abf5e]'
    },
    {
      name: 'Ausentes hoy',
      value: stats.totalAusentes,
      icon: XCircle,
      colorClass: 'from-rose-500 to-red-400',
      bgIcon: 'bg-rose-50 text-rose-600'
    },
    {
      name: 'En Almuerzo',
      value: stats.totalEnAlmuerzo,
      icon: Coffee,
      colorClass: 'from-amber-500 to-amber-400',
      bgIcon: 'bg-amber-50 text-amber-600'
    },
    {
      name: 'Modalidad Remota',
      value: stats.totalTeletrabajo,
      icon: Smartphone,
      colorClass: 'from-sky-500 to-sky-400',
      bgIcon: 'bg-sky-50 text-sky-600'
    },
    {
      name: 'Modalidad Presencial',
      value: stats.totalPresencial,
      icon: Building,
      colorClass: 'from-indigo-500 to-indigo-400',
      bgIcon: 'bg-indigo-50 text-indigo-600'
    },
    {
      name: 'Retardos del día',
      value: stats.totalRetardos,
      icon: Clock,
      colorClass: 'from-amber-600 to-yellow-500',
      bgIcon: 'bg-yellow-50 text-amber-700'
    },
    {
      name: 'Faltas injustificadas',
      value: stats.totalFaltas,
      icon: AlertTriangle,
      colorClass: 'from-red-600 to-rose-600',
      bgIcon: 'bg-red-50 text-red-650'
    }
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 font-semibold text-xs text-slate-700 text-left">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.name} 
            className="rounded-3xl border border-slate-150 bg-white p-5 shadow-sm flex items-center gap-4 transition duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${card.bgIcon}`}>
              <Icon className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="block text-4xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                {card.name}
              </span>
              <p className="mt-1.5 text-2xl font-black text-[#0f2942] tracking-tight leading-none">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RealTimeStats;
