import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
type Point = { x: number; y: number };
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

const DIFFICULTY_SETTINGS = {
  EASY: { speedBase: 220, speedMultiplier: 1.0, minSpeed: 100, initialLength: 3, label: 'EASY' },
  MEDIUM: { speedBase: 150, speedMultiplier: 1.5, minSpeed: 60, initialLength: 5, label: 'MEDIUM' },
  HARD: { speedBase: 100, speedMultiplier: 2.5, minSpeed: 40, initialLength: 8, label: 'HARD' },
};

const getInitialSnake = (length: number): Point[] => {
  return Array.from({ length }).map((_, i) => ({ x: 10, y: 10 + i }));
};

const randomPoint = (): Point => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

const isCollision = (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y;

export function SnakeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [snake, setSnake] = useState<Point[]>(getInitialSnake(DIFFICULTY_SETTINGS['MEDIUM'].initialLength));
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [isEating, setIsEating] = useState(false);

  const directionRef = useRef<Point>(direction);
  const directionRefQueue = useRef<Point[]>([]);
  const touchStartRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const resetGame = () => {
    const initialSnake = getInitialSnake(DIFFICULTY_SETTINGS[difficulty].initialLength);
    setSnake(initialSnake);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    directionRefQueue.current = [];
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setIsStarted(true);
    setIsEating(false);
    spawnFood(initialSnake);
  };

  const spawnFood = (currentSnake: Point[]) => {
    let newFood = randomPoint();
    while (currentSnake.some((segment) => isCollision(segment, newFood))) {
      newFood = randomPoint();
    }
    setFood(newFood);
  };

  const handleDirChange = useCallback((newDir: Point) => {
    if (!isStarted || gameOver) return;
    const lastDir = directionRefQueue.current.length > 0 
      ? directionRefQueue.current[directionRefQueue.current.length - 1] 
      : directionRef.current;
    if (lastDir.x !== -newDir.x || lastDir.y !== -newDir.y) {
      directionRefQueue.current.push(newDir);
    }
  }, [isStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || gameOver) {
        if (e.key === 'Enter') resetGame();
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': handleDirChange({ x: 0, y: -1 }); break;
        case 'ArrowDown': case 's': case 'S': handleDirChange({ x: 0, y: 1 }); break;
        case 'ArrowLeft': case 'a': case 'A': handleDirChange({ x: -1, y: 0 }); break;
        case 'ArrowRight': case 'd': case 'D': handleDirChange({ x: 1, y: 0 }); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver, handleDirChange]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    
    // Threshold for swipe
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
            handleDirChange({ x: dx > 0 ? 1 : -1, y: 0 });
        } else {
            handleDirChange({ x: 0, y: dy > 0 ? 1 : -1 });
        }
    }
    touchStartRef.current = null;
  };

  useEffect(() => {
    if (gameOver || !isStarted || gameWon) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        if (directionRefQueue.current.length > 0) {
          const nextDir = directionRefQueue.current.shift()!;
          setDirection(nextDir);
          directionRef.current = nextDir;
        }

        const head = prevSnake[0];
        const newHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };

        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE || 
          newHead.y < 0 || newHead.y >= GRID_SIZE || 
          prevSnake.some((segment) => isCollision(segment, newHead))
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (isCollision(newHead, food)) {
          setScore((s) => s + 1);
          setIsEating(true);
          setTimeout(() => setIsEating(false), 150);
          
          if (newSnake.length === GRID_SIZE * GRID_SIZE) setGameWon(true);
          else spawnFood(newSnake);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, Math.max(DIFFICULTY_SETTINGS[difficulty].minSpeed, DIFFICULTY_SETTINGS[difficulty].speedBase - score * DIFFICULTY_SETTINGS[difficulty].speedMultiplier));

    return () => clearInterval(interval);
  }, [gameOver, isStarted, food, gameWon, score, difficulty]);

  return (
    <div className="flex flex-col items-center w-full select-none max-w-[420px]">
      {/* HUD components */}
      <div className="w-full flex justify-between items-end mb-4 font-terminal border-b-[3px] border-cyan-vhs/30 pb-2">
        <div className="flex flex-col">
          <span className="text-magenta-vhs text-xl">{'>'} SCORE COUNTER</span>
          <span className="text-sm opacity-50">TARGET: 400</span>
        </div>
        <span className="font-pixel text-3xl text-cyan-vhs bg-cyan-vhs/10 px-2 py-1 border border-cyan-vhs">
          {score.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Game Board Container */}
      <div 
        className={`glitch-border bg-black border-4 w-full p-2
          ${gameOver ? 'border-magenta-vhs screen-tear' : 'border-cyan-vhs'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative grid bg-black/80"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: '100%',
            aspectRatio: '1/1',
            backgroundImage: 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: `calc(100% / ${GRID_SIZE}) calc(100% / ${GRID_SIZE})`
          }}
        >
          {/* Render Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`absolute ${isHead ? 'bg-magenta-vhs z-10' : 'bg-cyan-vhs opacity-80'} transition-none`}
                style={{
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  width: `calc(100% / ${GRID_SIZE})`,
                  height: `calc(100% / ${GRID_SIZE})`,
                  boxShadow: isHead ? '0 0 10px #FF00FF' : 'none',
                }}
              />
            );
          })}

          {/* Render Food */}
          <div
            className={`absolute z-0 ${isEating ? 'bg-white' : 'bg-magenta-vhs'}`}
            style={{
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
              width: `calc(100% / ${GRID_SIZE})`,
              height: `calc(100% / ${GRID_SIZE})`,
              animation: 'tear 0.5s infinite steps(2)',
            }}
          />
        </div>

        {/* Overlays */}
        {(!isStarted || gameOver || gameWon) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90">
            {!isStarted ? (
              <div className="text-center group flex flex-col items-center">
                <button onClick={resetGame} className="raw-btn text-2xl px-8 py-4 glitch-text mb-6" data-text="[ START GAME ]">
                  [ START GAME ]
                </button>
                
                <div className="flex gap-4 mb-8">
                  {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`font-pixel text-sm px-3 py-1 border transition-none ${
                        difficulty === level 
                          ? 'bg-cyan-vhs text-black border-cyan-vhs' 
                          : 'bg-black text-cyan-vhs border-cyan-vhs/50 hover:border-cyan-vhs'
                      }`}
                    >
                      {DIFFICULTY_SETTINGS[level].label}
                    </button>
                  ))}
                </div>

                <p className="text-sm font-terminal text-cyan-vhs opacity-70 border border-cyan-vhs px-2 border-dashed inline-block">
                  CONTROLS: WASD // ARROWS // SWIPE
                </p>
              </div>
            ) : gameOver ? (
              <div className="text-center flex flex-col items-center border-[3px] border-magenta-vhs p-6 bg-black relative">
                <h2 className="text-2xl font-pixel mb-4 text-magenta-vhs glitch-text" data-text="> GAME OVER">{'>'} GAME OVER</h2>
                <div className="w-full h-px bg-magenta-vhs mb-4"></div>
                <p className="text-cyan-vhs font-terminal text-xl mb-2">CRASH DETECTED</p>
                <p className="text-cyan-vhs font-terminal text-xl mb-8">FINAL SCORE: {score}</p>
                <button onClick={resetGame} className="raw-btn">
                  [ TRY AGAIN ]
                </button>
                <div className="absolute -top-[3px] -left-[3px] w-4 h-4 border-t-[3px] border-l-[3px] border-white"></div>
                <div className="absolute -bottom-[3px] -right-[3px] w-4 h-4 border-b-[3px] border-r-[3px] border-white"></div>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center border-[3px] border-cyan-vhs p-6 bg-black">
                <h2 className="text-2xl font-pixel mb-4 text-cyan-vhs glitch-text" data-text="> YOU WIN">{'>'} YOU WIN</h2>
                <p className="text-magenta-vhs font-terminal text-xl mb-8">MAXIMUM SCORE REACHED</p>
                <button onClick={resetGame} className="raw-btn">
                  [ PLAY AGAIN ]
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
