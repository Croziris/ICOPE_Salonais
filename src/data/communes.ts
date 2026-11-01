export interface CommuneInfo {
  id: string;
  nom: string;
  codePostal?: string;
}

export const COMMUNES_BASSIN: CommuneInfo[] = [
  { id: 'salon', nom: 'Salon-de-Provence', codePostal: '13300' },
  { id: 'aurons', nom: 'Aurons', codePostal: '13121' },
  { id: 'pelissanne', nom: 'Pélissanne', codePostal: '13330' },
  { id: 'la_barben', nom: 'La Barben', codePostal: '13330' },
  { id: 'st_cannat', nom: 'Saint-Cannat', codePostal: '13760' },
  { id: 'lambesc', nom: 'Lambesc', codePostal: '13410' },
  { id: 'lancon', nom: 'Lançon-de-Provence', codePostal: '13680' },
  { id: 'grans', nom: 'Grans', codePostal: '13450' },
  { id: 'cornillon', nom: 'Cornillon-Confoux', codePostal: '13250' },
];
