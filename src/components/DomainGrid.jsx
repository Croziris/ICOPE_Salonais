import React from 'react';
import { CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

const DomainGrid = ({
  domaines,
  selectedDomains,
  completedDomains,
  onToggleDomain,
  onOpenDomain,
  patientARepondu,
  patient
}) => {
  const [copied, setCopied] = React.useState(false);

  const selectedDomainesList = domaines.filter(d => selectedDomains.has(d.id));
  
  const handleCopyNoAnswer = () => {
    const domainTitles = selectedDomainesList.map(d => d.titre).join(', ');
    const text = `Échec de l'appel pour ${patient?.initiales || "---"}. Domaines concernés : ${domainTitles}. À rappeler ultérieurement.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Domaines d'alerte ICOPE</h2>
        <p className="text-gray-600 mt-1">Sélectionnez les domaines concernés par l'appel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {domaines.map(domaine => {
          const colors = domaine.couleur?.classes || { bg: 'bg-gray-50', border: 'border-gray-400' };
          const isSelected = selectedDomains.has(domaine.id);
          return (
            <label 
              key={domaine.id} 
              className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors shadow-sm ${isSelected ? `border-l-4 ${colors.border} bg-gray-50` : 'border-gray-200 hover:bg-gray-50 bg-white'}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleDomain(domaine.id)}
                className={`w-5 h-5 rounded border-gray-300 mr-3 text-[#243884] focus:ring-[#243884]`}
              />
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-xl">{domaine.icone}</span> {domaine.titre}
              </span>
            </label>
          );
        })}
      </div>

      {selectedDomains.size > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-8">
          {!patientARepondu ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start gap-4">
              <p className="text-gray-700 font-medium">
                Échec de l'appel pour <span className="font-bold text-[#243884]">{patient?.initiales || "---"}</span>. Domaines concernés : {selectedDomainesList.map(d => d.titre).join(', ')}. À rappeler ultérieurement.
              </p>
              <button 
                onClick={handleCopyNoAnswer}
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                <span className="text-sm font-medium text-gray-700">{copied ? 'Copié !' : 'Copier la synthèse'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {selectedDomainesList.map(domaine => {
                const colors = domaine.couleur?.classes || { bg: 'bg-gray-50', border: 'border-gray-400' };
                const completed = completedDomains[domaine.id];
                
                return (
                  <div 
                    key={domaine.id}
                    onClick={() => onOpenDomain(domaine)}
                    className={`flex flex-col rounded-xl border-l-4 ${colors.border} ${colors.bg} p-5 ${!completed ? 'hover:shadow-md cursor-pointer transition-shadow' : 'cursor-pointer'} shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{domaine.icone}</span>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{domaine.titre}</h3>
                    </div>
                    
                    {completed ? (
                      <div className="flex flex-col gap-3 mt-auto">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${completed.status === 'VRAIE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {completed.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2" title={completed.conclusion}>
                          {completed.conclusion}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600 mt-auto hover:text-gray-900 group font-medium">
                        <span className="text-sm">Évaluer ce domaine</span>
                        <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainGrid;
