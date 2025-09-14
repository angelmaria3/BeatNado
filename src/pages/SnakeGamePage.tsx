import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Position = { x: number; y: number };
type WeatherFood = {
  position: Position;
  type: '☀' | '🌧' | '❄' | '🌩';
  points: number;
};

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const TARGET_SCORE = 25;

const WEATHER_FOODS = [
  { type: '☀' as const, points: 5, color: 'hsl(var(--sunny))' },
  { type: '🌧' as const, points: 5, color: 'hsl(var(--rainy))' },
  { type: '❄' as const, points: 5, color: 'hsl(var(--cold))' },
  { type: '🌩' as const, points: 5, color: 'hsl(var(--stormy))' },
];

const SnakeGamePage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Position>({ x: 0, y: -1 });
  const [food, setFood] = useState<WeatherFood | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [weatherCollected, setWeatherCollected] = useState<Record<string, number>>({});

  const generateFood = useCallback((): WeatherFood => {
    const weatherType = WEATHER_FOODS[Math.floor(Math.random() * WEATHER_FOODS.length)];
    return {
      position: {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
      },
      type: weatherType.type,
      points: weatherType.points
    };
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]) => {
    // Wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
      return true;
    }
    
    // Self collision
    return snakeBody.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (food && head.x === food.position.x && head.y === food.position.y) {
        setScore(prev => prev + food.points);
        setWeatherCollected(prev => ({
          ...prev,
          [food.type]: (prev[food.type] || 0) + 1
        }));
        setFood(generateFood());
        
        // Play sound effect (placeholder)
        console.log(`Collected ${food.type}! +${food.points} points`);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, checkCollision, gameStarted, gameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with matrix-style background
    ctx.fillStyle = 'hsl(var(--game-background))';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = 'hsl(var(--game-primary) / 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw snake with glow effect
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.shadowColor = 'hsl(var(--game-primary))';
      ctx.shadowBlur = isHead ? 20 : 10;
      ctx.fillStyle = isHead ? 'hsl(var(--game-primary))' : 'hsl(var(--game-secondary))';
      
      ctx.fillRect(
        segment.x * GRID_SIZE + 2,
        segment.y * GRID_SIZE + 2,
        GRID_SIZE - 4,
        GRID_SIZE - 4
      );
    });

    // Draw food with weather icon
    if (food) {
      const weatherType = WEATHER_FOODS.find(w => w.type === food.type);
      ctx.shadowColor = weatherType?.color || 'white';
      ctx.shadowBlur = 15;
      
      // Draw food background
      ctx.fillStyle = weatherType?.color || 'white';
      ctx.fillRect(
        food.position.x * GRID_SIZE + 1,
        food.position.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );

      // Draw weather emoji
      ctx.shadowBlur = 0;
      ctx.font = `${GRID_SIZE - 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.fillText(
        food.type,
        food.position.x * GRID_SIZE + GRID_SIZE / 2,
        food.position.y * GRID_SIZE + GRID_SIZE - 2
      );
    }

    ctx.shadowBlur = 0;
  }, [snake, food]);

  useEffect(() => {
    if (!food) {
      setFood(generateFood());
    }
  }, [food, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      let newDirection = { ...direction };
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) newDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (direction.y !== -1) newDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) newDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (direction.x !== -1) newDirection = { x: 1, y: 0 };
          break;
      }
      
      setDirection(newDirection);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, 150);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameStarted, gameOver]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (score >= TARGET_SCORE) {
      setGameOver(true);
      setTimeout(() => {
        navigate('/weather-music');
      }, 2000);
    }
  }, [score, navigate]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setWeatherCollected({});
    setFood(generateFood());
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setWeatherCollected({});
    setFood(null);
  };

  return (
    <div className="min-h-screen bg-game-background flex items-center justify-center p-4">
      {/* Matrix-style background pattern */}
      <div className="absolute inset-0 game-grid opacity-30" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <Card className="bg-card/90 backdrop-blur-sm border-game-primary/30 neon-border">
          <div className="p-6 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-game-primary neon-text">
                🐍 Weather Snake Challenge
              </h1>
              <p className="text-muted-foreground">
                Collect weather icons to reach {TARGET_SCORE} points!
              </p>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-game-primary">Score: <span className="font-bold">{score}</span></p>
                <p className="text-muted-foreground">Target: {TARGET_SCORE}</p>
              </div>
              <div className="space-y-1">
                <p className="text-game-primary">Progress</p>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-game-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((score / TARGET_SCORE) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Weather Collection Stats */}
            {Object.keys(weatherCollected).length > 0 && (
              <div className="text-sm space-y-2">
                <p className="text-game-primary">Weather Collected:</p>
                <div className="flex justify-center gap-4">
                  {Object.entries(weatherCollected).map(([type, count]) => (
                    <span key={type} className="text-xs">
                      {type} × {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Game Canvas */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border border-game-primary/50 rounded pixelated neon-border"
              />
            </div>

            {/* Game Controls */}
            <div className="space-y-4">
              {!gameStarted && !gameOver && (
                <Button
                  onClick={startGame}
                  className="w-full retro-button bg-game-primary text-black hover:bg-game-primary/80"
                >
                  🚀 Start Game
                </Button>
              )}

              {gameOver && score >= TARGET_SCORE && (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-accent neon-text">
                    🎉 Challenge Complete!
                  </h2>
                  <p className="text-muted-foreground">
                    Redirecting to music recommendations...
                  </p>
                </div>
              )}

              {gameOver && score < TARGET_SCORE && (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-destructive">
                    Game Over!
                  </h2>
                  <p className="text-muted-foreground">
                    You need {TARGET_SCORE - score} more points.
                  </p>
                  <Button
                    onClick={resetGame}
                    className="w-full retro-button bg-game-primary text-black hover:bg-game-primary/80"
                  >
                    🔄 Try Again
                  </Button>
                </div>
              )}

              {gameStarted && !gameOver && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Use arrow keys to control the snake</p>
                  <p>Collect weather icons for points!</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="pt-4 border-t border-border/30 space-y-2">
              <Button
                onClick={() => navigate('/alarm')}
                variant="outline"
                className="w-full retro-button border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                ⏰ Back to Alarm
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SnakeGamePage;