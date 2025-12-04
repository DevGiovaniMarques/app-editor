import React, { useRef, useState } from 'react';
import { ProjectState } from '../types';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';

interface IdentityTabProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const IdentityTab: React.FC<IdentityTabProps> = ({ project, setProject }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const settings = project.visualIdentity;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      updateSettings({ logoUrl: url, enabled: true });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        updateSettings({ logoUrl: url, enabled: true });
      }
    }
  };

  const updateSettings = (updates: Partial<typeof settings>) => {
    setProject(prev => ({
      ...prev,
      visualIdentity: { ...prev.visualIdentity, ...updates }
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Upload Area */}
      <div className="space-y-2">
        <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
                border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer transition-colors
                ${isDragging ? 'border-fuchsia-500 bg-fuchsia-900/20' : 'border-gray-600 hover:border-gray-400 bg-black'}
            `}
        >
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
            />
            <div className="flex flex-col items-center text-gray-400">
                 {settings.logoUrl ? (
                     <img src={settings.logoUrl} alt="Logo" className="h-20 object-contain" />
                 ) : (
                     <>
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">Arraste uma imagem de logo aqui</span>
                        <span className="text-xs text-gray-600">(PNG recomendado)</span>
                     </>
                 )}
            </div>
        </div>

        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 italic">
                {settings.logoUrl ? 'Imagem carregada.' : 'Nenhuma imagem selecionada'}
            </span>
            <div className="flex gap-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow"
                >
                    <Upload className="w-4 h-4" />
                </button>
                {settings.logoUrl && (
                    <button 
                        onClick={() => updateSettings({ logoUrl: null, enabled: false })}
                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded shadow"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
               <input 
                   type="checkbox" 
                   checked={settings.enabled}
                   onChange={(e) => updateSettings({ enabled: e.target.checked })}
                   className="w-5 h-5 rounded border-gray-600 bg-gray-900 checked:bg-fuchsia-600"
               />
               <span className="text-gray-200 font-medium">Usar logo no vídeo</span>
          </label>

          <fieldset className={`border border-gray-700 rounded-lg p-6 bg-black space-y-6 transition-opacity ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <legend className="text-gray-300 px-2 text-sm font-medium">Configurações de Exibição</legend>

              {/* Position */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-gray-400 text-sm">Posição:</label>
                  <select 
                      value={settings.position}
                      onChange={(e) => updateSettings({ position: e.target.value as any })}
                      className="bg-[#111] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-fuchsia-500 outline-none"
                  >
                      <option value="top-left">Canto Superior Esquerdo</option>
                      <option value="top-right">Canto Superior Direito</option>
                      <option value="bottom-left">Canto Inferior Esquerdo</option>
                      <option value="bottom-right">Canto Inferior Direito</option>
                  </select>
              </div>

              {/* Size */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-gray-400 text-sm">Tamanho:</label>
                  <div className="flex items-center gap-4">
                      <input 
                          type="range" 
                          min="5" 
                          max="50" 
                          value={settings.size}
                          onChange={(e) => updateSettings({ size: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-gray-400 text-xs w-8 text-right">{settings.size}%</span>
                  </div>
              </div>

              {/* Opacity */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-gray-400 text-sm">Opacidade:</label>
                  <div className="flex items-center gap-4">
                      <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={settings.opacity}
                          onChange={(e) => updateSettings({ opacity: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-gray-400 text-xs w-8 text-right">{settings.opacity}%</span>
                  </div>
              </div>

              {/* Margin */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-gray-400 text-sm">Distância da Borda:</label>
                  <div className="flex items-center gap-4">
                      <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          value={settings.margin}
                          onChange={(e) => updateSettings({ margin: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-gray-400 text-xs w-8 text-right">{settings.margin}%</span>
                  </div>
              </div>
          </fieldset>
      </div>

      {/* Mini Preview Box */}
      <div className="border border-gray-700 rounded-lg p-4 bg-black/50">
          <label className="text-gray-400 text-sm mb-2 block">Preview</label>
          <div className="w-full max-w-sm mx-auto aspect-video bg-gray-800 relative overflow-hidden flex items-center justify-center border border-gray-600">
               <span className="text-gray-600 text-xs">Prévia ...</span>
               {settings.logoUrl && settings.enabled && (
                   <img 
                       src={settings.logoUrl} 
                       alt="Watermark"
                       className="absolute object-contain"
                       style={{
                           width: `${settings.size}%`,
                           opacity: settings.opacity / 100,
                           top: settings.position.includes('top') ? `${settings.margin}%` : 'auto',
                           bottom: settings.position.includes('bottom') ? `${settings.margin}%` : 'auto',
                           left: settings.position.includes('left') ? `${settings.margin}%` : 'auto',
                           right: settings.position.includes('right') ? `${settings.margin}%` : 'auto',
                       }}
                   />
               )}
          </div>
      </div>
    </div>
  );
};

export default IdentityTab;