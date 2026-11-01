import defaultAnnuaire from '../data/annuaire_default.json';
import { COMMUNES_BASSIN } from '../data/communes';

export interface RessourceAnnuaire {
  id: string;
  nom: string;
  communes: string;
  categorie: string;
  domaines: string[];
  telephone: string;
  email?: string;
  adresse?: string;
  description?: string;
}

const STORAGE_KEY_URL = 'icope_sheet_url';
const STORAGE_KEY_CACHE = 'icope_annuaire_cache';
const STORAGE_KEY_TIMESTAMP = 'icope_annuaire_last_sync';

export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1eNcWj1muIhrNuSfdJQUv45FW9Yy69EkDX_NuIBZ0zas/edit?usp=sharing';
export const DEFAULT_SHEET_EDIT_URL = DEFAULT_SHEET_URL;
export const SHEET_PASSWORD = 'Icope!salonais';

// Normalisation pour recherche sans accent ni casse
export function cleanString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Liste des racines uniques des 9 communes du bassin pour une détection infaillible
const COMMUNE_ROOTS: { root: string; id: string; aliases: string[] }[] = [
  { root: 'salon', id: 'salon', aliases: ['salon', 'salon-de-provence', 'salon de provence'] },
  { root: 'aurons', id: 'aurons', aliases: ['aurons'] },
  { root: 'pelissanne', id: 'pelissanne', aliases: ['pelissanne'] },
  { root: 'barben', id: 'la_barben', aliases: ['barben', 'la barben', 'la-barben'] },
  { root: 'cannat', id: 'st_cannat', aliases: ['cannat', 'saint-cannat', 'st-cannat', 'saint cannat'] },
  { root: 'lambesc', id: 'lambesc', aliases: ['lambesc'] },
  { root: 'lancon', id: 'lancon', aliases: ['lancon', 'lancon-provence', 'lancon-de-provence', 'lancon de provence'] },
  { root: 'grans', id: 'grans', aliases: ['grans'] },
  { root: 'cornillon', id: 'cornillon', aliases: ['cornillon', 'cornillon-confoux', 'cornillon confoux'] }
];

// Vérifie si une ressource couvre la commune demandée (ultra-résilient aux sélections multiples)
export function isCommuneCovered(resourceCommunesStr: string, targetCommune: string): boolean {
  if (!targetCommune) return true;
  const cleanTarget = cleanString(targetCommune);
  const cleanResources = cleanString(resourceCommunesStr);

  // 1. Couvre tout le bassin ou toutes les communes
  if (
    cleanResources.includes('bassin') || 
    cleanResources.includes('toutes') || 
    cleanResources.includes('territoire') ||
    cleanResources.includes('tout')
  ) {
    return true;
  }

  // 2. Trouver la racine de la commune ciblée
  const targetItem = COMMUNE_ROOTS.find(
    c => c.id === targetCommune || c.aliases.some(a => cleanTarget.includes(a) || a.includes(cleanTarget))
  );

  const rootToFind = targetItem ? targetItem.root : cleanTarget;

  // 3. Détection par racine dans le texte complet (ex: "pelissanne" dans "Pélissanne, Aurons, La Barben")
  if (cleanResources.includes(rootToFind)) {
    return true;
  }

  // 4. Découpage par tous les séparateurs courants (virgule, point-virgule, barre, puce, tiret, saut de ligne)
  const parts = cleanResources.split(/[,;/\n•+\-]+/).map(p => p.trim());
  return parts.some(part => part.includes(rootToFind) || rootToFind.includes(part));
}

// Convertit un texte CSV en liste d'objets RessourceAnnuaire
export function parseCSV(csvText: string): RessourceAnnuaire[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => cleanString(h));
  const getIndex = (possibleNames: string[]) => {
    return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
  };

  const idxNom = getIndex(['nom', 'structure', 'organisme']);
  const idxCommunes = getIndex(['commune', 'ville', 'secteur']);
  const idxCat = getIndex(['cat', 'type', 'cle']);
  const idxDomaines = getIndex(['domaine', 'icope']);
  const idxTel = getIndex(['tel', 'phone', 'contact']);
  const idxEmail = getIndex(['mail', 'courriel']);
  const idxAdresse = getIndex(['adresse', 'rue', 'cp', 'lieu']);
  const idxDesc = getIndex(['desc', 'note', 'info', 'detail', 'horaire']);

  const resources: RessourceAnnuaire[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const nom = idxNom >= 0 ? cols[idxNom] : cols[0];
    if (!nom) continue;

    const rawDomaines = idxDomaines >= 0 ? cols[idxDomaines] || '' : '';
    const domainesList = rawDomaines
      ? rawDomaines.split(/[,;/+]+/).map(d => d.trim()).filter(Boolean)
      : [];

    resources.push({
      id: `res_${i}_${cleanString(nom).replace(/\s+/g, '_').slice(0, 15)}`,
      nom,
      communes: idxCommunes >= 0 ? cols[idxCommunes] || 'Bassin Salonais' : 'Bassin Salonais',
      categorie: idxCat >= 0 ? cleanString(cols[idxCat]) : 'partenaire',
      domaines: domainesList.length > 0 ? domainesList : ['Général'],
      telephone: idxTel >= 0 ? cols[idxTel] || '' : '',
      email: idxEmail >= 0 ? cols[idxEmail] || '' : '',
      adresse: idxAdresse >= 0 ? cols[idxAdresse] || '' : '',
      description: idxDesc >= 0 ? cols[idxDesc] || '' : '',
    });
  }

  return resources;
}

