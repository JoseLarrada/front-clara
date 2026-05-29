import { MapPin, RefreshCw, Smartphone, ShieldCheck, FileSpreadsheet, Users } from 'lucide-react'

function Features() {
  const items = [
    {
      title: 'Control de Asistencia Híbrida',
      description: 'Permite a tus colaboradores registrar su entrada y salida ya sea en la oficina, desde casa o en campo de forma flexible.',
      details: [
        'Registro digital rápido e intuitivo.',
        'Soporte multi-dispositivo (Móvil, Web, Tablet).',
        'Validación de asistencia en tiempo real.',
      ],
      icon: Users,
      color: 'sky',
    },
    {
      title: 'Geocercas GPS Inteligentes',
      description: 'Define perímetros virtuales en el mapa para garantizar que las asistencias en campo sean en el lugar correcto.',
      details: [
        'Configuración visual de áreas ilimitadas.',
        'Notificaciones de entrada y salida de zona.',
        'Reporte de ubicación al registrar asistencia.',
      ],
      icon: MapPin,
      color: 'emerald',
    },
    {
      title: 'Pre-Nómina Automatizada',
      description: 'Olvídate de las hojas de cálculo. Calcula horas ordinarias, extras y retardos de forma automática al cierre del ciclo.',
      details: [
        'Exportación instantánea a Excel/PDF.',
        'Reglas de tolerancia y turnos personalizables.',
        'Cálculo exacto de incidencias y ausencias.',
      ],
      icon: FileSpreadsheet,
      color: 'emerald-sky',
    },
  ]

  return (
    <section id="caracteristicas" className="py-24 bg-white relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Todo lo necesario para gestionar tu equipo en un solo lugar
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Clara integra las herramientas clave de recursos humanos en una plataforma robusta y fácil de usar para cualquier empresa.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-slate-50/30 p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-100 group"
              >
                <div>
                  {/* Icon Wrapper */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 ${
                      item.color === 'sky'
                        ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-100'
                        : item.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                        : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3.5 text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Bullet Details */}
                  <ul className="mt-6 space-y-2.5">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 text-2xs font-medium text-slate-500">
                        <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                          item.color === 'sky' ? 'bg-sky-400' : 'bg-emerald-400'
                        }`} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow indicator */}
                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-end text-3xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-800 transition duration-300">
                  <span className="mr-1 group-hover:mr-2 transition-all duration-300">Saber más</span>
                  &rarr;
                </div>
              </div>
            )
          })}
        </div>

        {/* Highlight Banner */}
        <div className="mt-16 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left max-w-2xl">
            <h4 className="text-lg font-bold text-slate-900">
              ¿Listo para dar el siguiente paso?
            </h4>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              Únete a las empresas que ya están ahorrando horas de trabajo administrativo y reduciendo errores en la nómina gracias a Clara.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-emerald-600 hidden sm:block" />
            <span className="text-xs font-semibold text-slate-600">
              Implementación en menos de 24 horas.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
