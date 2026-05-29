import { useState } from 'react'
import { Building2, Mail, Lock, Eye, EyeOff, Shield, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

function LoginForm() {
  const [formData, setFormData] = useState({
    empresaId: '',
    email: '',
    password: '',
    rol: 'colaborador',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.empresaId.trim()) {
      setError('Por favor, ingresa el ID de tu empresa.')
      return
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido.')
      return
    }
    if (!formData.password.trim()) {
      setError('La contraseña es requerida.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      console.log('Login exitoso con datos:', formData)
    }, 1500)
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-150 bg-white p-8 shadow-xl shadow-slate-100">
      
      {/* Return Home Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1ba0f2] transition duration-150 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio
      </Link>

      <div className="text-left">
        <h2 className="text-2xl font-extrabold text-[#0f2942] tracking-tight">
          Ingresar a Clara
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-semibold">
          Inicia sesión para gestionar tu asistencia y pre-nómina.
        </p>
      </div>

      {success ? (
        <div className="mt-8 text-center py-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1ba0f2]/10 text-[#1ba0f2] border border-[#1ba0f2]/20">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#0f2942]">Acceso Autorizado</h3>
          <p className="mt-2 text-sm text-slate-500 font-semibold">Redireccionando al panel principal...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left font-semibold">
          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 border border-red-200">
              {error}
            </div>
          )}

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200">
            {['colaborador', 'administrador'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rol: role }))}
                className={`rounded-lg py-2 text-xs font-bold capitalize transition cursor-pointer ${
                  formData.rol === role
                    ? 'bg-[#0f2942] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Company ID (Multi-tenant) */}
          <div>
            <label htmlFor="empresaId" className="block text-4xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ID de Empresa
            </label>
            <div className="relative rounded-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                name="empresaId"
                id="empresaId"
                value={formData.empresaId}
                onChange={handleChange}
                disabled={loading}
                placeholder="ej. mi-empresa-123"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition duration-150"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-4xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative rounded-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="tu@correo.com"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition duration-150"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                Contraseña
              </label>
              <a href="#" className="text-4xs font-bold text-[#1ba0f2] hover:text-[#1ba0f2]/80 transition">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative rounded-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 py-3 text-sm font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      )}

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-4xs font-bold text-slate-400 uppercase tracking-widest">
        <Shield className="h-3.5 w-3.5 text-[#1ba0f2]" />
        <span>Conexión cifrada SSL</span>
      </div>
    </div>
  )
}

export default LoginForm
