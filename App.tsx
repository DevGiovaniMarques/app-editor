import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MediaTab from './components/MediaTab';
import AudioTab from './components/AudioTab';
import PreviewPlayer from './components/PreviewPlayer';
import IdentityTab from './components/IdentityTab';
import EffectsTab from './components/EffectsTab';
import { Tab, ProjectState } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.START);
  const [project, setProject] = useState<ProjectState>({
    timeline: [],
    narration: [],
    backgroundMusic: [],
    narrationSettings: {
      autoSync: false,
      imageDuration: 5
    },
    visualIdentity: {
      logoUrl: null,
      enabled: false,
      position: 'top-left',
      size: 15,
      opacity: 80,
      margin: 5
    }
  });

  // Global Auto-Sync Logic
  useEffect(() => {
    const { autoSync } = project.narrationSettings;
    
    // Only run if autoSync is enabled
    if (autoSync) {
       const totalNarrationTime = project.narration.reduce((acc, t) => acc + t.duration, 0);
       const imageItems = project.timeline.filter(t => t.type === 'image');
       const videoItems = project.timeline.filter(t => t.type === 'video');
       
       const totalVideoDuration = videoItems.reduce((acc, t) => acc + t.duration, 0);
       const remainingTimeForImages = Math.max(0, totalNarrationTime - totalVideoDuration);

       const imageCount = imageItems.length;
       
       // Calculate new duration if we have images and audio (even if remaining time is 0, we set to minimum)
       if (imageCount > 0 && totalNarrationTime > 0) {
           let durationPerImage = remainingTimeForImages / imageCount;
           
           // Minimum duration safety
           if (durationPerImage < 0.5) durationPerImage = 0.5;

           // Update settings state so UI reflects calculated value
           setProject(prev => {
               // Only update if value changed significantly to avoid loops
               if (Math.abs(prev.narrationSettings.imageDuration - durationPerImage) > 0.01) {
                   return {
                       ...prev,
                       narrationSettings: { ...prev.narrationSettings, imageDuration: parseFloat(durationPerImage.toFixed(2)) },
                       timeline: prev.timeline.map(t => 
                           t.type === 'image' ? { ...t, duration: durationPerImage } : t
                       )
                   };
               }
               return prev;
           });
       }
    }
  }, [
      project.narrationSettings.autoSync,
      project.narration.length, 
      project.narration.reduce((acc, t) => acc + t.duration, 0),
      project.timeline.length,
      project.timeline.reduce((acc, t) => acc + t.duration, 0)
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.START:
        return <Dashboard />;
      case Tab.MEDIA:
        return <MediaTab project={project} setProject={setProject} />;
      case Tab.EFFECTS:
        return <EffectsTab project={project} setProject={setProject} />;
      case Tab.NARRATION:
        return <AudioTab project={project} setProject={setProject} type="narration" />;
      case Tab.MUSIC:
        return <AudioTab project={project} setProject={setProject} type="music" />;
      case Tab.IDENTITY:
        return <IdentityTab project={project} setProject={setProject} />;
      case Tab.EXPORT:
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <h2 className="text-2xl font-bold text-white mb-6">Preview & Export</h2>
                <PreviewPlayer project={project} isExportMode={true} />
            </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar / Preview Area for editing context (optional, but good for UX) */}
        {(activeTab === Tab.MEDIA || activeTab === Tab.NARRATION || activeTab === Tab.MUSIC || activeTab === Tab.IDENTITY) && (
            <div className="w-full bg-gray-900/50 border-b border-gray-800 p-4 flex justify-center shrink-0">
                <div className="w-[480px]"> 
                    {/* Small preview while editing */}
                   <PreviewPlayer project={project} />
                </div>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-fuchsia-900 scrollbar-track-transparent">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;