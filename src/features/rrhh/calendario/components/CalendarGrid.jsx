import { Laptop, Landmark, HelpCircle, Loader2 } from 'lucide-react';

function CalendarGrid({
  year,
  month,
  assignments,
  loading,
  onToggleDay
}) {
  
  // Calculate first day of week (1 = Monday, ..., 7 = Sunday)
  let firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Ajustar Domingo a 7
  
  // Padding cells before day 1
  const paddingCellsCount = firstDayOfWeek - 1;
  
  // Total days in month
  const totalDays = new Date(year, month, 0).getDate();
  
  // Create calendar cells array
  const cells = [];
  
  // Add empty padding cells
  for (let i = 0; i < paddingCellsCount; i++) {
    cells.push({ isPadding: true, id: `pad-${i}` });
  }
  
  // Add actual days
  for (let day = 1; day <= totalDays; day++) {
    const dayStr = String(day).padStart(2, '0');
    const mStr = String(month).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dayStr}`;
    
    const assign = assignments.find(a => a.fecha === dateStr);
    
    cells.push({
      isPadding: false,
      day,
      dateStr,
      assign,
      id: `day-${day}`
    });
  }

  const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm p-6 text-left font-semibold text-xs text-slate-700 relative">
      
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-10 flex items-center justify-center rounded-3xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#1ba0f2]" />
            <span className="text-4xs font-bold uppercase tracking-widest text-slate-400">Guardando cambios...</span>
          </div>
        </div>
      )}

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-2.5 text-center font-bold text-slate-400 uppercase text-4xs tracking-widest mb-4">
        {weekdays.map(d => (
          <div key={d} className="py-2">
            {d.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 gap-2.5">
        {cells.map((cell) => {
          if (cell.isPadding) {
            return (
              <div 
                key={cell.id} 
                className="aspect-square bg-slate-50/20 rounded-2xl border border-slate-100/50" 
              />
            );
          }

          const { day, dateStr, assign } = cell;
          let cellStyle = "bg-slate-50/50 text-slate-650 border-slate-150 hover:bg-slate-100/70";
          let icon = <HelpCircle className="h-3.5 w-3.5 text-slate-350" />;
          let label = "Sin Asignar";

          if (assign?.caracterDia === 'REMOTO') {
            cellStyle = "bg-sky-50 text-sky-750 border-sky-200 hover:bg-sky-100/70";
            icon = <Laptop className="h-3.5 w-3.5 text-sky-500" />;
            label = "Remoto";
          } else if (assign?.caracterDia === 'PRESENCIAL') {
            cellStyle = "bg-amber-50 text-amber-750 border-amber-200 hover:bg-amber-100/70";
            icon = <Landmark className="h-3.5 w-3.5 text-amber-500" />;
            label = "Presencial";
          }

          return (
            <button
              key={cell.id}
              type="button"
              onClick={() => onToggleDay(dateStr)}
              className={`aspect-square flex flex-col justify-between p-2.5 rounded-2xl border transition cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[#1ba0f2] ${cellStyle}`}
            >
              {/* Day Number */}
              <span className="font-mono font-bold text-xs">{day}</span>
              
              {/* Modality Icon & Label */}
              <div className="flex flex-col gap-1 items-start">
                <div className="flex items-center gap-1">
                  {icon}
                  <span className="hidden sm:inline text-5xs font-black uppercase tracking-wider leading-none mt-0.5">
                    {label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend guide */}
      <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap gap-4 text-3xs font-extrabold uppercase tracking-wide text-slate-500 justify-center sm:justify-start">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-slate-50 border border-slate-150" /> Sin Asignar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-sky-50 border border-sky-200" /> Remoto (Celular / App)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-amber-50 border border-amber-200" /> Presencial (Oficina)
        </span>
        <span className="text-4xs text-slate-450 italic lowercase font-medium tracking-normal mt-0.5 ml-auto hidden md:inline">
          * Haga click sobre cualquier día para alternar cíclicamente la modalidad.
        </span>
      </div>

    </div>
  );
}

export default CalendarGrid;
