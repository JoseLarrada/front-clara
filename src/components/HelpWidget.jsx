import { MessageCircle } from 'lucide-react'

function HelpWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="https://wa.me/525512345678"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-full bg-[#0f2942] hover:bg-[#0f2942]/90 px-4 py-3 shadow-lg shadow-[#0f2942]/20 hover:shadow-xl hover:scale-105 transition duration-200 cursor-pointer text-white text-xs font-bold uppercase tracking-wider"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22ccf2] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1ba0f2]"></span>
        </span>
        <span className="hidden md:inline">¿Necesitas ayuda? Chatea con Clara</span>
        <span className="md:hidden">Ayuda</span>
        <MessageCircle className="h-4.5 w-4.5 text-[#22ccf2] fill-[#22ccf2]/20" />
      </a>
    </div>
  )
}

export default HelpWidget
