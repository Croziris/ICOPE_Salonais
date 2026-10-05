import React from 'react';
import { Plus, AlertTriangle, BookOpen, ClipboardList, X, PanelLeftClose } from 'lucide-react';

export default function Sidebar({
  onNewCall, activeCallExists,
  isOpen, onClose,
  isCollapsed, onToggleCollapse
}) {
  return (
    <>
      {/* Backdrop mobile/tablette */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 z-40
          text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(135deg, #243884 0%, #4F7863 100%)'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">ICOPE Salonais</h1>
            <p className="text-blue-300 text-sm font-medium">Bassin Salonais</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
          <button onClick={onToggleCollapse} className="hidden lg:block p-1.5 hover:bg-white/10 rounded-lg cursor-pointer text-blue-300 hover:text-white">
            <PanelLeftClose size={20} />
          </button>
        </div>
        
        <div className="p-5 shrink-0">
          <button
            onClick={() => { onNewCall(); onClose(); }}
            disabled={activeCallExists}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all shadow-md ${
              activeCallExists
                ? 'bg-white/10 text-white/40 cursor-not-allowed shadow-none'
                : 'bg-white text-[#243884] hover:bg-gray-100 cursor-pointer active:scale-[0.98]'
            }`}
          >
            {activeCallExists ? 'Appel en cours...' : '+ Nouvel Appel'}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 pt-0 overflow-y-auto">
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 bg-blue-800 rounded-xl text-white font-medium shadow-inner">
            <AlertTriangle className="w-5 h-5 text-blue-300" />
            Gestion des alertes
          </a>
          <div className="flex items-center gap-3 px-4 py-3.5 opacity-50 cursor-not-allowed text-blue-200">
            <BookOpen className="w-5 h-5" />
            Annuaire
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 opacity-50 cursor-not-allowed text-blue-200">
            <ClipboardList className="w-5 h-5" />
            Step 2
          </div>
        </nav>

        <div className="mt-auto p-4 border-t border-white/10 shrink-0">
          <p className="text-blue-400/80 text-xs text-center font-semibold tracking-wide">v2.0 – Local-First</p>
        </div>
      </aside>
    </>
  );
}
