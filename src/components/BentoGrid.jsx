import { useState } from 'react'
import { MapPin, Camera, DollarSign, Calendar, Clock, Check, X, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

function BentoGrid() {
  // Vacation simulator states
  const [vacationDays, setVacationDays] = useState(15)
  const [vacationStatus, setVacationStatus] = useState('pendiente') // 'pendiente', 'aprobando', 'aprobado', 'rechazado'
  const [requestText, setRequestText] = useState('Solicitud: 3 días de descanso')

  // Geofence simulator state
  const [geofenceRadius, setGeofenceRadius] = useState(100)

  const handleApproveVacation = () => {
    setVacationStatus('aprobando')
    setTimeout(() => {
      setVacationDays(12)
      setVacationStatus('aprobado')
      setRequestText('Aprobado por Recursos Humanos')
    }, 1200)
  }

  const handleRejectVacation = () => {
    setVacationStatus('rechazado')
    setRequestText('Solicitud Rechazada')
  }

  const handleResetVacation = () => {
    setVacationDays(15)
    setVacationStatus('pendiente')
    setRequestText('Solicitud: 3 días de descanso')
  }

  const products = [
    {
      title: 'Registro de Asistencia',
      desc: 'Registra tus horas de oficina, home office o campo en segundos. Todo directo en la app de tu cel o la web.',
      tag: 'Para personas',
      color: 'bg-[#2abf5e]/10 text-[#2abf5e] border-[#2abf5e]/20',
      icon: Clock,
    },
    {
      title: 'Geocercas GPS',
      desc: 'Configura radios permitidos de asistencia en mapa. Asegura que los colaboradores chequen en la zona autorizada.',
      tag: 'Para Negocios',
      color: 'bg-[#22ccf2]/10 text-[#1ba0f2] border-[#22ccf2]/20',
      icon: MapPin,
    },
    {
      title: 'Pre-Nómina Completa',
      desc: 'Recopila incidencias, horas ordinarias y extras sin usar Excel. Concilia y exporta el archivo contable listo.',
      tag: 'Administración',
      color: 'bg-[#1ba0f2]/10 text-[#1ba0f2] border-[#1ba0f2]/20',
      icon: DollarSign,
    },
  ]

  return (
    <section id="caracteristicas" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Title Section (Nequi Style) */}
        <div className="text-left mb-16 border-l-4 border-[#1ba0f2] pl-4">
          <h2 className="text-3xl font-extrabold text-[#0f2942] sm:text-4xl">
            Productos y servicios
          </h2>
          <p className="mt-3 text-base text-slate-700 leading-relaxed max-w-xl font-semibold">
            Descubre las soluciones de Clara para automatizar el control horario de tu empresa y el procesamiento administrativo.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          
          {products.map((prod, idx) => {
            const Icon = prod.icon
            return (
              <div key={idx} className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 min-h-[340px]">
                
                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-3xs font-extrabold uppercase tracking-wide border ${prod.color}`}>
                      {prod.tag}
                    </span>
                    <Icon className="h-5 w-5 text-slate-400" />
                  </div>
                  
                  <h3 className="mt-6 text-xl font-bold text-[#0f2942]">
                    {prod.title}
                  </h3>
                  <p className="mt-3.5 text-sm text-slate-600 leading-relaxed font-semibold">
                    {prod.desc}
                  </p>

                  {idx === 1 && (
                    <div className="mt-4 p-3 bg-[#22ccf2]/5 rounded-2xl border border-[#22ccf2]/20 text-left">
                      <div className="flex justify-between items-center text-4xs font-black text-slate-500 uppercase tracking-wider">
                        <span>Radio de Geocerca</span>
                        <span className="text-[#0f2942] font-extrabold">{geofenceRadius}m</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={geofenceRadius}
                        onChange={(e) => setGeofenceRadius(parseInt(e.target.value))}
                        className="w-full accent-[#1ba0f2] cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-1.5"
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-4xs text-slate-500 font-bold uppercase tracking-wider">Carlos (a 120m)</span>
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-4xs font-extrabold uppercase tracking-wider ${
                          geofenceRadius >= 120
                            ? 'bg-[#2abf5e]/10 text-[#2abf5e] border border-[#2abf5e]/20'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {geofenceRadius >= 120 ? 'En Rango' : 'Bloqueado'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Magenta button */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link to="/login" className="inline-flex w-full items-center justify-center rounded-lg bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 py-2.5 text-xs font-bold text-white shadow-sm transition duration-150 cursor-pointer">
                    Descubre cómo hacerlo
                  </Link>
                </div>

              </div>
            )
          })}

          {/* Card 4: Vacaciones con Demo Didáctica (Span 2 or Centered) */}
          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm md:col-span-3 flex flex-col lg:flex-row items-center justify-between gap-8 mt-4">
            
            {/* Left side copy */}
            <div className="text-left max-w-lg">
              <span className="rounded-full px-3 py-1 text-3xs font-extrabold uppercase tracking-wide border bg-[#1ba0f2]/10 text-[#1ba0f2] border-[#1ba0f2]/20">
                Simulador interactivo
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0f2942]">
                Gestión de Vacaciones
              </h3>
              <p className="mt-3 text-sm text-slate-700 font-semibold leading-relaxed">
                Visualiza y procesa las solicitudes de días de descanso de tu personal de forma transparente. Prueba a aprobar la solicitud a la derecha para observar el decremento dinámico.
              </p>
            </div>

            {/* Right side interactive demo box (Mobile phone / app check block) */}
            <div className="w-full max-w-sm rounded-2xl border border-[#22ccf2]/20 bg-[#f2f2f2] p-5 shadow-inner">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1ba0f2]/10 pb-3">
                <span className="text-4xs font-black text-[#0f2942]">BARRAS DE SALDOS</span>
                <span className="h-2 w-2 rounded-full bg-[#1ba0f2]" />
              </div>

              {/* Employee card */}
              <div className="mt-4 bg-white rounded-xl border border-slate-100 p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#0f2942] text-white font-extrabold text-xs">
                    SV
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sophia Vance</h4>
                    <p className="text-4xs text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">{requestText}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-4xs font-bold text-slate-450 uppercase tracking-widest leading-none">Días de Vacaciones</span>
                    <p className="text-lg font-black text-[#0f2942] tracking-tight">{vacationDays} días</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {vacationStatus === 'pendiente' && (
                      <>
                        <button
                          type="button"
                          onClick={handleRejectVacation}
                          className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                          title="Rechazar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleApproveVacation}
                          className="flex h-7.5 items-center justify-center rounded-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white px-4 text-3xs font-extrabold shadow-sm transition cursor-pointer uppercase tracking-wider"
                        >
                          Aprobar
                        </button>
                      </>
                    )}

                    {vacationStatus === 'aprobando' && (
                      <span className="flex h-7.5 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-450 text-3xs font-bold animate-pulse px-3">
                        <RefreshCw className="h-3 animate-spin mr-1 text-[#1ba0f2]" /> Cargando
                      </span>
                    )}

                    {vacationStatus === 'aprobado' && (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-7.5 items-center gap-1 rounded-full bg-emerald-50 border border-emerald-250 px-3 text-3xs font-bold text-emerald-700">
                          <Check className="h-3 w-3" /> Aprobada
                        </span>
                        <button
                          type="button"
                          onClick={handleResetVacation}
                          className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition cursor-pointer"
                          title="Reiniciar Demo"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {vacationStatus === 'rechazado' && (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-7.5 items-center gap-1 rounded-full bg-red-50 border border-red-250 px-3 text-3xs font-bold text-red-700">
                          <X className="h-3 w-3" /> Rechazada
                        </span>
                        <button
                          type="button"
                          onClick={handleResetVacation}
                          className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="Reiniciar Demo"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default BentoGrid
