import { Link } from 'react-router-dom'
import { Calendar, Phone, ArrowRight, Smartphone, MessageSquare } from 'lucide-react'

function Hero() {
  return (
    <div>
      {/* 1. MAIN HERO BANNER */}
      <section className="bg-slate-50 py-16 lg:py-24 text-left relative overflow-hidden">
        {/* Subtle color decorations */}
        <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-[#1ba0f2]/10 blur-3xl -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Left side: Copy & CTAs */}
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0f2942] sm:text-5xl lg:text-6xl leading-tight">
                Maneja tu personal <br />
                <span className="text-[#1ba0f2]">fácil y sin enredos</span>
              </h1>
              <p className="mt-6 text-base text-slate-700 leading-relaxed max-w-lg">
                Clara es la plataforma que a tus colaboradores les encanta usar para registrar su día a día. Controla asistencia híbrida y genera la pre-nómina automáticamente, todo desde el celular o la web.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-8 py-3.5 text-sm font-extrabold text-white shadow-md shadow-[#1ba0f2]/10 transition duration-150 cursor-pointer w-full sm:w-auto"
                >
                  Conoce más
                </Link>
                <a
                  href="#caracteristicas"
                  className="inline-flex items-center justify-center rounded-full border border-[#0f2942]/20 hover:bg-slate-100 bg-white px-8 py-3.5 text-sm font-extrabold text-[#0f2942] transition duration-150 cursor-pointer w-full sm:w-auto"
                >
                  Ver productos
                </a>
              </div>
            </div>

            {/* Right side: Striking B2C/B2B Mockup */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none flex justify-center">
              
              {/* Simulated Mobile Phone Card */}
              <div className="relative w-72 rounded-[40px] border-[10px] border-slate-900 bg-white shadow-2xl overflow-hidden aspect-[9/18]">
                
                {/* Speaker/Camera notch */}
                <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 flex items-center justify-center">
                  <div className="h-1.5 w-12 rounded-full bg-slate-800" />
                </div>

                {/* Inner Screen */}
                <div className="h-full pt-6 flex flex-col justify-between bg-slate-50">
                  {/* Phone Header */}
                  <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white">
                    <span className="text-3xs font-black text-[#0f2942]">CLARA APP</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>

                  {/* Phone Body */}
                  <div className="p-4 flex-grow flex flex-col justify-center gap-6">
                    
                    {/* Welcome card */}
                    <div className="rounded-2xl bg-white p-4 shadow-sm text-center border border-slate-100">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-[#1ba0f2]">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <h4 className="mt-3 text-2xs font-extrabold text-slate-850">¡Hola, Sophia!</h4>
                      <p className="text-4xs text-slate-400 mt-1 uppercase font-bold tracking-wider">REGISTRO DE HOY</p>
                      
                      {/* Checkin button */}
                      <button type="button" className="mt-4 w-full rounded-full bg-gradient-to-r from-[#0f2942] to-[#1ba0f2] text-white font-extrabold text-3xs py-2 shadow cursor-pointer">
                        Registrar Entrada
                      </button>
                    </div>

                    {/* Geofence status */}
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center flex items-center justify-center gap-1.5 text-4xs font-bold text-emerald-800 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Zona Autorizada (90m)
                    </div>
                  </div>

                  {/* Phone Footer Navigation */}
                  <div className="p-3 border-t border-slate-100 bg-white flex justify-around text-4xs font-black text-slate-400">
                    <span className="text-[#1ba0f2]">Inicio</span>
                    <span>Reportes</span>
                    <span>Mi Perfil</span>
                  </div>
                </div>

              </div>

              {/* Decorative side floating badge */}
              <div className="absolute top-[20%] -left-8 bg-white border border-slate-100 p-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-[160px]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1ba0f2] text-white">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-4xs font-bold text-slate-400">Pre-nómina</p>
                  <p className="text-3xs font-extrabold text-[#0f2942]">Generada al 100%</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. TRANSVERSAL CALL-OUT BAR (WhatsApp Helpline) */}
      <div className="w-full bg-[#0f2942] py-6 px-6 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#1ba0f2]/10 blur-2xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left text-white">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[#22ccf2]">
              <MessageSquare className="h-5.5 w-5.5 fill-[#22ccf2]/20" />
            </div>
            <div>
              <p className="text-sm font-extrabold md:text-base leading-tight">
                Ya puedes resolver tus dudas sobre el registro de asistencia por WhatsApp
              </p>
              <p className="text-3xs text-[#22ccf2] font-bold uppercase tracking-wider mt-0.5">
                Servicio disponible para administradores y colaboradores
              </p>
            </div>
          </div>
          
          <a
            href="https://wa.me/525512345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white font-extrabold text-xs px-6 py-2.5 transition duration-150 cursor-pointer text-center"
          >
            Hazlo aquí
          </a>
        </div>
      </div>
    </div>
  )
}

import { CheckCircle2 } from 'lucide-react'
export default Hero
