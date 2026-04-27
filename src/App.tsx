import React from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-cyan-vhs flex flex-col pt-8 pb-8 px-4 overflow-hidden relative selection:bg-magenta-vhs selection:text-black">
      {/* Visual Glitch & CRT Effects */}
      <div className="crt-overlay" />
      <div className="noise" />

      <main className="flex-1 flex flex-col items-center justify-start gap-8 w-full max-w-5xl mx-auto z-10 relative">
        {/* Boot Sequence Header */}
        <header className="w-full flex justify-center mt-2">
          <div className="text-center w-full max-w-[600px] border-b-2 border-magenta-vhs/50 pb-4 relative">
            <h1 className="text-4xl sm:text-6xl screen-tear text-magenta-vhs font-pixel glitch-text tracking-[0.2em]" data-text="O.R.O.B.O.R.O.S.">
              O.R.O.B.O.R.O.S.
            </h1>
            <div className="font-terminal text-lg sm:text-xl mt-4 flex justify-between w-full text-cyan-vhs">
              <span className="opacity-80">{'>'} SYS.STATUS: ONLINE</span>
              <span className="opacity-80">TERMINAL // 0X1A</span>
            </div>
            {/* Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-vhs" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-vhs" />
          </div>
        </header>

        {/* Game Area */}
        <section className="w-full flex justify-center mt-4 2xl:mt-8">
          <SnakeGame />
        </section>

        {/* Audio Interface */}
        <section className="w-full flex justify-center mt-auto sm:mt-12 pb-4">
          <MusicPlayer />
        </section>
      </main>
    </div>
  );
}
