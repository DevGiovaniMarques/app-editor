import React, { useState, useEffect } from 'react';
import { ProjectState, MediaItem } from '../types';
import { Wand2, Film, Layers } from 'lucide-react';

interface EffectsTabProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const EffectsTab: React.FC<EffectsTabProps> = ({ project, setProject }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first item if none selected and items exist
  useEffect(() => {
    if (!selectedId && project.timeline.length > 0) {
      setSelectedId(project.timeline[0].id);
    }
  }, [project.timeline.length, selectedId]);

  const selectedItem = project.timeline.find(item => item.id === selectedId);

  // CHANGED: Updates applied to ALL items in the timeline
  const updateAllItems = (updates: Partial<MediaItem>) => {
    setProject(prev => ({
      ...prev,
      timeline: prev.timeline.map(item => ({ ...item, ...updates }))
    }));
  };

  if (project.timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fadeIn">
        <Layers className="w-16 h-16 mb-4 opacity-20" />
        <p>Adicione mídias na aba "Mídias" para editar efeitos.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full animate-fadeIn">
      {/* Sidebar List of Items */}
      <div className="w-72 border-r border-gray-800 bg-black flex flex-col">
        <div className="p-4 border-b border-gray-800">
           <h3 className="text-gray-400 font-bold text-xs uppercase flex items-center gap-2">
              <Film className="w-3 h-3" /> Selecionar Mídia (Preview)
           </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {project.timeline.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors border text-left ${
                selectedId === item.id 
                  ? 'bg-gray-800 border-fuchsia-600' 
                  : 'bg-transparent border-transparent hover:bg-gray-900'
              }`}
            >
              <div className="w-16 h-10 bg-gray-900 rounded overflow-hidden flex-shrink-0 relative border border-gray-700">
                 {item.type === 'video' ? (
                     <video src={item.url} className="w-full h-full object-cover" />
                 ) : (
                     <img src={item.url} alt="" className="w-full h-full object-cover" />
                 )}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-[10px] font-bold text-white shadow-sm">#{index + 1}</span>
                 </div>
              </div>
              <div className="min-w-0">
                <p className={`text-xs truncate font-medium ${selectedId === item.id ? 'text-white' : 'text-gray-400'}`}>
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-600 truncate">
                   {item.effect !== 'none' ? '✨ Com Efeito' : 'Sem Efeito'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 p-8 bg-black overflow-y-auto">
        {selectedItem ? (
          <div className="max-w-2xl mx-auto">
             <div className="mb-2 flex items-center gap-2">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Visualizando:</span>
                <span className="text-fuchsia-400 text-sm font-bold">{selectedItem.name}</span>
             </div>
             
             <div className="mb-4 text-xs text-blue-400 bg-blue-900/20 border border-blue-900 p-2 rounded">
                ℹ️ As alterações abaixo serão aplicadas a <b>todos</b> os arquivos do projeto.
             </div>

             {/* Main Card mimicking the screenshot */}
             <fieldset className="border border-gray-700 rounded-lg p-6 bg-black relative mt-4">
                 <legend className="text-gray-300 text-sm font-medium px-2">Efeitos Globais</legend>
                 
                 <div className="space-y-6 mt-2">
                     {/* Zoom Effect */}
                     <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                         <label className="text-gray-400 text-sm">Efeito de Zoom:</label>
                         <select
                            value={selectedItem.effect}
                            onChange={(e) => updateAllItems({ effect: e.target.value as any })}
                            className="w-full bg-[#111] border border-gray-600 text-gray-300 text-sm rounded px-3 py-2 outline-none focus:border-fuchsia-500 transition-colors"
                         >
                             <option value="none">Nenhum</option>
                             <option value="zoom-in">Zoom In Constant</option>
                             <option value="zoom-out">Zoom Out Constant</option>
                             <option value="zoom-alternating">Zoom In/Out Alternado (recomendado)</option>
                         </select>
                     </div>

                     {/* Color Filter */}
                     <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                         <label className="text-gray-400 text-sm">Filtro de Cor:</label>
                         <select
                            value={selectedItem.filter || 'none'}
                            onChange={(e) => updateAllItems({ filter: e.target.value as any })}
                            className="w-full bg-[#111] border border-gray-600 text-gray-300 text-sm rounded px-3 py-2 outline-none focus:border-fuchsia-500 transition-colors"
                         >
                             <option value="none">Nenhum</option>
                             <option value="grayscale">Preto e Branco</option>
                             <option value="sepia">Sépia</option>
                             <option value="invert">Invertido</option>
                             <option value="warm">Quente</option>
                             <option value="cool">Frio</option>
                         </select>
                     </div>

                     {/* Preview Box */}
                     <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                         <label className="text-gray-400 text-sm pt-2">Preview:</label>
                         <div className="border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-sm overflow-hidden bg-black w-64 aspect-video relative">
                             {selectedItem.type === 'video' ? (
                                 <video 
                                    src={selectedItem.url} 
                                    className="w-full h-full object-cover" 
                                    style={{
                                        filter: selectedItem.filter === 'grayscale' ? 'grayscale(100%)' :
                                                selectedItem.filter === 'sepia' ? 'sepia(100%)' :
                                                selectedItem.filter === 'invert' ? 'invert(100%)' :
                                                selectedItem.filter === 'warm' ? 'sepia(50%) hue-rotate(-30deg) saturate(140%)' :
                                                selectedItem.filter === 'cool' ? 'hue-rotate(180deg) saturate(80%)' : 'none'
                                    }}
                                 />
                             ) : (
                                 <img 
                                    src={selectedItem.url} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: selectedItem.filter === 'grayscale' ? 'grayscale(100%)' :
                                                selectedItem.filter === 'sepia' ? 'sepia(100%)' :
                                                selectedItem.filter === 'invert' ? 'invert(100%)' :
                                                selectedItem.filter === 'warm' ? 'sepia(50%) hue-rotate(-30deg) saturate(140%)' :
                                                selectedItem.filter === 'cool' ? 'hue-rotate(180deg) saturate(80%)' : 'none'
                                    }}
                                 />
                             )}
                         </div>
                     </div>

                     {/* Intensity Slider */}
                     <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                         <label className="text-gray-400 text-sm">Intensidade:</label>
                         <div className="flex items-center gap-4">
                             <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={selectedItem.intensity || 1}
                                onChange={(e) => updateAllItems({ intensity: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                             />
                             <span className="text-gray-300 text-sm font-mono w-6 text-right">{selectedItem.intensity || 1}</span>
                         </div>
                     </div>

                     {/* Transitions */}
                     <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                         <label className="text-gray-400 text-sm">Transições:</label>
                         <select
                            value={selectedItem.transition || 'none'}
                            onChange={(e) => updateAllItems({ transition: e.target.value as any })}
                            className="w-full bg-[#111] border border-gray-600 text-gray-300 text-sm rounded px-3 py-2 outline-none focus:border-fuchsia-500 transition-colors"
                         >
                             <option value="none">Nenhum</option>
                             <option value="fade">Fade (recomendado)</option>
                         </select>
                     </div>
                 </div>
             </fieldset>
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <Wand2 className="w-12 h-12 mb-4 opacity-50"/>
                <p>Selecione um item da lista à esquerda para editar</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default EffectsTab;