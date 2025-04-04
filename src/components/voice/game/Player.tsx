import React from 'react';

interface PlayerProps {
  isJumping: boolean;
  isGameOver: boolean;
  playerY: number;
}

export const Player: React.FC<PlayerProps> = ({ isJumping, isGameOver, playerY }) => {
  return (
    <div
      className={`absolute left-20 w-16 h-24 ${
        !isJumping ? 'animate-run' : ''
      } ${isGameOver ? 'animate-none' : ''}`}
      style={{ 
        bottom: `${playerY}px`,
        transform: `rotate(${isJumping ? '5deg' : '0deg'}) scaleX(1)`,
        transition: 'transform 0.2s ease',
        willChange: 'transform, bottom'
      }}
    >
      {/* Modern Astronaut Character */}
      <div className="relative w-full h-full">
        {/* Helmet */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12">
          {/* Helmet Base */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-300 rounded-2xl shadow-lg">
            {/* Visor */}
            <div className="absolute inset-2 bg-gradient-to-br from-blue-400/80 to-blue-600/80 rounded-lg overflow-hidden">
              {/* Visor Reflection */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/30 blur-sm rotate-45"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
            
            {/* Helmet Details */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="absolute -left-1 top-1/2 w-2 h-3 bg-gray-400 rounded-full"></div>
            <div className="absolute -right-1 top-1/2 w-2 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>

        {/* Space Suit Body */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-10 h-10">
          {/* Main Suit */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-200 rounded-lg">
            {/* Suit Details */}
            <div className="absolute inset-x-0 top-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-md">
              {/* Life Support System */}
              <div className="absolute inset-1 grid grid-cols-2 gap-1">
                <div className="bg-blue-400/30 rounded-sm"></div>
                <div className="bg-blue-400/30 rounded-sm"></div>
                <div className="bg-blue-400/30 rounded-sm"></div>
                <div className="bg-blue-400/30 rounded-sm"></div>
              </div>
            </div>
            
            {/* NASA Logo */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-red-500 rounded-sm">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 h-full bg-white"></div>
            </div>
          </div>
        </div>

        {/* Arms */}
        <div className="absolute top-10 left-0 w-3 h-8 bg-gradient-to-b from-white to-gray-200 rounded-full shadow-md">
          {/* Arm Details */}
          <div className="absolute inset-x-0 top-2 h-4 bg-blue-500/30 rounded-full"></div>
        </div>
        <div className="absolute top-10 right-0 w-3 h-8 bg-gradient-to-b from-white to-gray-200 rounded-full shadow-md">
          {/* Arm Details */}
          <div className="absolute inset-x-0 top-2 h-4 bg-blue-500/30 rounded-full"></div>
        </div>

        {/* Legs */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
          {/* Left Boot */}
          <div className="w-4 h-6">
            <div className="absolute bottom-0 w-4 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-lg">
              {/* Boot Details */}
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gray-600 rounded-b-lg"></div>
            </div>
            <div className="absolute top-0 w-4 h-3 bg-white rounded-t-lg"></div>
          </div>
          {/* Right Boot */}
          <div className="w-4 h-6">
            <div className="absolute bottom-0 w-4 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-lg">
              {/* Boot Details */}
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gray-600 rounded-b-lg"></div>
            </div>
            <div className="absolute top-0 w-4 h-3 bg-white rounded-t-lg"></div>
          </div>
        </div>

        {/* Jetpack */}
        <div className="absolute -right-1 top-8 w-4 h-8">
          {/* Jetpack Body */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg">
            {/* Thrusters */}
            <div className="absolute -bottom-1 inset-x-0 flex justify-center">
              <div className="w-2 h-3">
                <div className={`absolute inset-0 bg-gradient-to-t from-blue-500 via-blue-300 to-transparent rounded-full opacity-75 ${
                  isJumping ? 'animate-magic scale-150' : 'animate-magic'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 via-white/20 to-transparent mix-blend-overlay"></div>
                </div>
              </div>
            </div>
            {/* Jetpack Details */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};