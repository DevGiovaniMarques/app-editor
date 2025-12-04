import React, { useState } from 'react';
import { ProjectState, MediaItem } from '../types';
import { Bot, Image as ImageIcon, Loader, Download } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface GenTabProps {
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const GenTab: React.FC<GenTabProps> = ({ setProject }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const result = await generateImage(prompt);
    if (result) {
        setGeneratedImage(result);
    }
    setLoading(false);
  };

  const addToProject = () => {
    if (generatedImage) {
        const newItem: MediaItem = {
            id: crypto.randomUUID(),
            type: 'image',
            url: generatedImage,
            name: `AI: ${prompt.slice(0, 10)}...`,
            duration: 3,
            effect: 'none',
            filter: 'none',
            transition: 'none',
            intensity: 1
        };
        setProject(prev => ({...prev, timeline: [...prev.timeline, newItem]}));
        setGeneratedImage(null);
        setPrompt('');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
       <div className="text-center space-y-2">
           <Bot className="w-12 h-12 text-fuchsia-500 mx-auto" />
           <h2 className="text-2xl font-bold text-white">Gerador de Imagens IA</h2>
           <p className="text-gray-400">Crie imagens exclusivas para seu vídeo usando Gemini 3 Pro</p>
       </div>

       <div className="space-y-4">
           <textarea
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="Descreva a imagem que você quer (ex: um gato cyberpunk andando de skate neon)"
             className="w-full h-32 bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-fuchsia-500 focus:outline-none resize-none"
           />
           
           <button
             onClick={handleGenerate}
             disabled={loading || !prompt}
             className="w-full bg-gradient-to-r from-fuchsia-700 to-purple-600 hover:from-fuchsia-600 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
           >
              {loading ? <Loader className="animate-spin" /> : <Wand2Icon />}
              {loading ? 'Gerando...' : 'Gerar Imagem'}
           </button>
       </div>

       {generatedImage && (
           <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 animate-fadeIn">
               <img src={generatedImage} alt="Generated" className="w-full rounded-lg mb-4" />
               <button
                 onClick={addToProject}
                 className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
               >
                   <Download className="w-4 h-4"/> Adicionar ao Projeto
               </button>
           </div>
       )}
    </div>
  );
};

const Wand2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
)

export default GenTab;