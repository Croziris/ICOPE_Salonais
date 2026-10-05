import React, { useState, useEffect } from 'react';

export default function ConclusionCard({ node, patient, communes, onFinalStatusChange }) {
  const [praticienStatus, setPraticienStatus] = useState(null); // null, 'VRAIE', 'FAUSSE'
  
  const isAlgoVraie = node.status === 'VRAIE';
  const commune = communes.find(c => c.id === patient?.commune);

  const currentStatus = praticienStatus || node.status;
  const isVraie = currentStatus === 'VRAIE';
  
  // Inform parent of final status
  useEffect(() => {
    if (onFinalStatusChange) {
      onFinalStatusChange(currentStatus);
    }
  }, [currentStatus, onFinalStatusChange]);

  return (
    <div className={`rounded-xl p-6 border-2 shadow-sm transition-colors duration-300 ${isVraie ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{isVraie ? '🔴' : '🟢'}</span>
          <h3 className={`text-xl font-bold ${isVraie ? 'text-red-700' : 'text-green-700'}`}>
            {isVraie ? 'ALERTE VRAIE' : 'FAUSSE ALERTE'}
            {praticienStatus && praticienStatus !== node.status && (
              <span className="ml-3 text-xs uppercase tracking-wider bg-white px-2 py-1 rounded-md font-bold text-gray-500 shadow-sm border border-gray-200">
                Surchargé
              </span>
            )}
          </h3>
        </div>
      </div>
      
      <p className="text-gray-800 font-medium mb-5 text-lg leading-relaxed">{node.texte}</p>

      {/* Algo's original actions/resources */}
      {isVraie && node.actions && node.actions.length > 0 && (
        <div className="bg-white/80 p-4 rounded-xl border border-white shadow-sm mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">Actions requises :</p>
          <ul className="list-disc list-inside text-gray-800 font-medium space-y-1">
            {node.actions.map((act, i) => (
              <li key={i}>{act.label}</li>
            ))}
          </ul>
        </div>
      )}

      {isVraie && commune && node.ressources_communes && node.ressources_communes.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-5">
          <p className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">📞 Ressources pour {commune.nom} :</p>
          <div className="space-y-3">
            {node.ressources_communes.map((resKey, i) => {
              const resInfo = commune.ressources?.[resKey];
              if (!resInfo || (!resInfo.nom && !resInfo.tel)) return null;
              return (
                <div key={i} className="text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{resInfo.nom || resKey}</span>
                  {resInfo.tel && <span className="text-[#243884] font-bold mt-1 sm:mt-0">{resInfo.tel}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Surcharge praticien */}
      <div className="mt-6 pt-5 border-t border-black/5">
        <p className="font-semibold text-gray-700 mb-4 text-sm flex items-center gap-2">
          🧑‍⚕️ Avis du professionnel : Confirmez-vous cette conclusion ?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setPraticienStatus('VRAIE')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all cursor-pointer ${
              currentStatus === 'VRAIE' 
                ? 'bg-red-600 text-white border-red-600 shadow-md scale-[1.02]' 
                : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
            }`}
          >
            Alerte VRAIE
          </button>
          <button 
            onClick={() => setPraticienStatus('FAUSSE')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all cursor-pointer ${
              currentStatus === 'FAUSSE' 
                ? 'bg-green-600 text-white border-green-600 shadow-md scale-[1.02]' 
                : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
            }`}
          >
            Fausse Alerte
          </button>
        </div>
      </div>
    </div>
  );
}
