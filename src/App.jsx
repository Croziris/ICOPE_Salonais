import { useState, useCallback } from 'react'
import data from '../data.json'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DomainGrid from './components/DomainGrid'
import DomainEvaluation from './components/DomainEvaluation'
import ReportModal from './components/ReportModal'
import PatientForm from './components/PatientForm'

const INITIAL_PATIENT = {
  initiales: '',
  birthYear: '',
  birthMonth: '',
  naissance: '',
  commune: '',
  aRepondu: true,
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const [callStep, setCallStep] = useState('idle') // 'idle' | 'patient' | 'eval'
  const [patient, setPatient] = useState({ ...INITIAL_PATIENT })
  const [selectedDomains, setSelectedDomains] = useState(new Set())
  const [completedDomains, setCompletedDomains] = useState({})
  const [activeDomainModal, setActiveDomainModal] = useState(null)
  const [showReport, setShowReport] = useState(false)

  const handleNewCall = useCallback(() => {
    setCallStep('patient')
    setPatient({ ...INITIAL_PATIENT })
    setSelectedDomains(new Set())
    setCompletedDomains({})
    setActiveDomainModal(null)
    setShowReport(false)
  }, [])

  const handlePatientValid = useCallback(() => {
    setCallStep('eval')
  }, [])

  const handleToggleDomain = useCallback((domainId) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domainId)) {
        next.delete(domainId)
        setCompletedDomains((cd) => {
          const copy = { ...cd }
          delete copy[domainId]
          return copy
        })
      } else {
        next.add(domainId)
      }
      return next
    })
  }, [])

  const handleOpenDomain = useCallback((domaine) => {
    setActiveDomainModal(domaine)
  }, [])

  const handleModalClose = useCallback(() => {
    setActiveDomainModal(null)
  }, [])

  const handleModalComplete = useCallback((domainId, result) => {
    setCompletedDomains((prev) => ({
      ...prev,
      [domainId]: result,
    }))
    setActiveDomainModal(null)
  }, [])

  const handleReset = useCallback(() => {
    setCallStep('idle')
    setPatient({ ...INITIAL_PATIENT })
    setSelectedDomains(new Set())
    setCompletedDomains({})
    setActiveDomainModal(null)
    setShowReport(false)
  }, [])

  const allSelectedCompleted =
    selectedDomains.size > 0 &&
    [...selectedDomains].every((id) => completedDomains[id])

  const canGenerateReport = patient.aRepondu && allSelectedCompleted
  
  const showHamburger = !sidebarOpen

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <Sidebar
        onNewCall={handleNewCall}
        activeCallExists={callStep !== 'idle'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        
        {callStep === 'patient' && (
          <>
            {showHamburger && (
              <div className="p-4 lg:hidden">
                <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white shadow-sm border border-gray-200 rounded-lg text-[#243884] font-semibold cursor-pointer">
                  Ouvrir le menu
                </button>
              </div>
            )}
            <PatientForm 
              patient={patient} 
              setPatient={setPatient} 
              communes={data.communes} 
              onValid={handlePatientValid} 
            />
          </>
        )}

        {callStep === 'eval' && (
          <>
            <Topbar
              patient={patient}
              setPatient={setPatient}
              communes={data.communes}
              onToggleSidebar={() => {
                setSidebarOpen(true)
                setSidebarCollapsed(false)
              }}
              showHamburger={showHamburger || sidebarCollapsed}
            />

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <DomainGrid
                domaines={data.domaines_icope}
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
                communes={data.communes}
                onClose={handleModalClose}
                onComplete={(result) => handleModalComplete(activeDomainModal.id, result)}
              />
            )}

            {showReport && (
              <ReportModal
                patient={patient}
                communes={data.communes}
                completedDomains={completedDomains}
                domaines={data.domaines_icope}
                onClose={() => setShowReport(false)}
                onReset={handleReset}
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
              <p className="text-gray-500 mb-10 font-medium leading-relaxed text-lg">
                Plateforme de gestion téléphonique des alertes ICOPE.
                <br />Bassin de Salon-de-Provence.
              </p>
              
              <div className="lg:hidden mb-8">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-full bg-[#243884] hover:bg-[#1E3A8A] text-white font-bold py-4 rounded-xl shadow-md cursor-pointer transition-colors text-lg"
                >
                  Ouvrir le menu
                </button>
              </div>

              <div className="hidden lg:block mb-8">
                 <p className="text-sm text-gray-500 bg-gray-50 py-3 px-4 rounded-lg inline-block border border-gray-200">
                    Cliquez sur <strong className="text-[#243884]">+ Nouvel Appel</strong> dans la barre latérale pour commencer.
                 </p>
              </div>

              <div className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-800 px-5 py-3 rounded-xl text-sm font-bold border border-blue-100 w-full">
                🔒 100% Local-First — Secret médical garanti
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
