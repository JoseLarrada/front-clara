import { useState } from 'react'
import { ShieldCheck, Database, Key, Check } from 'lucide-react'

function EnterpriseCalculator() {
  const [employees, setEmployees] = useState(80)
  const [adminHours, setAdminHours] = useState(12)

  // Calculations
  const hourlyRate = 250 // $250 MXN per hour of admin work
  const rawAdminCost = adminHours * 4.33 * hourlyRate
  
  // Clara subscription fee ($45 MXN per employee)
  const claraSubscriptionFee = employees * 45
  
  // Estimated error reductions & time saved
  const timeSavedValue = rawAdminCost * 0.85 // 85% time saved
  const errorSavings = employees * 22 // Average of $22 MXN saved in payroll errors per employee
  
  // Net Monthly Savings
  const netSavings = Math.round(timeSavedValue + errorSavings - claraSubscriptionFee)

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        
        <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch">
          
          {/* LEFT SIDE: ROI Calculator */}
          <div className="rounded-3xl border border-slate-150 bg-slate-50/50 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
                Simulador de ahorro
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0f2942] tracking-tight">Calculadora de Eficiencia</h3>
              <p className="mt-2 text-sm text-slate-700 font-semibold leading-relaxed">
                Mide el impacto de Clara en tu presupuesto administrativo. Ajusta los controles para estimar tu ahorro mensual al automatizar incidencias y pre-nóminas.
              </p>

              {/* Slider 1: Employees */}
              <div className="mt-6 space-y-2 text-left">
                <div className="flex justify-between items-center text-4xs font-black text-slate-500 uppercase tracking-wider">
                  <span>Colaboradores Activos</span>
                  <span className="text-[#0f2942] text-xs font-extrabold">{employees} empleados</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full accent-[#1ba0f2] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 2: Hours */}
              <div className="mt-6 space-y-2 text-left">
                <div className="flex justify-between items-center text-4xs font-black text-slate-500 uppercase tracking-wider">
                  <span>Horas Semanales en Nómina</span>
                  <span className="text-[#0f2942] text-xs font-extrabold">{adminHours} horas</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={adminHours}
                  onChange={(e) => setAdminHours(parseInt(e.target.value))}
                  className="w-full accent-[#1ba0f2] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Financial Results Display */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <span className="block text-4xs font-bold text-slate-400 uppercase tracking-widest leading-none">Costo Clara (Mensual)</span>
                  <p className="mt-1.5 text-lg font-black text-[#0f2942] tracking-tight">
                    ${claraSubscriptionFee.toLocaleString('es-MX')} <span className="text-[10px] text-slate-400 font-bold">MXN</span>
                  </p>
                </div>
                <div className="text-left border-l border-slate-150 pl-4">
                  <span className="block text-4xs font-bold text-[#1ba0f2] uppercase tracking-widest leading-none">Ahorro Neto Estimado</span>
                  <p className="mt-1.5 text-2xl font-black text-[#1ba0f2] tracking-tight leading-none">
                    +${netSavings.toLocaleString('es-MX')} <span className="text-[10px] text-[#1ba0f2] font-bold">MXN</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-[#2abf5e]/10 border border-[#2abf5e]/20 p-2.5 text-center text-3xs font-extrabold text-[#2abf5e] uppercase tracking-wider">
                Recuperación de inversión en el primer periodo de nómina.
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SSO & Corporate Compliance */}
          <div className="rounded-3xl border border-slate-150 bg-white p-6 flex flex-col justify-between shadow-sm">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
                Seguridad y respaldo
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0f2942] tracking-tight">Tranquilidad para tu empresa</h3>
              <p className="mt-2 text-sm text-slate-700 font-semibold leading-relaxed">
                Clara está estructurada bajo estándares internacionales y la legislación laboral mexicana para proteger tu información.
              </p>

              {/* Compliance list */}
              <div className="mt-6 space-y-4 text-left font-semibold">
                
                {/* LFT */}
                <div className="flex gap-3 items-start">
                  <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-xl bg-[#0f2942]/5 text-[#0f2942] border border-[#0f2942]/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">L.F.T. México Compliant</h4>
                    <p className="text-3xs text-slate-500 leading-relaxed mt-0.5">
                      Registros de asistencia válidos ante inspecciones del trabajo, estructurados con firmas y marcas de tiempo seguras.
                    </p>
                  </div>
                </div>

                {/* SSO */}
                <div className="flex gap-3 items-start border-t border-slate-100 pt-4">
                  <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-xl bg-[#0f2942]/5 text-[#0f2942] border border-[#0f2942]/10">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Single Sign-On (SSO)</h4>
                    <p className="text-3xs text-slate-500 leading-relaxed mt-0.5">
                      Integración nativa con SAML 2.0 y Active Directory para controlar accesos y bajas del personal.
                    </p>
                  </div>
                </div>

                {/* Tenant DB */}
                <div className="flex gap-3 items-start border-t border-slate-100 pt-4">
                  <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-xl bg-[#0f2942]/5 text-[#0f2942] border border-[#0f2942]/10">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Aislamiento por ID de Empresa</h4>
                    <p className="text-3xs text-slate-500 leading-relaxed mt-0.5">
                      Bases de datos aisladas lógicamente para cada empresa, previniendo cruces de datos y garantizando total privacidad.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Checklist footer */}
            <div className="mt-8 pt-4 border-t border-slate-150 flex items-center justify-between text-5xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[#2abf5e]" /> ISO 27051 Ready</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[#2abf5e]" /> LFT ART. 110 Compliant</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

export default EnterpriseCalculator
