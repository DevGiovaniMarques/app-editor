import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectState, MediaItem } from '../types';
import { Play, Pause, Download, RotateCcw, Loader2, CheckCircle } from 'lucide-react';

interface PreviewPlayerProps {
  project: ProjectState;
  isExportMode?: boolean;
}

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;

const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ project, isExportMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const requestRef = useRef<number>();
  
  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Media Cache
  const mediaElementsRef = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map());
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

  // Export Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Load Logo
  useEffect(() => {
      if (project.visualIdentity?.logoUrl) {
          const img = new Image();
          img.src = project.visualIdentity.logoUrl;
          img.onload = () => { logoImageRef.current = img; };
      } else {
          logoImageRef.current = null;
      }
  }, [project.visualIdentity?.logoUrl]);

  // Preload Media (Images & Videos)
  useEffect(() => {
    let duration = 0;
    project.timeline.forEach(item => {
      duration += item.duration;
      if (!mediaElementsRef.current.has(item.id)) {
        if (item.type === 'video') {
            const vid = document.createElement('video');
            vid.src = item.url;
            vid.muted = true; // Mute for preview mix
            vid.crossOrigin = "anonymous";
            vid.load();
            mediaElementsRef.current.set(item.id, vid);
        } else {
            const img = new Image();
            img.src = item.url;
            mediaElementsRef.current.set(item.id, img);
        }
      }
    });
    setTotalDuration(duration);
  }, [project.timeline]);

  // Init Audio Context & Preload Audio
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      const loadBuffer = async (url: string, id: string) => {
         try {
            const resp = await fetch(url);
            const arrayBuffer = await resp.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            audioBuffersRef.current.set(id, audioBuffer);
         } catch (e) {
             console.error("Failed to load audio", url, e);
         }
      };

      const allTracks = [...project.narration, ...project.backgroundMusic];
      await Promise.all(allTracks.map(track => {
          if (!audioBuffersRef.current.has(track.id)) {
              return loadBuffer(track.url, track.id);
          }
          return Promise.resolve();
      }));
    };
    initAudio();
  }, [project.narration, project.backgroundMusic]);


  const playAudio = useCallback((time: number, isExportingMode: boolean = false) => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;

      // Stop existing
      sourceNodesRef.current.forEach(node => {
          try { node.stop(); } catch(e) {}
      });
      sourceNodesRef.current.clear();

      // Play tracks
      [...project.narration, ...project.backgroundMusic].forEach(track => {
          const buffer = audioBuffersRef.current.get(track.id);
          if (buffer) {
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              
              const gain = ctx.createGain();
              gain.gain.value = track.volume;
              
              source.connect(gain);
              
              // If exporting, route to stream destination for recording
              if (isExportingMode && streamDestRef.current) {
                  gain.connect(streamDestRef.current);
              } else {
                  gain.connect(ctx.destination);
              }

              if (track.type === 'music') {
                  source.loop = true;
                  const offset = time % buffer.duration;
                  source.start(0, offset);
              } else {
                  if (time < buffer.duration) {
                      source.start(0, time);
                  }
              }
              sourceNodesRef.current.set(track.id, source);
          }
      });
  }, [project]);

  const stopAudio = useCallback(() => {
     sourceNodesRef.current.forEach(node => {
         try { node.stop(); } catch(e) {}
     });
     sourceNodesRef.current.clear();
  }, []);

  const drawFrame = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    let timeAccumulator = 0;
    let currentItem: MediaItem | null = null;
    let itemIndex = 0;
    let itemStartTime = 0;

    for (let i = 0; i < project.timeline.length; i++) {
      const item = project.timeline[i];
      if (time >= timeAccumulator && time < timeAccumulator + item.duration) {
        currentItem = item;
        itemStartTime = timeAccumulator;
        itemIndex = i;
        break;
      }
      timeAccumulator += item.duration;
    }

    // DRAW MEDIA
    if (currentItem) {
      const mediaEl = mediaElementsRef.current.get(currentItem.id);
      
      if (mediaEl) {
        const itemElapsed = time - itemStartTime;
        
        // Video seeking
        if (currentItem.type === 'video' && mediaEl instanceof HTMLVideoElement) {
             if (Math.abs(mediaEl.currentTime - itemElapsed) > 0.3) {
                 mediaEl.currentTime = itemElapsed;
             }
        }

        const progress = itemElapsed / currentItem.duration; // 0 to 1
        const intensity = currentItem.intensity || 1;
        const zoomSpeed = 0.2 * intensity;

        // Determine zoom direction
        let zoomType = currentItem.effect;
        if (zoomType === 'zoom-alternating') {
            zoomType = itemIndex % 2 === 0 ? 'zoom-in' : 'zoom-out';
        }

        let scale = 1;
        if (zoomType === 'zoom-in') {
          scale = 1 + (progress * zoomSpeed); 
        } else if (zoomType === 'zoom-out') {
          scale = (1 + zoomSpeed) - (progress * zoomSpeed); 
        }

        // Apply Filters
        const filterMap: Record<string, string> = {
            'grayscale': 'grayscale(100%)',
            'sepia': 'sepia(100%)',
            'invert': 'invert(100%)',
            'warm': 'sepia(50%) hue-rotate(-30deg) saturate(140%)',
            'cool': 'hue-rotate(180deg) saturate(80%)',
            'none': 'none'
        };
        ctx.filter = filterMap[currentItem.filter || 'none'] || 'none';

        // Apply Transition (Fade)
        if (currentItem.transition === 'fade') {
            const fadeDuration = 0.5; // seconds
            if (itemElapsed < fadeDuration) {
                // Fade In
                ctx.globalAlpha = itemElapsed / fadeDuration;
            } else if (itemElapsed > currentItem.duration - fadeDuration) {
                // Fade Out
                ctx.globalAlpha = (currentItem.duration - itemElapsed) / fadeDuration;
            } else {
                ctx.globalAlpha = 1;
            }
        } else {
            ctx.globalAlpha = 1;
        }

        // Draw with scale
        const w = WIDTH * scale;
        const h = HEIGHT * scale;
        const x = (WIDTH - w) / 2;
        const y = (HEIGHT - h) / 2;

        if (mediaEl instanceof HTMLVideoElement && mediaEl.readyState >= 2) {
             ctx.drawImage(mediaEl, x, y, w, h);
        } else if (mediaEl instanceof HTMLImageElement && mediaEl.complete) {
             ctx.drawImage(mediaEl, x, y, w, h);
        }
      }
    } else if (time >= totalDuration && totalDuration > 0) {
         ctx.fillStyle = '#111';
         ctx.fillRect(0, 0, WIDTH, HEIGHT);
         ctx.font = '40px sans-serif';
         ctx.fillStyle = '#fff';
         ctx.textAlign = 'center';
         ctx.fillText('Fim', WIDTH/2, HEIGHT/2);
    }

    // DRAW WATERMARK (Visual Identity)
    const { visualIdentity } = project;
    if (visualIdentity?.enabled && visualIdentity.logoUrl && logoImageRef.current) {
        ctx.globalAlpha = visualIdentity.opacity / 100;
        ctx.filter = 'none'; // Ensure logo is not affected by video filters
        
        const logo = logoImageRef.current;
        const aspectRatio = logo.width / logo.height;
        
        // Calculate size based on percentage of video width
        const logoWidth = (WIDTH * visualIdentity.size) / 100;
        const logoHeight = logoWidth / aspectRatio;
        
        const marginX = (WIDTH * visualIdentity.margin) / 100;
        const marginY = (HEIGHT * visualIdentity.margin) / 100;
        
        let lx = 0;
        let ly = 0;
        
        switch (visualIdentity.position) {
            case 'top-left':
                lx = marginX;
                ly = marginY;
                break;
            case 'top-right':
                lx = WIDTH - logoWidth - marginX;
                ly = marginY;
                break;
            case 'bottom-left':
                lx = marginX;
                ly = HEIGHT - logoHeight - marginY;
                break;
            case 'bottom-right':
                lx = WIDTH - logoWidth - marginX;
                ly = HEIGHT - logoHeight - marginY;
                break;
        }
        
        ctx.drawImage(logo, lx, ly, logoWidth, logoHeight);
    }

  }, [project.timeline, totalDuration, project.visualIdentity]);

  // Handle Export Completion
  const finishExport = useCallback(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
      }
      stopAudio();
      setIsPlaying(false);
      setIsExporting(false);
      setExportProgress(100);
      setCurrentTime(0);
  }, [stopAudio]);

  const animate = useCallback((timestamp: number) => {
    if (!isPlaying) return;

    setCurrentTime(prev => {
        const next = prev + (1 / FPS);
        
        // Update export progress
        if (isExporting && totalDuration > 0) {
            setExportProgress(Math.min(99, Math.round((next / totalDuration) * 100)));
        }

        if (next >= totalDuration + 1) { 
             if (isExporting) {
                 finishExport();
             } else {
                 setIsPlaying(false);
                 stopAudio();
             }
             return 0; 
        }
        return next;
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, totalDuration, stopAudio, isExporting, finishExport]);

  useEffect(() => {
     drawFrame(currentTime);
  }, [currentTime, drawFrame]);

  useEffect(() => {
    if (isPlaying) {
      // Pass isExporting flag to route audio correctly
      playAudio(currentTime, isExporting);
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (!isExporting) { // Don't stop audio if we are just setting up export
          stopAudio();
          cancelAnimationFrame(requestRef.current!);
      }
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, animate, isExporting]); // Added isExporting dependency

  // Export Logic
  const startExport = async () => {
      if (!canvasRef.current || !audioContextRef.current) return;
      
      // 1. Setup Recording
      const canvasStream = canvasRef.current.captureStream(30);
      const ctx = audioContextRef.current;
      streamDestRef.current = ctx.createMediaStreamDestination();
      
      const tracks = [
          ...canvasStream.getVideoTracks(),
          ...streamDestRef.current.stream.getAudioTracks()
      ];
      const combinedStream = new MediaStream(tracks);

      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
              recordedChunksRef.current.push(e.data);
          }
      };

      mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `neon-cutt-export-${Date.now()}.webm`;
          a.click();
      };

      // 2. Start "Hidden" Playback
      setIsExporting(true);
      setExportProgress(0);
      setCurrentTime(0);
      
      // Small delay to ensure state updates before starting
      setTimeout(() => {
          mediaRecorderRef.current?.start();
          setIsPlaying(true);
      }, 100);
  };

  const handleTogglePlay = () => {
      if(currentTime >= totalDuration) setCurrentTime(0);
      setIsPlaying(!isPlaying);
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full max-w-4xl h-auto block"
          style={{ aspectRatio: '16/9' }}
        />
        
        {/* Play Icon Overlay (Normal Mode) */}
        {!isPlaying && !isExportMode && !isExporting && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                 <Play className="w-16 h-16 text-white/80" fill="currentColor" />
             </div>
        )}

        {/* Export Overlay (Hidden Playback) */}
        {isExporting && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-16 h-16 text-fuchsia-500 animate-spin" />
                <div className="text-white font-bold text-xl tracking-wider">RENDERIZANDO VÍDEO</div>
                <div className="w-1/2 bg-gray-800 h-4 rounded-full overflow-hidden border border-gray-700">
                    <div 
                        className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 transition-all duration-100 ease-linear"
                        style={{ width: `${exportProgress}%` }}
                    />
                </div>
                <div className="text-gray-400 font-mono">{exportProgress}%</div>
            </div>
        )}
      </div>

      <div className="flex items-center gap-6 bg-gray-900 p-4 rounded-full border border-gray-700 w-full max-w-2xl justify-center shadow-lg shadow-fuchsia-900/10">
        <button
          onClick={() => {
              setCurrentTime(0);
              drawFrame(0);
              if(isPlaying) stopAudio();
              setIsPlaying(false);
          }}
          disabled={isExporting}
          className="p-2 hover:bg-gray-700 rounded-full text-gray-300 transition disabled:opacity-50"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleTogglePlay}
          disabled={isExporting}
          className="p-4 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-full text-white shadow-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
        </button>

        <div className="text-mono text-fuchsia-400 font-bold min-w-[100px] text-center">
            {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </div>

        {isExportMode && (
             <button
                onClick={startExport}
                disabled={isPlaying || isExporting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full font-bold transition shadow-lg"
             >
                <Download className="w-4 h-4" />
                {isExporting ? 'Processando...' : 'Exportar'}
             </button>
        )}
      </div>
    </div>
  );
};

export default PreviewPlayer;