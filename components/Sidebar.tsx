import React from 'react';
import { Tab } from '../types';
import { 
  Home, 
  Wand2, 
  Mic, 
  Music, 
  Film, 
  Settings,
  Layers,
  Stamp
} from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  
  const menuItems = [
    { id: Tab.START, label: 'INICIE AQUI', icon: Home, highlight: true },
    { id: Tab.MEDIA, label: 'MÍDIAS', icon: Layers, highlight: true },
    { id: Tab.EFFECTS, label: 'EFEITOS BÁSICOS', icon: Wand2 },
    { id: Tab.NARRATION, label: 'NARRAÇÕES', icon: Mic },
    { id: Tab.MUSIC, label: 'MÚSICA DE FUNDO', icon: Music },
    { id: Tab.IDENTITY, label: 'IDENTIDADE VISUAL', icon: Stamp },
    { id: Tab.EXPORT, label: 'EXPORTAR VÍDEO', icon: Film },
  ];

  return (
    <div className="w-64 bg-black border-r border-gray-800 h-full flex flex-col p-4">
      <div className="mb-8 text-fuchsia-500 font-bold text-2xl tracking-tighter flex items-center gap-2">
         <Film className="w-8 h-8" />
         NeonCutt
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const isHighlight = item.highlight;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
                ${isHighlight && isActive ? 'bg-fuchsia-600 text-white font-bold skew-x-[-10deg]' : ''}
                ${isHighlight && !isActive ? 'bg-fuchsia-900/30 text-fuchsia-400 font-semibold skew-x-[-10deg] hover:bg-fuchsia-900/50' : ''}
                ${!isHighlight && isActive ? 'text-fuchsia-400 font-bold' : ''}
                ${!isHighlight && !isActive ? 'text-gray-400 hover:text-white hover:pl-6' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 ${isHighlight && isActive ? 'text-white' : ''}`} />
              <span className={isHighlight ? 'skew-x-[10deg]' : ''}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <div className="text-xs text-gray-500 flex items-center gap-2">
           <Settings className="w-4 h-4" /> v1.0.1 (Beta)
        </div>
      </div>
    </div>
  );
};

export default Sidebar;