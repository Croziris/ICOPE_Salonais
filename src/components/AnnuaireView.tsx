import React, { useState, useMemo } from 'react';
import { 
  Search, Phone, Mail, MapPin, RefreshCw, ExternalLink, 
  Lock, Check, Copy, AlertCircle, X, Building2,
  Tag, ChevronDown, Menu
} from 'lucide-react';
import { 
  RessourceAnnuaire, 
  SHEET_PASSWORD, 
  DEFAULT_SHEET_EDIT_URL,
  cleanString, 
  isCommuneCovered,
  syncWithGoogleSheet
} from '../services/annuaireService';
import { COMMUNES_BASSIN } from '../data/communes';

interface AnnuaireViewProps {
  ressources: RessourceAnnuaire[];
  onRessourcesUpdated: (newRessources: RessourceAnnuaire[]) => void;
  lastSync: string | null;
  onOpenSidebar?: () => void;
  showHamburger?: boolean;
}

const DOMAINES_FILTRES = [
  'Tous',
  'Social',
  'Aidants',
  'Mobilité',
  'Humeur',
  'Psychologie',
  'Nutrition',
  'Mémoire'
];

export default function AnnuaireView({
  ressources,
  onRessourcesUpdated,
  lastSync,
  onOpenSidebar,
  showHamburger
}: AnnuaireViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('Tous');
  
  // États de chargement et modales
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtrage intelligent
  const filteredRessources = useMemo(() => {
    return ressources.filter(res => {
      // 1. Filtre textuel
      if (search.trim()) {
        const query = cleanString(search);
        const matchNom = cleanString(res.nom).includes(query);
        const matchCommune = cleanString(res.communes).includes(query);
        const matchDesc = cleanString(res.description || '').includes(query);
        const matchTel = cleanString(res.telephone || '').includes(query);
        const matchAdresse = cleanString(res.adresse || '').includes(query);
        const matchDomaine = Array.isArray(res.domaines) && res.domaines.some(d => cleanString(d).includes(query));

        if (!matchNom && !matchCommune && !matchDesc && !matchTel && !matchAdresse && !matchDomaine) {
          return false;
        }
      }

      // 2. Filtre commune
      if (selectedCommune) {
        if (!isCommuneCovered(res.communes, selectedCommune)) {
          return false;
        }
      }

      // 3. Filtre domaine ICOPE
      if (selectedDomaine !== 'Tous') {
        const targetClean = cleanString(selectedDomaine);
        const hasDomaine = Array.isArray(res.domaines) && res.domaines.some(d => cleanString(d).includes(targetClean));
        const hasCategory = cleanString(res.categorie).includes(targetClean);
        if (!hasDomaine && !hasCategory) {
          return false;
        }
      }

      return true;
    });
  }, [ressources, search, selectedCommune, selectedDomaine]);

  // Synchronisation avec le Google Sheet
  const handleSync = async (customUrl?: string) => {
    setIsSyncing(true);
    setSyncMessage(null);

    const res = await syncWithGoogleSheet(customUrl);
    setIsSyncing(false);

    if (res.success && res.ressources) {
      onRessourcesUpdated(res.ressources);
      setSyncMessage({
        text: `Synchronisé ! (${res.ressources.length} structures)`,
        isError: false
      });
      setTimeout(() => setSyncMessage(null), 4000);
    } else {
      setSyncMessage({
        text: res.error || "Impossible de synchroniser.",
        isError: true
      });
    }
  };

  // Validation du mot de passe pour ouvrir le Google Sheet en édition
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === SHEET_PASSWORD) {
      setShowPasswordModal(false);
      setInputPassword('');
      setPasswordError(false);
      window.open(DEFAULT_SHEET_EDIT_URL, '_blank', 'noopener,noreferrer');
    } else {
      setPasswordError(true);
    }
  };

  // Copie de texte avec feedback
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16 w-full max-w-full overflow-x-hidden">
      {/* En-tête supérieur */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            
            {/* Titre et bouton menu */}
            <div className="flex items-center gap-2.5 min-w-0">
              {showHamburger && onOpenSidebar && (
                <button
                  onClick={onOpenSidebar}
                  className="lg:hidden p-2 rounded-xl bg-gray-100 text-[#243884] hover:bg-gray-200 cursor-pointer shrink-0"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold text-[#243884] flex items-center gap-2 truncate">
                  <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-[#243884] shrink-0" />
                  <span className="truncate">Annuaire des Ressources</span>
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
                  Bassin Salonais • Répertoire territorial collaboratif
                </p>
              </div>
            </div>

            {/* Actions rapides sur mobile : 2 boutons côte-à-côte bien calibrés */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => handleSync()}
                disabled={isSyncing}
                title="Actualiser les données depuis Google Sheets"
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSyncing
                    ? 'bg-blue-100 text-blue-700 cursor-wait'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-2xs active:scale-95'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'En cours...' : 'Actualiser'}</span>
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                title="Ouvrir le tableur Google Sheets (Accès restreint)"
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#243884] hover:bg-[#1E3A8A] text-white shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200 shrink-0" />
                <span className="truncate">Éditer Sheets</span>
              </button>
            </div>
          </div>

          {/* Bandeau de statut de synchronisation */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">
                {ressources.length} structures {lastSync ? ` • Synchro le ${lastSync}` : ' • Mode local'}
              </span>
            </div>
            {syncMessage && (
              <span className={`font-semibold shrink-0 ${syncMessage.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                {syncMessage.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6 w-full min-w-0">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-gray-200 space-y-3 sm:space-y-4 w-full min-w-0">
          <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
            {/* Champ de recherche */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher nom, commune, contact..."
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#243884] focus:border-[#243884] outline-none text-sm sm:text-base bg-gray-50/50"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sélecteur de Commune */}
            <div className="relative md:w-72 min-w-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#243884] focus:border-[#243884] outline-none text-sm sm:text-base bg-gray-50/50 appearance-none font-medium text-gray-700 cursor-pointer truncate"
              >
                <option value="">Toutes les communes</option>
                {COMMUNES_BASSIN.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filtres rapides Domaines ICOPE : défilement horizontal fluide et confiné */}
          <div className="w-full min-w-0 overflow-x-auto pb-1 pt-1 -mx-1 px-1 scrollbar-none">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
              <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Domaines :
              </span>
              {DOMAINES_FILTRES.map(dom => {
                const active = selectedDomaine === dom;
                return (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomaine(dom)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#243884] text-white shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {dom}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Compteur de résultats */}
        <div className="mt-3 sm:mt-4 mb-2 flex items-center justify-between px-1 text-xs sm:text-sm">
          <p className="font-semibold text-gray-600 truncate">
            {filteredRessources.length} structure{filteredRessources.length > 1 ? 's' : ''}
            {(selectedCommune || selectedDomaine !== 'Tous' || search) && ' trouvée(s)'}
          </p>
          {(selectedCommune || selectedDomaine !== 'Tous' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCommune('');
                setSelectedDomaine('Tous');
              }}
              className="font-bold text-[#243884] hover:underline cursor-pointer shrink-0 ml-2"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Grille des fiches ressources */}
        {filteredRessources.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200 mt-3 sm:mt-4">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-1">Aucune structure correspondante</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Essayez d'élargir votre recherche ou sélectionnez « Toutes les communes ».
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 mt-3 sm:mt-4 w-full min-w-0">
            {filteredRessources.map(res => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between w-full min-w-0 overflow-hidden"
              >
                <div className="min-w-0">
                  {/* Badges domaines & catégorie */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2 sm:mb-3">
                    {Array.isArray(res.domaines) && res.domaines.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-blue-50 text-[#243884] border border-blue-100"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Nom de la structure */}
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug mb-2 break-words">
                    {res.nom}
                  </h3>

                  {/* Communes desservies */}
                  <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-2.5 bg-gray-50 p-2 sm:p-2.5 rounded-xl border border-gray-100 break-words">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-medium">
                      <strong>Territoire :</strong> {res.communes}
                    </span>
                  </div>

                  {/* Description */}
                  {res.description && (
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed break-words line-clamp-3 sm:line-clamp-4">
                      {res.description}
                    </p>
                  )}

                  {/* Adresse si disponible */}
                  {res.adresse && (
                    <div className="text-xs text-gray-500 mb-3 flex items-start gap-1.5 break-words">
                      <span className="font-semibold text-gray-700 shrink-0">📍</span>
                      <span className="select-all">{res.adresse}</span>
                    </div>
                  )}
                </div>

                {/* Coordonnées & Boutons d'action rapide */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 space-y-2 min-w-0">
                  {/* Téléphone */}
                  {res.telephone ? (
                    <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 p-2 sm:p-2.5 rounded-xl min-w-0">
                      <a
                        href={`tel:${res.telephone.replace(/[^0-9+]/g, '')}`}
                        className="flex items-center gap-1.5 sm:gap-2 text-emerald-900 font-bold text-xs sm:text-sm hover:underline min-w-0 truncate"
                      >
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{res.telephone}</span>
                      </a>
                      <button
                        onClick={() => handleCopy(`tel_${res.id}`, res.telephone)}
                        className="p-1 sm:p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors cursor-pointer shrink-0"
                        title="Copier le numéro"
                        aria-label="Copier le numéro"
                      >
                        {copiedId === `tel_${res.id}` ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic py-1">Téléphone non renseigné</div>
                  )}

                  {/* Email */}
                  {res.email && (
                    <div className="flex items-center justify-between gap-2 bg-gray-50 p-1.5 sm:p-2 rounded-xl text-xs min-w-0">
                      <a
                        href={`mailto:${res.email}`}
                        className="flex items-center gap-1.5 text-blue-700 font-medium truncate hover:underline min-w-0"
                      >
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{res.email}</span>
                      </a>
                      <button
                        onClick={() => handleCopy(`mail_${res.id}`, res.email!)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 cursor-pointer shrink-0"
                        title="Copier l'email"
                        aria-label="Copier l'email"
                      >
                        {copiedId === `mail_${res.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE : Mot de passe pour édition Google Sheets */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-blue-50 text-[#243884] rounded-xl sm:rounded-2xl">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">Accès Collaborateur</h3>
                  <p className="text-xs text-gray-500">Modification du tableur Google Sheets</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(false);
                  setInputPassword('');
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 leading-relaxed">
              Veuillez saisir le mot de passe réservé aux professionnels autorisés à modifier l'annuaire.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Mot de passe..."
                  className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base outline-none transition-all ${
                    passwordError 
                      ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-400' 
                      : 'border-gray-300 focus:ring-2 focus:ring-[#243884] focus:border-[#243884]'
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs text-red-600 mt-2 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Mot de passe incorrect.
                  </p>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#243884] hover:bg-[#1E3A8A] text-white shadow-md transition-all cursor-pointer"
                >
                  Déverrouiller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
