import { useState, useCallback, useEffect } from 'react';
import domainesData from './data/domaines_icope.json';
import { COMMUNES_BASSIN } from './data/communes';
import { 
  getStoredAnnuaire, 
  syncWithGoogleSheet, 
  RessourceAnnuaire 
} from './services/annuaireService';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DomainGrid from './components/DomainGrid';
import DomainEvaluation from './components/DomainEvaluation';
import ReportModal from './components/ReportModal';
import PatientForm from './components/PatientForm';
import AnnuaireView from './components/AnnuaireView';

const INITIAL_PATIENT = {
  initiales: '',
  birthYear: '',
  birthMonth: '',
  naissance: '',
  commune: '',
  aRepondu: true,
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Vue active : 'alerts' (gestion des appels/triage) ou 'annuaire' (répertoire des ressources)
  const [activeView, setActiveView] = useState<'alerts' | 'annuaire'>('alerts');

  // Données de l'annuaire (chargées depuis cache ou JSON par défaut)
  const [annuaireData, setAnnuaireData] = useState(() => getStoredAnnuaire());

  // Synchronisation automatique en tâche de fond si une URL de tableur est configurée
  useEffect(() => {
    if (annuaireData.sheetUrl) {
      syncWithGoogleSheet(annuaireData.sheetUrl).then(res => {
        if (res.success && res.ressources) {
          setAnnuaireData(prev => ({
            ...prev,
            ressources: res.ressources!,
            lastSync: res.timestamp || null,
            source: 'cache'
          }));
        }
      });
    }
  }, []);

  const handleUpdateRessources = useCallback((newRessources: RessourceAnnuaire[]) => {
    setAnnuaireData(prev => ({
      ...prev,
      ressources: newRessources,
      lastSync: new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  }, []);

  // États du flux d'appel ICOPE
  const [callStep, setCallStep] = useState('idle'); // 'idle' | 'patient' | 'eval'
  const [patient, setPatient] = useState({ ...INITIAL_PATIENT });
  const [selectedDomains, setSelectedDomains] = useState(new Set());
  const [completedDomains, setCompletedDomains] = useState<Record<string, any>>({});
  const [activeDomainModal, setActiveDomainModal] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);

  const handleNewCall = useCallback(() => {
    setActiveView('alerts');
    setCallStep('patient');
    setPatient({ ...INITIAL_PATIENT });
    setSelectedDomains(new Set());
    setCompletedDomains({});
    setActiveDomainModal(null);
    setShowReport(false);
  }, []);

  const handlePatientValid = useCallback(() => {
    setCallStep('eval');
  }, []);

  const handleToggleDomain = useCallback((domainId: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
        setCompletedDomains((cd) => {
          const copy = { ...cd };
          delete copy[domainId];
          return copy;
        });
      } else {
        next.add(domainId);
      }
      return next;
    });
  }, []);

  const handleOpenDomain = useCallback((domaine: any) => {
    setActiveDomainModal(domaine);
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveDomainModal(null);
  }, []);

  const handleModalComplete = useCallback((domainId: string, result: any) => {
    setCompletedDomains((prev) => ({
      ...prev,
      [domainId]: result,
    }));
    setActiveDomainModal(null);
  }, []);

  const handleReset = useCallback(() => {
    setCallStep('idle');
    setPatient({ ...INITIAL_PATIENT });
    setSelectedDomains(new Set());
    setCompletedDomains({});
    setActiveDomainModal(null);
    setShowReport(false);
  }, []);

  const allSelectedCompleted =
    selectedDomains.size > 0 &&
    [...selectedDomains].every((id: any) => completedDomains[id]);

  const canGenerateReport = patient.aRepondu && allSelectedCompleted;
  const showHamburger = !sidebarOpen;

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <Sidebar
        onNewCall={handleNewCall}
        activeCallExists={callStep !== 'idle'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        
        {/* VUE : ANNUAIRE DES RESSOURCES */}
        {activeView === 'annuaire' && (
          <AnnuaireView
            ressources={annuaireData.ressources}
            onRessourcesUpdated={handleUpdateRessources}
            lastSync={annuaireData.lastSync}
            onOpenSidebar={() => {
              setSidebarOpen(true);
              setSidebarCollapsed(false);
            }}
            showHamburger={showHamburger || sidebarCollapsed}
          />
        )}

        {/* VUE : GESTION DES ALERTES & APPELS */}
        {activeView === 'alerts' && (
          <>
            {callStep === 'patient' && (
              <>
                {showHamburger && (
                  <div className="p-4 lg:hidden">
                    <button 
                      onClick={() => setSidebarOpen(true)} 
                      className="p-2 bg-white shadow-sm border border-gray-200 rounded-lg text-[#243884] font-semibold cursor-pointer"
                    >
                      Ouvrir le menu
                    </button>
                  </div>
                )}
                <PatientForm 
                  patient={patient} 
                  setPatient={setPatient} 
                  communes={COMMUNES_BASSIN} 
                  onValid={handlePatientValid} 
                />
              </>
            )}

            {callStep === 'eval' && (
              <>
                <Topbar
                  patient={patient}
                  setPatient={setPatient}
                  communes={COMMUNES_BASSIN}
                  onToggleSidebar={() => {
                    setSidebarOpen(true);
                    setSidebarCollapsed(false);
                  }}
                  showHamburger={showHamburger || sidebarCollapsed}
                />

                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                  <DomainGrid
                    domaines={domainesData.domaines_icope}
                    selectedDomains={selectedDomains}
                    completedDomains={completedDomains}
                    onToggleDomain={handleToggleDomain}
                    onOpenDomain={handleOpenDomain}
                    patientARepondu={patient.aRepondu}
                    patient={patient}
                  />

                  {selectedDomains.size > 0 && patient.aRepondu && (
                    <div className="mt-10 mb-8 flex justify-center px-4">
                      <button
                        onClick={() => setShowReport(true)}
                        disabled={!canGenerateReport}
                        className={`
                          w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold transition-all active:scale-[0.98]
                          ${
                            canGenerateReport
                              ? 'bg-[#243884] hover:bg-[#1E3A8A] text-white cursor-pointer shadow-md hover:shadow-lg'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-inner'
                          }
                        `}
                      >
                        📋 Générer le rapport final
                      </button>
                    </div>
                  )}

                  {selectedDomains.size > 0 &&
                    patient.aRepondu &&
                    !canGenerateReport && (
                      <p className="text-center text-sm font-medium text-[#243884]/80 mt-4 px-4 bg-blue-50 py-3 rounded-lg max-w-xl mx-auto border border-blue-100">
                        ℹ️ Terminez l'évaluation de tous les domaines sélectionnés pour activer la génération du rapport.
                      </p>
                    )}
                </main>

                {activeDomainModal && (
                  <DomainEvaluation
                    domaine={activeDomainModal}
                    patient={patient}
                    communes={COMMUNES_BASSIN}
                    onClose={handleModalClose}
                    onComplete={(result) => handleModalComplete(activeDomainModal.id, result)}
                    annuaireRessources={annuaireData.ressources}
                  />
                )}

                {showReport && (
                  <ReportModal
                    patient={patient}
                    communes={COMMUNES_BASSIN}
                    completedDomains={completedDomains}
                    domaines={domainesData.domaines_icope}
                    onClose={() => setShowReport(false)}
                    onReset={handleReset}
                    annuaireRessources={annuaireData.ressources}
                  />
                )}
              </>
            )}

            {callStep === 'idle' && (
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-lg bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100">
                  <div className="text-7xl mb-6 select-none">🏥</div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#243884] mb-4 tracking-tight">
                    ICOPE Salonais
                  </h1>
                  <p className="text-gray-500 mb-8 font-medium leading-relaxed text-lg">
                    Plateforme de gestion téléphonique des alertes ICOPE.
                    <br />Bassin de Salon-de-Provence.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <button
                      onClick={handleNewCall}
                      className="flex-1 bg-[#243884] hover:bg-[#1E3A8A] text-white font-bold py-3.5 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-95 text-base"
                    >
                      + Nouvel Appel
                    </button>
                    <button
                      onClick={() => setActiveView('annuaire')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 text-base border border-gray-200"
                    >
                      📖 Consulter l'Annuaire
                    </button>
                  </div>

                  <div className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-800 px-5 py-3 rounded-xl text-sm font-bold border border-blue-100 w-full">
                    🔒 100% Local-First — Secret médical garanti
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
