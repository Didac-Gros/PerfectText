import React from 'react';

interface ObstacleProps {
  position: number;
  type: 'meteor' | 'satellite' | 'debris';
  isAerial?: boolean;
  height?: number;
}

export const Obstacle: React.FC<ObstacleProps> = ({ position, type, isAerial = false, height = 0 }) => {
  const getObstacleContent = () => {
    switch (type) {
      case 'meteor':
        return (
          // Flaming Meteor
          <div className="relative w-16 h-16">
            {/* Meteor Core */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-700 to-red-900 rounded-full transform rotate-45">
              {/* Surface Details */}
              <div className="absolute inset-1 flex flex-wrap gap-1">
                <div className="w-2 h-2 bg-orange-600/50 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-orange-500/50 rounded-full"></div>
                <div className="w-2 h-2 bg-red-600/50 rounded-full"></div>
              </div>
            </div>
            
            {/* Flame Trail */}
            <div className="absolute -top-4 -left-4 w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-transparent rounded-full opacity-75 animate-fire-effect"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-white via-yellow-400 to-transparent rounded-full opacity-50 animate-fire-effect" style={{ animationDelay: '-0.5s' }}></div>
            </div>
          </div>
        );
      
      case 'satellite':
        return (
          // Space Satellite
          <div className="relative w-16 h-16">
            {/* Main Body */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-6 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg">
              {/* Solar Panels */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-12 bg-blue-400 rounded-sm border border-gray-600">
                <div className="grid grid-cols-2 grid-rows-4 gap-0.5 p-0.5 h-full">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-blue-600/50"></div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-12 bg-blue-400 rounded-sm border border-gray-600">
                <div className="grid grid-cols-2 grid-rows-4 gap-0.5 p-0.5 h-full">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-blue-600/50"></div>
                  ))}
                </div>
              </div>
              
              {/* Antenna */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-400">
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Details */}
              <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
                <div className="bg-gray-500/30 rounded-sm"></div>
                <div className="bg-gray-500/30 rounded-sm"></div>
              </div>
            </div>
          </div>
        );
      
      case 'debris':
        return (
          // Space Debris
          <div className="relative w-14 h-14">
            {/* Main Piece */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg transform rotate-45">
              {/* Damage Details */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-gray-700 transform translate-x-1 -translate-y-1 rotate-12"></div>
              <div className="absolute bottom-0 left-0 w-4 h-2 bg-gray-800 transform -translate-x-1 translate-y-1 -rotate-15"></div>
            </div>
            
            {/* Floating Smaller Pieces */}
            <div className="absolute top-0 left-0 w-3 h-3 bg-gray-500 rounded transform rotate-12 animate-float" style={{ animationDelay: '-0.5s' }}></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-600 transform -rotate-45 animate-float" style={{ animationDelay: '-1s' }}></div>
            
            {/* Metal Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse"></div>
          </div>
        );
    }
  };

  return (
    <div
      className="absolute"
      style={{ 
        left: `${position}px`,
        bottom: `${height}px`,
        willChange: 'transform',
        transform: 'translate3d(0,0,0)'
      }}
    >
      {getObstacleContent()}
    </div>
  );
};