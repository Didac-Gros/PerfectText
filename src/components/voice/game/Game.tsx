import React from "react";
import { Volume2, VolumeX, Play, RotateCcw } from "lucide-react";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { useGameLogic } from "../../../hooks/useGameLogic";

interface GameProps {
  isActive: boolean;
}

export const Game: React.FC<GameProps> = ({ isActive }: GameProps) => {
  const { gameState, score, isGameOver, startGame, handleJump, resetGame } =
    useGameLogic();

  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center h-[25rem] ">
      <div className="relative w-full max-w-2xl bg-black rounded-xl shadow-xl overflow-hidden border border-purple-500/30">
        {/* Score Display */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
          <div className="bg-[#3B82F6] backdrop-blur-sm text-white px-4 py-2 rounded-full font-mono shadow-lg">
            Score: {score}
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative h-[400px] bg-gradient-to-b from-[#0a0118] via-[#1a0b2e] to-[#261445] overflow-hidden">
          {/* Parallax Background Layers */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Stars Layer */}
            <div className="stars-layer"></div>

            {/* Planets */}
            <div className="absolute top-[20%] left-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 animate-planet-glow">
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-purple-300/30"></div>
              <div className="absolute -top-2 left-1/2 w-8 h-2 bg-purple-300/20 blur-sm transform -translate-x-1/2 rotate-15"></div>
            </div>

            <div
              className="absolute top-[30%] right-[25%] w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 animate-planet-glow"
              style={{ animationDelay: "-2s" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-blue-300/30"></div>
              <div className="absolute top-1/2 left-1/2 w-14 h-2 bg-blue-400/10 blur-sm transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
            </div>

            {/* Aurora Effects */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-r from-purple-500/20 via-green-500/20 to-blue-500/20 animate-aurora"></div>
              <div className="absolute top-[10%] left-0 w-full h-[40%] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 animate-aurora-reverse"></div>
            </div>

            {/* Meteors */}
            <div
              className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-meteor"
              style={{ "--meteor-delay": "0s" } as React.CSSProperties}
            ></div>
            <div
              className="absolute top-[20%] right-[20%] w-2 h-2 bg-white rounded-full animate-meteor"
              style={{ "--meteor-delay": "2s" } as React.CSSProperties}
            ></div>

            {/* Nebula Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>

            {/* Star Clusters */}
            <div className="absolute top-[15%] left-[40%] w-2 h-2 bg-white rounded-full animate-star-twinkle"></div>
            <div
              className="absolute top-[45%] right-[35%] w-1.5 h-1.5 bg-blue-200 rounded-full animate-star-twinkle"
              style={{ animationDelay: "-1s" }}
            ></div>
            <div
              className="absolute top-[25%] left-[20%] w-1 h-1 bg-purple-200 rounded-full animate-star-twinkle"
              style={{ animationDelay: "-0.5s" }}
            ></div>

            {/* Ground Effect */}
            <div className="absolute bottom-0 w-full h-[100px]">
              <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-[#1a0b2e] to-transparent">
                <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50"></div>
              </div>
            </div>
          </div>

          {/* Game Elements */}
          <div className="relative h-full">
            <Player
              isJumping={gameState.isJumping}
              isGameOver={isGameOver}
              playerY={gameState.playerY}
            />
            {gameState.obstacles.map((obstacle) => (
              <Obstacle
                key={obstacle.id}
                position={obstacle.position}
                type={obstacle.type}
                isAerial={obstacle.isAerial}
                height={obstacle.height}
              />
            ))}
          </div>

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600">
                ¡Intenta de nuevo!
              </h2>
              <p className="text-xl mb-6">Puntuación: {score}</p>
              <button
                onClick={resetGame}
                className="group px-6 py-3 bg-purple-600/20 backdrop-blur-md rounded-full hover:bg-purple-600/30 transition-all duration-300 flex items-center gap-2"
              >
                <RotateCcw
                  size={20}
                  className="group-hover:rotate-180 transition-transform duration-300"
                />
                Jugar otra vez
              </button>
            </div>
          )}

          {/* Start Screen */}
          {!gameState.isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600">
                PerfectRunner
              </h1>
              <p className="mb-6 text-purple-200/80">
                ¡Salta los obstáculos mientras preparamos tus apuntes!
              </p>
              <button
                onClick={startGame}
                className="group px-6 py-3 bg-purple-600/20 backdrop-blur-md rounded-full hover:bg-purple-600/30 transition-all duration-300 flex items-center gap-2"
              >
                <Play
                  size={20}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
                Comenzar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
