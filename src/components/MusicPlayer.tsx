import React, { useState, useEffect, useRef, useCallback } from 'react';

const TRACKS = [
  { id: 1, title: 'Cybernetic Echoes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Neon Grid Runner', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Digital Odyssey', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.url);
    } else if (audioRef.current.src !== currentTrack.url) {
      audioRef.current.src = currentTrack.url;
    }
    
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : 0.4;
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
             console.error("Audio playback error:", e);
             setIsPlaying(false);
          }
        });
      }
    } else {
      audio.pause();
    }

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / (audio.duration || 1)) * 100 || 0);
    };

    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.4;
    }
  }, [isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
    setProgress(percent * 100);
  };

  // Generate ASCII progress bar
  const totalBars = 30;
  const filledBars = Math.floor((progress / 100) * totalBars);
  const asciiProgress = '[' + '='.repeat(filledBars) + '>'.repeat(filledBars < totalBars ? 1 : 0) + '.'.repeat(Math.max(0, totalBars - filledBars - 1)) + ']';

  return (
    <div className="w-full max-w-[420px] mx-auto p-4 bg-black border-2 border-cyan-vhs shadow-[4px_4px_0_#FF00FF]">
      <div className="flex items-center justify-between mb-4 font-terminal border-b border-dashed border-cyan-vhs/50 pb-2">
        <div className="flex flex-col">
          <span className="text-magenta-vhs text-lg uppercase">{'>'} NOW PLAYING</span>
          <span className="text-cyan-vhs/80 text-sm">TRACK // 0{currentTrack.id}</span>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="text-cyan-vhs hover:text-white bg-black border border-cyan-vhs px-2 py-1 text-sm font-pixel"
        >
          {isMuted ? '[ MUTED ]' : '[ AUDIO ]'}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-1 text-sm font-terminal">
          <span className={`text-cyan-vhs ${isPlaying ? 'animate-pulse' : ''}`}>{currentTrack.title}</span>
          <span className="text-magenta-vhs">{Math.round(progress)}%</span>
        </div>
        
        {/* ASCII Progress Bar */}
        <div 
          className="text-center font-pixel text-xs sm:text-sm text-cyan-vhs cursor-pointer hover:text-white mb-2 select-none overflow-hidden" 
          onClick={handleSeek}
        >
          {asciiProgress}
        </div>
        
        {/* CSS Progress backup/accent */}
        <div className="h-1 bg-black border-b border-magenta-vhs/30 relative">
          <div 
            className="absolute top-0 left-0 h-1 bg-magenta-vhs"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between font-pixel text-sm mt-6">
        <button onClick={handlePrev} className="raw-btn px-2 hover:-translate-x-1">
          {'[<]'}
        </button>
        <button 
          onClick={togglePlay} 
          className={`raw-btn px-4 bg-cyan-vhs/10 ${isPlaying ? 'border-magenta-vhs text-magenta-vhs' : ''}`}
        >
          {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
        </button>
        <button onClick={handleNext} className="raw-btn px-2 hover:translate-x-1">
          {'[>]'}
        </button>
      </div>
    </div>
  );
}
