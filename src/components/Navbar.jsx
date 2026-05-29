import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Menu, X, ArrowUpRight } from 'lucide-react'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
      
      {/* 1. TOP BAR (Nequi Style) */}
      <div className="w-full bg-[#0f2942] py-2 px-6 flex items-center justify-between text-3xs font-semibold text-white/90">
        <div className="flex items-center gap-4">
          <span className="hover:text-white cursor-pointer border-r border-white/20 pr-4">Para personas</span>
          <span className="hover:text-white cursor-pointer border-r border-white/20 pr-4 font-bold text-[#22ccf2]">Para Negocios</span>
          <span className="hover:text-white cursor-pointer">Soporte Corporativo</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[#22ccf2] hover:text-[#22ccf2]/80 cursor-pointer">
          <span>Abrir Cuenta Clara</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>

      {/* 2. MAIN NAV BAR */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
          <img 
            src="/logo_clara.png" 
            alt="Clara Logo" 
            className="h-16 md:h-20 w-auto object-contain"
          />
        </Link>

        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#caracteristicas"
            className="text-sm font-semibold text-slate-700 hover:text-[#1ba0f2] transition duration-150 cursor-pointer"
          >
            Características
          </a>
          <a
            href="#soporte"
            className="text-sm font-semibold text-slate-700 hover:text-[#1ba0f2] transition duration-150 cursor-pointer"
          >
            Soporte
          </a>
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-6 py-2 text-sm font-bold text-white shadow-sm transition duration-150 cursor-pointer"
          >
            Entrar
          </Link>
        </div>

        {/* Menu Button (Mobile) */}
        <button
          type="button"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-50 transition cursor-pointer text-slate-650"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-6 flex flex-col gap-4 shadow-lg">
          <a
            href="#caracteristicas"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-700 hover:text-[#1ba0f2] transition cursor-pointer"
          >
            Características
          </a>
          <a
            href="#soporte"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-700 hover:text-[#1ba0f2] transition cursor-pointer"
          >
            Soporte
          </a>
          <div className="flex flex-col gap-2 mt-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center rounded-lg bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 py-2.5 text-sm font-bold text-white shadow-sm transition cursor-pointer text-center"
            >
              Entrar
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
