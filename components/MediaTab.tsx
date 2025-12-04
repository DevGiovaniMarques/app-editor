import React, { useRef, useState, useCallback } from 'react';
import { ProjectState, MediaItem } from '../types';
import { Trash2, Folder, FileText, FolderOpen, Video, Image as ImageIcon, Loader2 } from 'lucide-react';

interface MediaTabProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const MediaTab: React.FC<MediaTabProps> = ({ project, setProject }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Helper to get video duration
  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => resolve(5); // Default to 5s if error
      video.src = url;
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    setLoadingFiles(true);
    const newItems: MediaItem[] = [];
    const defaultImageDuration = project.narrationSettings?.imageDuration || 5;

    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      let duration = defaultImageDuration; 

      if (isVideo) {
        try {
            duration = await getVideoDuration(url);
        } catch (e) {
            console.warn("Could not get video duration", e);
        }
      }

      newItems.push({
        id: crypto.randomUUID(),
        type: isVideo ? 'video' : 'image',
        url,
        name: file.name,
        duration: duration,
        effect: 'none',
        filter: 'none',
        transition: 'none',
        intensity: 2, // Default to 2
      });
    }

    setProject(prev => ({ ...prev, timeline: [...prev.timeline, ...newItems] }));
    setLoadingFiles(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

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

  const clearAll = () => {
    if (window.confirm("Tem certeza que deseja remover todas as mídias?")) {
        setProject(prev => ({ ...prev, timeline: [] }));
    }
  };

  const removeItem = (id: string) => {
    setProject(prev => ({
      ...prev,
      timeline: prev.timeline.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, updates: Partial<MediaItem>) => {
    setProject(prev => ({
      ...prev,
      timeline: prev.timeline.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Yellow Important Box */}
      <div className="bg-[#FFF9C4] border border-[#ffeeba] text-[#856404] px-4 py-3 rounded-md shadow-sm">
        <p className="font-bold text-sm">
           IMPORTANTE: Imagens (JPG, JPEG, PNG, WebP) e vídeos MP4 são aceitos!
        </p>
      </div>

      {/* Blue Instructions Box */}
      <div className="bg-[#001f3f]/60 border border-blue-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Como adicionar arquivos:
        </h3>
        <ul className="text-blue-200/80 text-sm space-y-1 list-none pl-1">
           <li className="flex gap-2">
               <span className="text-blue-500">•</span> Arraste arquivos diretamente do explorador para a área abaixo
           </li>
           <li className="flex gap-2">
               <span className="text-blue-500">•</span> Formatos aceitos: JPG, JPEG, PNG, WebP, MP4
           </li>
        </ul>
      </div>

      {/* Control Bar */}
      <div className="flex justify-between items-end">
         <div className="text-gray-400 text-sm space-y-1">
             <p>A ordem dos arquivos selecionados será mantida.</p>
             <p className={project.timeline.length > 0 ? "text-fuchsia-400 font-bold" : ""}>
                 {project.timeline.length === 0 ? "Nenhum arquivo selecionado." : `${project.timeline.length} arquivo(s) na timeline.`}
             </p>
         </div>
         <div className="flex gap-2">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-md transition-colors"
                title="Selecionar Arquivos"
             >
                 <FolderOpen className="w-5 h-5" />
             </button>
             <button 
                onClick={clearAll}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-md transition-colors"
                title="Limpar Tudo"
             >
                 <Trash2 className="w-5 h-5" />
             </button>
         </div>
      </div>
      
      <input
          type="file"
          accept="image/*,video/mp4,video/webm"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

      {/* Drop Zone */}
      <div 
         onDragOver={onDragOver}
         onDragLeave={onDragLeave}
         onDrop={onDrop}
         className={`
            relative h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 transition-all duration-200
            ${isDragging ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.01]' : 'border-gray-600 bg-gray-900/30 hover:border-gray-500'}
         `}
      >
         {loadingFiles ? (
             <div className="flex flex-col items-center text-fuchsia-400 animate-pulse">
                 <Loader2 className="w-8 h-8 animate-spin mb-2" />
                 <span>Processando arquivos...</span>
             </div>
         ) : (
             <>
                <Folder className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                <span className="text-gray-500 font-medium italic">Arraste arquivos de mídia aqui</span>
             </>
         )}
      </div>

      {/* Media Grid */}
      {project.timeline.length > 0 && (
          <div className="space-y-2 mt-8">
              <h3 className="text-white font-bold text-lg border-b border-gray-800 pb-2">Timeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.timeline.map((item, index) => (
                  <div key={item.id} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden group hover:border-fuchsia-500 transition relative">
                    <div className="aspect-video bg-black relative">
                      {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                      ) : (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      )}
                      
                      <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono">
                        #{index + 1}
                      </div>
                      {item.type === 'video' && (
                          <div className="absolute bottom-2 right-2 bg-black/60 p-1 rounded text-white">
                              <Video className="w-3 h-3" />
                          </div>
                      )}
                    </div>
                    
                    <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition shadow-lg z-10"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="p-3 space-y-2">
                        <div className="text-xs text-gray-400 truncate" title={item.name}>{item.name}</div>
                        
                        <div className="flex items-center justify-between gap-2">
                            <input 
                                type="number" 
                                value={item.duration}
                                step="0.5"
                                min={0.5}
                                onChange={(e) => updateItem(item.id, { duration: parseFloat(e.target.value) })}
                                className="bg-black border border-gray-700 rounded px-2 py-1 w-16 text-xs text-white text-center focus:border-fuchsia-500 outline-none"
                            />
                            <span className="text-xs text-gray-500">s</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default MediaTab;
