import React from 'react';
import { Phone, Menu, User, Calendar, MapPin } from 'lucide-react';

export default function Topbar({ patient, setPatient, communes = [] as any[], onToggleSidebar, showHamburger }: any) {
  const handleChange = (field, value) => {
    setPatient((prev) => ({ ...prev, [field]: value }));
  };

  const communeName = communes.find(c => c.id === patient?.commune)?.nom || '---';

  return (
    <header className="sticky top-0 bg-white shadow-sm z-10 p-3 lg:p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center flex-wrap gap-4">
        {showHamburger && (
          <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer mr-1">
            <Menu size={24} className="text-[#243884]" />
          </button>
        )}
        
        {/* Read-only patient badges */}
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
           <div className="flex items-center gap-1.5" title="Initiales">
             <User size={16} className="text-[#243884]"/> 
             <span>{patient?.initiales || '---'}</span>
           </div>
           <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
           <div className="flex items-center gap-1.5" title="Date de naissance">
             <Calendar size={16} className="text-[#243884]"/> 
             <span>{patient?.birthMonth}/{patient?.birthYear}</span>
           </div>
           <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
           <div className="flex items-center gap-1.5" title="Commune">
             <MapPin size={16} className="text-[#243884]"/> 
             <span>{communeName}</span>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 bg-gray-50 px-5 py-2.5 rounded-xl border border-gray-200 w-full md:w-auto shadow-sm">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-700">Le patient a répondu ?</span>
        </div>
        <button
          type="button"
          onClick={() => handleChange('aRepondu', !patient?.aRepondu)}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#243884] focus:ring-offset-2 ${
            patient?.aRepondu ? 'bg-green-500' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={patient?.aRepondu}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              patient?.aRepondu ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </header>
  );
}
