import React from 'react';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function PatientForm({ patient, setPatient, communes, onValid }) {
  const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 100 + i).reverse();
  const months = [
    { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
  ];

  const handleChange = (field, value) => {
    setPatient(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = patient.initiales?.length > 0 && patient.birthYear && patient.birthMonth && patient.commune;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      // Stocker au format YYYY-MM
      setPatient(prev => ({
        ...prev,
        naissance: `${prev.birthYear}-${prev.birthMonth}`
      }));
      onValid();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#243884] p-8 text-white flex flex-col items-center">
          <UserPlus className="w-14 h-14 mb-4 text-blue-200" />
          <h2 className="text-3xl font-extrabold tracking-tight">Nouveau Patient</h2>
          <p className="text-blue-200 text-sm mt-2 font-medium">Saisissez les informations obligatoires</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Initiales (Nom, Prénom)</label>
            <input
              type="text"
              maxLength={4}
              value={patient.initiales || ''}
              onChange={(e) => handleChange('initiales', e.target.value.toUpperCase())}
              placeholder="ABCD"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-[#243884] focus:border-[#243884] outline-none text-lg font-medium bg-gray-50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Année de naissance</label>
              <select
                value={patient.birthYear || ''}
                onChange={(e) => handleChange('birthYear', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#243884] focus:border-[#243884] outline-none font-medium bg-gray-50"
                required
              >
                <option value="">Année...</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mois de naissance</label>
              <select
                value={patient.birthMonth || ''}
                onChange={(e) => handleChange('birthMonth', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#243884] focus:border-[#243884] outline-none font-medium bg-gray-50"
                required
              >
                <option value="">Mois...</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Commune de résidence</label>
            <select
              value={patient.commune || ''}
              onChange={(e) => handleChange('commune', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#243884] focus:border-[#243884] outline-none font-medium bg-gray-50"
              required
            >
              <option value="">Sélectionnez la commune...</option>
              {communes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
                isFormValid 
                  ? 'bg-[#243884] text-white hover:bg-[#1E3A8A] cursor-pointer shadow-md' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              Commencer l'évaluation <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
