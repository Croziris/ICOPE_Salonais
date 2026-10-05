import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import QuestionCard from './QuestionCard';
import ConclusionCard from './ConclusionCard';

export default function DomainEvaluation({ domaine, patient, communes, onClose, onComplete }) {
  const [currentNodeId, setCurrentNodeId] = useState(domaine.first_node);
  const [history, setHistory] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [finalStatus, setFinalStatus] = useState(null); // Track the final status decided by practicien
  
  const bottomRef = useRef(null);

  const currentNode = domaine.nodes[currentNodeId];

  const futureNodes = useMemo(() => {
    const futures = [];
    let nodeId = currentNode?.type === 'multiple_choice' 
      ? null 
      : currentNode?.options?.[0]?.next;

    while (nodeId && (domaine.nodes[nodeId]?.type === 'question' || domaine.nodes[nodeId]?.type === 'multiple_choice' || domaine.nodes[nodeId]?.type === 'slider')) {
      futures.push({ id: nodeId, ...domaine.nodes[nodeId] });
      nodeId = (domaine.nodes[nodeId]?.type === 'multiple_choice' || domaine.nodes[nodeId]?.type === 'slider')
        ? null 
        : domaine.nodes[nodeId]?.options?.[0]?.next;
    }
    return futures;
  }, [currentNodeId, domaine]);

  useEffect(() => {
    if (history.length > 0) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentNodeId, history]);

  const handleAnswer = (answerData) => {
    let nextNodeId = null;
    let formattedOption = null;

    if (currentNode.type === 'multiple_choice') {
      const isAnySelected = answerData.length > 0;
      nextNodeId = isAnySelected ? currentNode.next_if_any : currentNode.next_if_none;
      
      const selectedLabels = answerData.map(id => currentNode.options.find(o => o.id === id).label);
      formattedOption = { label: isAnySelected ? selectedLabels.join(' | ') : "Aucun critère sélectionné" };
    } else if (currentNode.type === 'slider') {
      const threshold = currentNode.next_thresholds.find(t => answerData <= t.max) || currentNode.next_thresholds[currentNode.next_thresholds.length - 1];
      nextNodeId = threshold.next;
      formattedOption = { label: `Niveau d'urgence : ${answerData} (${threshold.label})` };
    } else {
      nextNodeId = answerData.next;
      formattedOption = answerData;
    }

    setHistory(prev => [...prev, {
      nodeId: currentNodeId,
      question: currentNode.texte,
      answeredOption: formattedOption,
      note: currentNote.trim() || null
    }]);
    setCurrentNote('');
    setCurrentNodeId(nextNodeId);
  };

  const handleGoBack = (historyIndex) => {
    const target = history[historyIndex];
    setHistory(prev => prev.slice(0, historyIndex));
    setCurrentNodeId(target.nodeId);
    setCurrentNote(target.note || '');
  };

  const statusToUse = finalStatus || currentNode?.status;

  return (
    <div className="fixed inset-0 z-50 bg-[#FFFFFF] lg:bg-black/50 lg:flex lg:items-center lg:justify-center">
      <div className="h-full lg:h-auto lg:max-h-[90vh] lg:w-full lg:max-w-2xl lg:rounded-2xl 
                      bg-[#FFFFFF] flex flex-col overflow-hidden lg:shadow-2xl">
        
        <div className="flex items-center justify-between p-4 border-b shrink-0 text-white shadow-sm"
             style={{ backgroundColor: domaine.couleur?.hex || '#243884' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{domaine.icone}</span>
            <h2 className="font-bold text-xl">{domaine.titre}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-white/80 cursor-pointer flex items-center gap-1.5 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          
          {history.map((step, i) => (
            <QuestionCard
              key={step.nodeId}
              step={step}
              index={i + 1}
              status="answered"
              onGoBack={() => handleGoBack(i)}
            />
          ))}

          {(currentNode?.type === 'question' || currentNode?.type === 'multiple_choice' || currentNode?.type === 'slider') && (
            <QuestionCard
              key={currentNodeId}
              node={currentNode}
              index={history.length + 1}
              status="active"
              note={currentNote}
              onNoteChange={setCurrentNote}
              onAnswer={handleAnswer}
              domainColor={domaine.couleur}
            />
          )}

          {futureNodes.map((node, i) => (
            <QuestionCard
              key={node.id}
              node={node}
              index={history.length + 2 + i}
              status="locked"
            />
          ))}

          {currentNode?.type === 'conclusion' && (
            <ConclusionCard
              node={currentNode}
              patient={patient}
              communes={communes}
              onFinalStatusChange={setFinalStatus}
            />
          )}
          
          <div ref={bottomRef} className="h-4" />
        </div>

        {currentNode?.type === 'conclusion' && (
          <div className="p-4 border-t bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => onComplete({
                status: statusToUse,
                algoStatus: currentNode.status,
                conclusion: currentNode.texte,
                history: history,
                actions: statusToUse === 'VRAIE' ? currentNode.actions : [],
                ressources_communes: statusToUse === 'VRAIE' ? currentNode.ressources_communes : []
              })}
              className="w-full py-4 bg-[#243884] text-white rounded-xl font-bold 
                         text-lg hover:bg-[#1E3A8A] transition-colors cursor-pointer shadow-md active:scale-[0.99]"
            >
              ✅ Valider et terminer ce domaine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
