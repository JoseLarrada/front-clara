import LoginForm from '../components/LoginForm'
import { Calendar, ShieldCheck, Sparkles, Database, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const { handleLogin, loading, error } = useAuth();

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row bg-[#f2f2f2] overflow-hidden">
      
      {/* LEFT PANEL: Branding & Didactic Concept (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#0f2942] flex-col justify-between p-16 overflow-hidden">
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#1ba0f2]/10 blur-3xl pointer-events-none" />
 
        {/* Top Header Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 text-xl font-bold cursor-pointer">
          <img 
            src="/logo_clara.png" 
            alt="Clara Logo" 
            className="h-16 md:h-20 w-auto object-contain bg-white/10 rounded-xl p-1.5"
          />
        </Link>

        {/* Central Didactic Concept Diagram */}
        <div className="relative z-10 my-auto text-left max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-2xs font-extrabold uppercase tracking-wide text-[#22ccf2] mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Arquitectura Multi-Tenant
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl leading-tight">
            Tus datos de personal{' '}
            <span className="text-[#22ccf2] font-extrabold">
              100% aislados
            </span>
          </h2>
          <p className="mt-4 text-sm text-white/80 leading-relaxed font-semibold">
            Clara utiliza un sistema de bases de datos compartimentado. Al ingresar tu **ID de Empresa**, nuestro backend conecta tu sesión con un Tenant seguro y exclusivo.
          </p>

          {/* Didactic Diagram Block */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h4 className="text-2xs font-bold text-[#22ccf2] uppercase tracking-widest flex items-center gap-1.5">
              <Database className="h-4 w-4 text-[#22ccf2]" /> Esquema de Conexión
            </h4>
            
            {/* Diagram Flow */}
            <div className="flex items-center justify-between gap-3 text-3xs font-extrabold text-white uppercase tracking-wider">
              {/* Box 1 */}
              <div className="rounded-lg border border-slate-700 bg-slate-900/30 px-2.5 py-1.5 shadow-2xs">
                ID Empresa
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-[#22ccf2]" />
              {/* Box 2 */}
              <div className="rounded-lg border border-[#1ba0f2]/30 bg-[#1ba0f2]/20 px-2.5 py-1.5 text-[#22ccf2] shadow-2xs">
                Filtro Seguro
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-[#22ccf2]" />
              {/* Box 3 */}
              <div className="rounded-lg border border-[#2abf5e]/30 bg-[#2abf5e]/10 px-2.5 py-1.5 text-[#2abf5e] shadow-2xs">
                Base Aislada
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-4xs font-bold text-white/50 uppercase tracking-wider">
          <span>Clara Platform</span>
          <span>Versión Corporativa</span>
        </div>

      </div>

      {/* RIGHT PANEL: Form Container */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 relative z-10">
        
        {/* Mobile-only logo display */}
        <div className="md:hidden mb-8 flex flex-col items-center">
          <img 
            src="/logo_clara.png" 
            alt="Clara Logo" 
            className="h-24 w-auto object-contain"
          />
        </div>

        <LoginForm onSubmit={handleLogin} loading={loading} apiError={error} />
      </div>

    </div>
  )
}

export default LoginPage
