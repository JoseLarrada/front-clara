import { Link } from 'react-router-dom'
import { Calendar, Mail, Phone, Heart } from 'lucide-react'

function Footer() {
  return (
    <footer id="soporte" className="bg-slate-50 border-t border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-4 text-left">
          
          {/* Logo & Slogan */}
          <div className="md:col-span-2 flex flex-col items-start">
            <Link to="/" className="relative z-10 flex items-center gap-2.5 text-xl font-bold cursor-pointer">
              <img 
                src="/logo_clara.png" 
                alt="Clara Logo" 
                className="h-16 md:h-20 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm text-slate-650 max-w-sm leading-relaxed font-semibold">
              Maneja la asistencia de tu equipo, áreas de geocerca y cálculos de pre-nómina, todo directo en el cel o la web.
            </p>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider">Enlaces</h5>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="#caracteristicas" className="text-sm font-semibold text-slate-600 hover:text-[#1ba0f2] transition duration-150 cursor-pointer">
                  Características
                </a>
              </li>
              <li>
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-[#1ba0f2] transition duration-150 cursor-pointer">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Info */}
          <div>
            <h5 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider">Ayuda y Contacto</h5>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Mail className="h-4.5 w-4.5 text-[#1ba0f2] flex-shrink-0" />
                <a href="mailto:soporte@clara.com" className="hover:text-[#1ba0f2] transition duration-150 cursor-pointer">
                  soporte@clara.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Phone className="h-4.5 w-4.5 text-[#1ba0f2] flex-shrink-0" />
                <span>+52 (55) 1234-5678</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400">
            &copy; {new Date().getFullYear()} CLARA. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <p className="flex items-center gap-1 text-xs font-bold text-slate-400">
            HECHO CON <Heart className="h-3.5 w-3.5 text-[#1ba0f2] fill-[#1ba0f2]" /> PARA TI.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