// Transformation d'une URL de partage Google Sheets en URL d'export CSV
export function formatGoogleSheetsExportUrl(inputUrl: string): string {
  if (!inputUrl) return '';
  const trimmed = inputUrl.trim();

  // Si c'est déjà un export csv ou pub?output=csv
  if (trimmed.includes('output=csv') || trimmed.includes('/export?format=csv')) {
    return trimmed;
  }

  // Si c'est une URL de document Google Sheets normale (https://docs.google.com/spreadsheets/d/ID/...)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const docId = match[1];
    // Extraction éventuelle du gid (onglet spécifique)
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv${gidParam}`;
  }

  return trimmed;
}

// Chargement initial (Cache localStorage ou données par défaut)
export function getStoredAnnuaire(): {
  ressources: RessourceAnnuaire[];
  source: 'cache' | 'default';
  lastSync: string | null;
  sheetUrl: string;
} {
  const sheetUrl = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SHEET_URL;
  const cachedJson = localStorage.getItem(STORAGE_KEY_CACHE);
  const lastSync = localStorage.getItem(STORAGE_KEY_TIMESTAMP);

  if (cachedJson) {
    try {
      const parsed = JSON.parse(cachedJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          ressources: parsed,
          source: 'cache',
          lastSync,
          sheetUrl
        };
      }
    } catch {
      // Ignorer si JSON invalide
    }
  }

  return {
    ressources: defaultAnnuaire as RessourceAnnuaire[],
    source: 'default',
    lastSync: null,
    sheetUrl
  };
}

// Synchronisation réseau avec le Google Sheet
export async function syncWithGoogleSheet(customUrl?: string): Promise<{
  success: boolean;
  ressources?: RessourceAnnuaire[];
  error?: string;
  timestamp?: string;
}> {
  const targetUrl = customUrl !== undefined ? customUrl : (localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SHEET_URL);
  if (!targetUrl) {
    return {
      success: false,
      error: "Aucun lien Google Sheets n'est encore configuré."
    };
  }

  const exportUrl = formatGoogleSheetsExportUrl(targetUrl);

  try {
    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/csv, text/plain, */*' },
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau (${response.status}) : Impossible de joindre le document.`);
    }

    const text = await response.text();
    // Détection d'une page de login Google au lieu du CSV
    if (text.includes('<!DOCTYPE html>') && text.includes('accounts.google.com')) {
      throw new Error("Le document Google Sheet doit être configuré en 'Tout le monde avec le lien : Lecteur' ou 'Publié sur le Web'.");
    }

    const parsed = parseCSV(text);
    if (!parsed || parsed.length === 0) {
      throw new Error("Le document a bien été téléchargé mais aucune ressource n'a pu être extraite.");
    }

    const now = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Sauvegarde dans le localStorage
    localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(parsed));
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, now);
    if (customUrl !== undefined) {
      localStorage.setItem(STORAGE_KEY_URL, customUrl);
    }

    return {
      success: true,
      ressources: parsed,
      timestamp: now
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Erreur de connexion au tableur en ligne."
    };
  }
}

// Recherche de ressources pour les alertes ICOPE
export function getRessourcesForAlert(
  patientCommune: string,
  ressourcesCommunesKeys: string[],
  allRessources: RessourceAnnuaire[] = []
): RessourceAnnuaire[] {
  if (!ressourcesCommunesKeys || !Array.isArray(ressourcesCommunesKeys) || ressourcesCommunesKeys.length === 0) return [];
  if (!allRessources || !Array.isArray(allRessources) || allRessources.length === 0) return [];

  return allRessources.filter(res => {
    if (!res) return false;
    // 1. Doit desservir la commune du patient
    if (!isCommuneCovered(res.communes, patientCommune)) {
      return false;
    }

    // 2. Doit correspondre à la clé d'alerte
    const resCat = cleanString(res.categorie || '');
    return ressourcesCommunesKeys.some(key => {
      const cleanKey = cleanString(key);
      if (cleanKey === 'ccas' && resCat.includes('ccas')) return true;
      if (
        (cleanKey === 'plateforme_aidants' || cleanKey === 'aidants') &&
        (resCat.includes('aidant') || resCat.includes('oasis') || resCat.includes('maillon') || resCat.includes('saj'))
      ) return true;
      if (
        (cleanKey === 'medecin_geriatre_astreinte' || cleanKey === 'geriatre') &&
        (resCat.includes('geriatre') || resCat.includes('astreinte'))
      ) return true;
      if (
        cleanKey === 'maison_sport_sante' &&
        resCat.includes('sport')
      ) return true;
      if (
        cleanKey === 'pole_info_senior' &&
        (resCat.includes('senior') || resCat.includes('pis'))
      ) return true;

      // Recherche par domaine
      return Array.isArray(res.domaines) && res.domaines.some(d => cleanString(d).includes(cleanKey));
    });
  });
}
