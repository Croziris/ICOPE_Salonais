import React from 'react';
import { FileText, Copy, XCircle, Check } from 'lucide-react';

const ReportModal = ({
  patient,
  communes,
  completedDomains,
  domaines,
  onClose,
  onReset
}) => {
  const [copied, setCopied] = React.useState(false);

  const communeName = communes.find(c => c.id === patient?.commune)?.nom || '---';

  const generateReportText = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    let text = `========================================\n`;
    text += `   COMPTE-RENDU D'APPEL – ICOPE Salonais\n`;
    text += `========================================\n`;
    text += `Date : ${dateStr}\n`;
    text += `Initiales : ${patient?.initiales || '---'}\n`;
    text += `Date de naissance : ${patient?.birthMonth || 'MM'}/${patient?.birthYear || 'YYYY'}\n`;
    text += `Commune : ${communeName}\n`;
    text += `----------------------------------------\n\n`;

    Object.entries(completedDomains).forEach(([domainId, result]) => {
      const domaine = domaines.find(d => d.id === domainId);
      if (!domaine) return;

      text += `► ${domaine.titre.toUpperCase()} — Alerte ${result.status}\n`;
      text += `  Parcours décisionnel :\n`;
      
      if (result.history && result.history.length > 0) {
        result.history.forEach((step, index) => {
          text += `    Q${index + 1}: ${step.question}\n`;
          text += `    R: ${step.answeredOption?.label || step.answer || '---'}\n`;
          if (step.note) {
            text += `    📝 Note: ${step.note}\n`;
          }
        });
      } else {
        text += `    Aucun historique de question.\n`;
      }
      
      if (result.status !== result.algoStatus) {
        text += `  → Décision finale : ${result.status === 'VRAIE' ? 'VRAIE ALERTE' : 'FAUSSE ALERTE'} (Forcée manuellement par le professionnel)\n`;
      } else {
        text += `  → Conclusion algorithme : ${result.conclusion}\n`;
      }

      if (result.ressources_communes && result.ressources_communes.length > 0) {
        const communeObj = communes.find(c => c.id === patient?.commune);
        if (communeObj && communeObj.ressources) {
          text += `  📞 Ressources utiles (${communeObj.nom}) :\n`;
          result.ressources_communes.forEach(resKey => {
            const resInfo = communeObj.ressources[resKey];
            if (resInfo && (resInfo.nom || resInfo.tel)) {
               text += `    - ${resInfo.nom || resKey} : ${resInfo.tel || 'Non renseigné'}\n`;
            }
          });
        }
      }
      text += `\n`;
    });

    text += `----------------------------------------\n`;
    text += `========================================\n`;
    text += `Rapport généré automatiquement – ICOPE Salonais v2.0\n`;
    text += `========================================\n`;

    return text;
  };

  const reportText = generateReportText();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col my-8">
        <div className="flex items-center justify-between p-6 bg-[#243884] text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">Compte-rendu d'appel</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <XCircle className="w-5 h-5 text-blue-200 hover:text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <pre className="bg-gray-50 p-5 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap border border-gray-200 text-gray-800 leading-relaxed shadow-inner">
            {reportText}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={handleCopy}
            className="flex justify-center items-center gap-2 px-5 py-3 bg-[#243884] text-white font-medium rounded-lg hover:bg-[#1E3A8A] transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Copier dans le presse-papier'}
          </button>
          
          <button
            onClick={onReset}
            className="flex justify-center items-center gap-2 px-5 py-3 bg-white border-2 border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <XCircle className="w-4 h-4" />
            Clôturer l'appel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
