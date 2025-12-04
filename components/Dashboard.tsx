import React from 'react';
import { Cpu, HelpCircle, Lightbulb, Monitor } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-2 flex items-center gap-2">
           <Monitor className="text-blue-500" /> Editor de Vídeo
        </h1>
        <p className="text-gray-400">Crie vídeos incríveis com facilidade! ✨</p>
      </header>

      {/* System Info Card */}
      <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
        <h2 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" /> Sistema
        </h2>
        <div className="space-y-3 text-gray-400 text-sm">
           <div className="flex items-center gap-3">
              <span className="text-pink-500">🚀</span> GPU: WebGL Enabled
           </div>
           <div className="flex items-center gap-3">
              <span className="text-pink-500">🧠</span> Browser: {navigator.userAgent.split(')')[0]})
           </div>
           <div className="flex items-center gap-3">
              <span className="text-pink-500">💾</span> Memória Local: Disponível
           </div>
        </div>
      </div>

      {/* How To Use Card */}
      <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
        <h2 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gray-300" /> Como Usar
        </h2>
        <div className="space-y-3 text-gray-400 text-sm">
           <div className="flex items-center gap-2">
              <span>🎨 1. Adicione mídias na aba <span className="text-fuchsia-400">Mídias</span></span>
           </div>
           <div className="flex items-center gap-2">
              <span>🎤 2. Adicione narração em <span className="text-fuchsia-400">Narrações</span></span>
           </div>
           <div className="flex items-center gap-2">
              <span>🎵 3. Escolha música em <span className="text-fuchsia-400">Música de Fundo</span></span>
           </div>
           <div className="flex items-center gap-2">
              <span>✨ 4. Aplique efeitos (Zoom) em <span className="text-fuchsia-400">Efeitos</span> ou <span className="text-fuchsia-400">Mídias</span></span>
           </div>
           <div className="flex items-center gap-2">
              <span>🎬 5. Renderize em <span className="text-fuchsia-400">Exportar Vídeo</span></span>
           </div>
        </div>
      </div>

       {/* Tips Card */}
       <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
        <h2 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" /> Dicas
        </h2>
        <div className="space-y-3 text-gray-400 text-sm">
           <div className="flex items-center gap-2">
              <span className="text-orange-400">⚡</span> Use imagens 16:9 para melhor resultado
           </div>
           <div className="flex items-center gap-2">
              <span className="text-pink-400">🎯</span> Use a IA para gerar narrações realistas
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
