import React, { useRef, useState, useCallback } from 'react';
import { ProjectState, AudioTrack } from '../types';
import { Plus, Trash2, Mic, Music, Volume2, Info, Folder, FileAudio, Clock } from 'lucide-react';

interface AudioTabProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  type: 'narration' | 'music';
}

const AudioTab: React.FC<AudioTabProps> = ({ project, setProject, type }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const tracks = type === 'narration' ? project.narration : project.backgroundMusic;

  // Helper to get audio duration
  const getAudioDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        if(audio.duration === Infinity || isNaN(audio.duration)) {
             resolve(0);
        } else {
             resolve(audio.duration);
        }
      };
      audio.onerror = () => resolve(0);
      audio.src = url;
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    setCalculating(true);
    const newTracks: AudioTrack[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3')) {
          const url = URL.createObjectURL(file);
          const duration = await getAudioDuration(url);
          
          newTracks.push({
            id: crypto.randomUUID(),
            url,
            name: file.name,
            volume: type === 'music' ? 0.3 : 1.0,
            type: type,
            duration: duration
          });
      }
    }

    setProject(prev => ({
      ...prev,
      [type === 'narration' ? 'narration' : 'backgroundMusic']: [
           ...(type === 'narration' ? prev.narration : prev.backgroundMusic),
           ...newTracks
      ]
    }));
    setCalculating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeTrack = (id: string) => {
    setProject(prev => ({
        ...prev,
        [type === 'narration' ? 'narration' : 'backgroundMusic']: 
            (type === 'narration' ? prev.narration : prev.backgroundMusic).filter(t => t.id !== id)
      }));
  };

  const clearAll = () => {
     setProject(prev => ({
        ...prev,
        [type === 'narration' ? 'narration' : 'backgroundMusic']: []
     }));
  };

  // Drag and Drop
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  // Settings Logic for Narration
  const totalDuration = tracks.reduce((acc, curr) => acc + curr.duration, 0);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const updateSettings = (updates: Partial<typeof project.narrationSettings>) => {
      setProject(prev => ({
          ...prev,
          narrationSettings: { ...prev.narrationSettings, ...updates }
      }));
  };
  
  // -- RENDER FOR NARRATION TAB (Matching Screenshot) --
  if (type === 'narration') {
      return (
        <div className="p-6 space-y-6 animate-fadeIn max-w-4xl mx-auto">
             {/* Blue Info Box */}
            <div className="bg-[#001f3f]/60 border border-blue-800 rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-3 relative z-10">
                     <div className="mt-1">
                         <FileAudio className="w-5 h-5 text-blue-400" />
                     </div>
                     <div className="text-blue-200/80 text-sm space-y-1">
                         <p className="font-bold text-blue-400">Arraste arquivos MP3 diretamente do explorador para a área abaixo</p>
                         <p className="flex items-center gap-2"><span className="text-blue-500">•</span> Apenas arquivos MP3 são aceitos</p>
                         <p className="flex items-center gap-2"><span className="text-blue-500">•</span> A ordem dos arquivos será mantida</p>
                     </div>
                </div>
            </div>

            {/* Main Narration Files Box */}
            <fieldset className="border border-gray-700 rounded-lg p-0 bg-black overflow-hidden flex flex-col h-[400px]">
                <legend className="ml-4 px-2 text-gray-300 text-sm font-medium">Arquivos de Narração</legend>
                
                {/* Header Row */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/30">
                    <span className="text-gray-400 text-sm">
                        {tracks.length === 0 ? "Nenhum arquivo selecionado" : `${tracks.length} arquivo(s)`}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded shadow-lg transition-transform active:scale-95"
                            title="Adicionar áudio"
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={clearAll}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded shadow-lg transition-transform active:scale-95"
                            title="Limpar tudo"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <input
                        type="file"
                        accept="audio/mp3,audio/*"
                        multiple
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* List / Drop Zone */}
                <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#050505]"
                >
                    {tracks.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 pointer-events-none">
                            <Folder className="w-12 h-12 mb-2 text-yellow-600/50 fill-yellow-600/10" />
                            <span className="italic text-sm">Arraste arquivos MP3 aqui</span>
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {tracks.map((track, idx) => (
                                <div key={track.id} className="flex items-center justify-between bg-gray-900/80 p-3 rounded border border-gray-800 hover:border-blue-900/50 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-gray-800 p-2 rounded text-fuchsia-500 font-mono text-xs">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-200 truncate">{track.name}</p>
                                            <p className="text-xs text-gray-500">{formatTime(track.duration)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeTrack(track.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Visual hint for drop */}
                    {isDragging && (
                        <div className="absolute inset-0 bg-fuchsia-500/10 border-2 border-fuchsia-500 border-dashed m-2 rounded flex items-center justify-center z-20">
                            <p className="text-fuchsia-400 font-bold">Solte para adicionar</p>
                        </div>
                    )}
                </div>
            </fieldset>

            {/* Bottom Controls */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Clock className="w-4 h-4 text-fuchsia-400" />
                    <span>Duração total: <span className="text-white font-mono font-bold">{formatTime(totalDuration)}</span></span>
                </div>

                <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            checked={project.narrationSettings.autoSync}
                            onChange={(e) => updateSettings({ autoSync: e.target.checked })}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-600 bg-gray-900 transition-all checked:border-fuchsia-500 checked:bg-fuchsia-600 hover:border-gray-500"
                        />
                         <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </div>
                    <span>🤖 Calcular automaticamente o tempo de exibição de cada mídia.</span>
                </label>

                <fieldset className="border border-gray-700 rounded-lg p-4 bg-black/50" disabled={project.narrationSettings.autoSync}>
                    <legend className="text-gray-400 text-sm px-2">Tempo de cada Imagem</legend>
                    <div className="flex items-center gap-4">
                        <label className="text-gray-300 text-sm">Duração por imagem:</label>
                        <div className="flex items-center bg-[#111] border border-gray-700 rounded overflow-hidden w-32 focus-within:border-fuchsia-500 transition-colors">
                            <input 
                                type="number" 
                                min="0.5"
                                step="0.5"
                                value={project.narrationSettings.imageDuration}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    updateSettings({ imageDuration: val });
                                    // If not auto-syncing, update all existing images immediately to this value
                                    if (!project.narrationSettings.autoSync) {
                                        setProject(prev => ({
                                            ...prev,
                                            timeline: prev.timeline.map(t => 
                                                t.type === 'image' ? { ...t, duration: val } : t
                                            )
                                        }));
                                    }
                                }}
                                className="bg-transparent text-white text-sm px-3 py-2 w-full outline-none text-right disabled:opacity-50"
                            />
                            <div className="bg-gray-800 px-3 py-2 text-xs text-gray-400 border-l border-gray-700">
                                seg
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
      );
  }

  // -- DEFAULT RENDER FOR MUSIC TAB (Simpler) --
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="text-fuchsia-500"/> Música de Fundo
        </h2>
        
        <div className="flex gap-2">
            <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold border border-gray-600"
            >
            <Plus className="w-4 h-4" /> Upload
            </button>
            <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            />
        </div>
      </div>

      <div className="space-y-3">
          {tracks.map(track => (
              <div key={track.id} className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-fuchsia-500">
                          <Volume2 className="w-5 h-5"/>
                      </div>
                      <div>
                          <p className="font-medium text-gray-200">{track.name}</p>
                          <p className="text-xs text-gray-500">Volume: {Math.round(track.volume * 100)}%</p>
                      </div>
                  </div>
                  <button onClick={() => removeTrack(track.id)} className="text-gray-500 hover:text-red-500">
                      <Trash2 className="w-5 h-5"/>
                  </button>
              </div>
          ))}
          {tracks.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhuma música adicionada.</p>
          )}
      </div>
    </div>
  );
};

export default AudioTab;