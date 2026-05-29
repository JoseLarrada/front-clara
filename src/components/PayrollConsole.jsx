import { useState } from 'react'
import { Search, Filter, Download, Database, Check } from 'lucide-react'

function PayrollConsole() {
  const employees = [
    { id: '1021', name: 'Carlos Mendoza', department: 'Tecnología', checkin: '09:02 AM', status: 'A tiempo', hours: 8.5 },
    { id: '1022', name: 'Lucia Flores', department: 'Finanzas', checkin: '09:15 AM', status: 'Retardo', hours: 7.75 },
    { id: '1023', name: 'Sophia Vance', department: 'Recursos Humanos', checkin: '08:55 AM', status: 'A tiempo', hours: 8.0 },
    { id: '1024', name: 'David Smith', department: 'Tecnología', checkin: '09:05 AM', status: 'A tiempo', hours: 8.2 },
    { id: '1025', name: 'Maria Perez', department: 'Operaciones', checkin: '10:02 AM', status: 'Retardo', hours: 6.5 },
    { id: '1026', name: 'Alfonso Ruiz', department: 'Finanzas', checkin: '08:48 AM', status: 'A tiempo', hours: 8.5 },
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('Todos')
  const [exported, setExported] = useState(false)

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = deptFilter === 'Todos' || emp.department === deptFilter
    return matchesSearch && matchesDept
  })

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = 'ID,Nombre,Departamento,Hora Registro,Estado,Horas Trabajadas\n'
    
    filteredEmployees.forEach((emp) => {
      csvContent += `"${emp.id}","${emp.name}","${emp.department}","${emp.checkin}","${emp.status}",${emp.hours}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'clara_pre_nomina.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-12 border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            Consola contable
          </span>
          <h3 className="mt-4 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Reporte de Pre-nómina
          </h3>
          <p className="mt-3 text-sm text-slate-700 font-semibold leading-relaxed max-w-2xl">
            Prueba a filtrar la tabla de asistencias por nombre o departamento y presiona el botón para descargar la pre-nómina real en formato CSV de forma instantánea.
          </p>
        </div>

        {/* Console Box */}
        <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition duration-150"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end font-semibold">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-750 focus:outline-none focus:ring-1 focus:ring-[#1ba0f2]"
                >
                  <option value="Todos">Todos los Deptos</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Operaciones">Operaciones</option>
                </select>
              </div>

              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition duration-150 cursor-pointer"
              >
                {exported ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {exported ? '¡CSV Descargado!' : 'Exportar CSV'}
              </button>
            </div>

          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-700 font-semibold">
              <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Colaborador</th>
                  <th className="px-6 py-3.5">Departamento</th>
                  <th className="px-6 py-3.5">Hora Entrada</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Horas Activas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#0f2942]/5 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-400">{emp.id}</td>
                      <td className="px-6 py-4 font-extrabold text-[#0f2942]">{emp.name}</td>
                      <td className="px-6 py-4">{emp.department}</td>
                      <td className="px-6 py-4 font-mono">{emp.checkin}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded px-2 py-0.5 text-4xs font-bold uppercase tracking-wider ${
                          emp.status === 'A tiempo'
                            ? 'bg-[#2abf5e]/10 text-[#2abf5e] border border-[#2abf5e]/20'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-[#0f2942]">{emp.hours} Hrs</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-450 font-bold uppercase tracking-wider">
                      Ningún colaborador coincide con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-150 bg-slate-50/30 flex items-center justify-between text-4xs font-bold text-slate-450 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Database className="h-3.5 w-3.5 text-[#1ba0f2]" /> Base de Datos Conectada</span>
            <span>Registros Totales: {filteredEmployees.length}</span>
          </div>

        </div>

      </div>
    </section>
  )
}

export default PayrollConsole
