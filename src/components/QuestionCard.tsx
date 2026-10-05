import React, { useState } from 'react';
import { CheckSquare, Info } from 'lucide-react';

export default function QuestionCard({
  node, step, index, status,
  note, onNoteChange, onAnswer, onGoBack,
  domainColor
}: any) {
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [sliderVal, setSliderVal] = useState(node?.min || 0);

  const severityStyles = {
    danger:  'bg-[#EF4444] hover:bg-red-600 text-white',
    warning: 'bg-[#F59E0B] hover:bg-amber-600 text-white',
    safe:    'bg-[#22C55E] hover:bg-green-600 text-white',
  };

  const sliderColors = [
    '#FDE047', 
    '#F59E0B', 
    '#EA580C', 
    '#EF4444', 
    '#991B1B', 
    '#000000', 
  ];

  const toggleOption = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (status === 'answered') {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            Étape {index}
          </span>
          <button onClick={onGoBack} className="text-xs text-[#243884] hover:underline cursor-pointer font-medium">
            Modifier
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">{step.question}</p>
        <p className="text-sm font-semibold text-gray-800">→ {step.answeredOption?.label || '---'}</p>
        {step.note && (
          <p className="text-xs text-gray-500 mt-2 italic border-t pt-2 border-gray-100">📝 {step.note}</p>
        )}
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className="bg-gray-50/50 rounded-xl p-4 border border-dashed border-gray-200 opacity-50">
        <span className="text-xs font-semibold text-gray-400 uppercase">
          Étape {index}
        </span>
        <p className="text-sm text-gray-400 mt-1">{node.texte}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 border-2 border-l-4 bg-white shadow-sm"
         style={{ borderLeftColor: domainColor?.hex || '#ccc', borderColor: domainColor?.hex || '#eee' }}>
      
      {node.info_box && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-sm text-blue-900 leading-relaxed shadow-inner">
          <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
          <p className="whitespace-pre-line font-semibold">{node.info_box}</p>
        </div>
      )}

      <span className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
        Étape {index}
      </span>
      <p className="text-base font-medium text-gray-800 mb-5">{node.texte}</p>
      
      {node.type === 'multiple_choice' ? (
        <div className="space-y-3 mb-6">
          {node.options.map((option) => (
            <label key={option.id} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm select-none">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-[#243884] rounded border-gray-300 focus:ring-2 focus:ring-[#243884] cursor-pointer"
                checked={selectedIds.includes(option.id)}
                onChange={() => toggleOption(option.id)}
              />
              <span className="ml-3 font-medium text-gray-700">{option.label}</span>
            </label>
          ))}
          <button
            onClick={() => onAnswer(selectedIds)}
            className="w-full mt-4 py-4 px-5 rounded-xl text-center font-bold text-white bg-[#243884] hover:bg-[#1E3A8A] transition-all active:scale-[0.98] shadow-md flex justify-center items-center gap-2 cursor-pointer"
          >
            <CheckSquare className="w-5 h-5" />
            Valider la sélection
          </button>
        </div>
      ) : node.type === 'slider' ? (
        <div className="mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-4 px-2">
            <span>{node.min}</span>
            <span>{node.max}</span>
          </div>
          <input
            type="range"
            min={node.min}
            max={node.max}
            step="1"
            value={sliderVal}
            onChange={(e) => setSliderVal(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer outline-none"
            style={{
               background: `linear-gradient(to right, #FDE047, #F59E0B, #EA580C, #EF4444, #991B1B, #000000)`
            }}
          />
          <div className="text-center mt-6">
            <span 
              className="inline-block text-2xl font-black px-6 py-2 rounded-xl text-white shadow-md transition-colors"
              style={{ backgroundColor: sliderColors[sliderVal] }}
            >
              Niveau : {sliderVal}
            </span>
          </div>
          <button
            onClick={() => onAnswer(sliderVal)}
            className="w-full mt-6 py-4 px-5 rounded-xl text-center font-bold text-white bg-[#243884] hover:bg-[#1E3A8A] transition-all active:scale-[0.98] shadow-md cursor-pointer"
          >
            Valider ce score
          </button>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {node.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              className={`w-full py-4 px-5 rounded-xl text-left font-medium 
                          transition-all active:scale-[0.98] cursor-pointer shadow-sm
                          ${severityStyles[option.severity] || 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {node.allow_note && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="text-xs text-gray-500 flex items-center gap-1 mb-2 font-medium">
            📝 Note (optionnel, quelques mots)
          </label>
          <input
            type="text"
            maxLength={120}
            value={note || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Ex: RAS, patient anxieux, refuse le test..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm
                       focus:ring-2 focus:ring-[#243884]/30 focus:border-[#243884] outline-none"
          />
        </div>
      )}
    </div>
  );
}
