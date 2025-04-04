import { useState, useEffect, useCallback } from "react";

interface GameState {
  isPlaying: boolean;
  isJumping: boolean;
  playerY: number;
  velocityY: number;
  obstacles: Array<{
    position: number;
    type: "meteor" | "satellite" | "debris";
    id: string;
    isAerial: boolean;
    height: number;
  }>;
  speed: number;  
}

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isJumping: false,
    playerY: 0,
    velocityY: 0,
    obstacles: [],
    speed: 10,
  });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  const GRAVITY = -1.2;
  const JUMP_VELOCITY = 22;
  const GROUND_Y = 0;
  const PLAYER_HEIGHT = 80;
  const GAME_HEIGHT = 400;
  const AERIAL_HEIGHT = 200;
  const BASE_OBSTACLE_RATE = 0.015; // Reduced from 0.025 to create more space between obstacles

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      speed: 10,
      obstacles: [],
      playerY: GROUND_Y,
      velocityY: 0,
      isJumping: false,
    }));
    setScore(0);
    setFrameCount(0);
    setDifficultyLevel(1);
    setIsGameOver(false);
  }, []);

  const handleJump = useCallback(() => {
    if (gameState.playerY === GROUND_Y && gameState.isPlaying) {
      setGameState((prev) => ({
        ...prev,
        velocityY: JUMP_VELOCITY,
        isJumping: true,
      }));
    }
  }, [gameState.playerY, gameState.isPlaying]);

  const resetGame = useCallback(() => {
    // Immediately start a new game instead of just resetting
    startGame();
  }, [startGame]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!gameState.isPlaying && !isGameOver) {
          startGame();
        } else {
          handleJump();
        }
      }
    };

    const handleClick = () => {
      if (!gameState.isPlaying && !isGameOver) {
        startGame();
      } else {
        handleJump();
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleJump, gameState.isPlaying, isGameOver, startGame]);

  useEffect(() => {
    if (!gameState.isPlaying || isGameOver) return;

    const gameLoop = setInterval(() => {
      setFrameCount((prev) => prev + 1);

      // Score increment based on current speed
      if (frameCount % 30 === 0) {
        setScore((prev) => prev + Math.floor(gameState.speed / 2));
      }

      // Progressive difficulty increase - now focusing more on speed
      if (score > 0) {
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== difficultyLevel) {
          setDifficultyLevel(newLevel);
          setGameState((prev) => ({
            ...prev,
            speed: Math.min(10 + newLevel * 1.2, 25), // Increased speed progression and maximum speed
          }));
        }
      }

      setGameState((prev) => {
        let newY = prev.playerY;
        let newVelocityY = prev.velocityY;

        newVelocityY += GRAVITY;
        newY += newVelocityY;

        if (newY < GROUND_Y) {
          newY = GROUND_Y;
          newVelocityY = 0;
        }

        return {
          ...prev,
          playerY: newY,
          velocityY: newVelocityY,
          isJumping: newY > GROUND_Y,
        };
      });

      setGameState((prev) => ({
        ...prev,
        obstacles: [
          ...prev.obstacles
            .filter((obs) => obs.position > -50)
            .map((obs) => ({
              ...obs,
              position: obs.position - prev.speed,
            })),
        ],
      }));

      // Obstacle generation with minimum spacing
      const obstacleRate = BASE_OBSTACLE_RATE * (1 + difficultyLevel * 0.05); // Reduced difficulty scaling
      if (Math.random() < obstacleRate) {
        const types: Array<"meteor" | "satellite" | "debris"> = [
          "meteor",
          "satellite",
          "debris",
        ];
        const lastObstacle =
          gameState.obstacles[gameState.obstacles.length - 1];

        // Ensure minimum spacing between obstacles (increased minimum distance)
        if (!lastObstacle || lastObstacle.position < 600) {
          const isAerial = Math.random() < 0.3 + difficultyLevel * 0.01; // Reduced aerial obstacle probability
          setGameState((prev) => ({
            ...prev,
            obstacles: [
              ...prev.obstacles,
              {
                position: 800,
                type: types[Math.floor(Math.random() * types.length)],
                id: Math.random().toString(36).substr(2, 9),
                isAerial,
                height: isAerial ? AERIAL_HEIGHT : 0,
              },
            ],
          }));
        }
      }

      const playerRect = {
        x: 80,
        y: GAME_HEIGHT - gameState.playerY - PLAYER_HEIGHT,
        width: 50,
        height: PLAYER_HEIGHT,
      };

      const hasCollision = gameState.obstacles.some((obstacle) => {
        const obstacleHeight = 50;
        const obstacleWidth = 40;

        const obstacleRect = {
          x: obstacle.position,
          y: GAME_HEIGHT - obstacle.height - obstacleHeight,
          width: obstacleWidth,
          height: obstacleHeight,
        };

        return (
          playerRect.x < obstacleRect.x + obstacleRect.width &&
          playerRect.x + playerRect.width > obstacleRect.x &&
          playerRect.y < obstacleRect.y + obstacleRect.height &&
          playerRect.y + playerRect.height > obstacleRect.y
        );
      });

      if (hasCollision) {
        setIsGameOver(true);
        setGameState((prev) => ({ ...prev, isPlaying: false }));
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [
    gameState.isPlaying,
    isGameOver,
    score,
    gameState.obstacles,
    handleJump,
    frameCount,
    difficultyLevel,
  ]);

  return {
    gameState,
    score,
    isGameOver,
    startGame,
    handleJump,
    resetGame,
  };
};
