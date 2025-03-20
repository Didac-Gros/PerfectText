import { log } from "node:console";
import React, { useEffect, useRef, useState } from "react";

interface TrexGameProps {
  isActive: boolean;
}

export const TrexGame: React.FC<TrexGameProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef<{
    dino: {
      x: number;
      y: number;
      width: number;
      height: number;
      jumping: boolean;
      jumpHeight: number;
      jumpSpeed: number;
      gravity: number;
      initialY: number;
      sprite: {
        frameWidth: number;
        frameHeight: number;
        currentFrame: number;
        frameCount: number;
        animationSpeed: number;
      };
    };
    obstacles: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      type: "cactus" | "bird" | "rock";
      spriteFrame?: number;
    }>;
    clouds: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
    }>;
    ground: {
      y: number;
      segments: Array<{
        x: number;
        width: number;
      }>;
      pattern: number[];
    };
    gameSpeed: number;
    frameCount: number;
    animationFrame: number | null;
    lastObstacleTime: number;
    lastCloudTime: number;
    background: {
      gradient: CanvasGradient | null;
    };
    images: {
      dinoRun: HTMLImageElement[];
      dinoJump: HTMLImageElement;
      dinoHurt: HTMLImageElement;
      cactus: HTMLImageElement[];
      bird: HTMLImageElement[];
      rock: HTMLImageElement;
      cloud: HTMLImageElement;
    };
    imagesLoaded: boolean;
    collisionTime: number | null;
    score: number;
  }>({
    dino: {
      x: 80,
      y: 0,
      width: 60,
      height: 60,
      jumping: false,
      jumpHeight: 15,
      jumpSpeed: 0,
      gravity: 0.8,
      initialY: 0,
      sprite: {
        frameWidth: 60,
        frameHeight: 60,
        currentFrame: 0,
        frameCount: 2,
        animationSpeed: 5,
      },
    },
    obstacles: [],
    clouds: [],
    ground: {
      y: 0,
      segments: [],
      pattern: [0, 1, 0, 2, 1, 0, 3, 2, 1, 0],
    },
    gameSpeed: 5,
    frameCount: 0,
    animationFrame: null,
    lastObstacleTime: 0,
    lastCloudTime: 0,
    background: {
      gradient: null,
    },
    images: {
      dinoRun: [],
      dinoJump: new Image(),
      dinoHurt: new Image(),
      cactus: [],
      bird: [],
      rock: new Image(),
      cloud: new Image(),
    },
    imagesLoaded: false,
    collisionTime: null,
    score: 0,
  });

  // Preload images
  useEffect(() => {
    if (!isActive) return;

    const game = gameRef.current;
    let loadedImages = 0;
    const totalImages = 9; // Total number of images to load

    // Create dino run frames
    for (let i = 0; i < 2; i++) {
      game.images.dinoRun[i] = new Image();
      game.images.dinoRun[i].src = `data:image/svg+xml;base64,${btoa(`
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 10C35 10 38 15 38 20V30H22V20C22 15 25 10 30 10Z" fill="#2A5CAA"/>
          <path d="M38 25H45C48 25 50 28 48 30L42 35H38V25Z" fill="#2A5CAA"/>
          <path d="M38 35H42L45 40H38V35Z" fill="#2A5CAA"/>
          <path d="M22 25H15C12 25 10 28 12 30L18 35H22V25Z" fill="#2A5CAA"/>
          <path d="M22 35H18L15 40H22V35Z" fill="#2A5CAA"/>
          <circle cx="33" cy="18" r="2" fill="white"/>
          <path d="M30 30L25 ${
            i === 0 ? "45" : "40"
          }" stroke="#2A5CAA" stroke-width="4"/>
          <path d="M30 30L35 ${
            i === 0 ? "40" : "45"
          }" stroke="#2A5CAA" stroke-width="4"/>
        </svg>
      `)}`;
      game.images.dinoRun[i].onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) game.imagesLoaded = true;
      };
    }

    // Create dino jump image
    game.images.dinoJump.src = `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 10C35 10 38 15 38 20V30H22V20C22 15 25 10 30 10Z" fill="#2A5CAA"/>
        <path d="M38 25H45C48 25 50 28 48 30L42 35H38V25Z" fill="#2A5CAA"/>
        <path d="M38 35H42L45 40H38V35Z" fill="#2A5CAA"/>
        <path d="M22 25H15C12 25 10 28 12 30L18 35H22V25Z" fill="#2A5CAA"/>
        <path d="M22 35H18L15 40H22V35Z" fill="#2A5CAA"/>
        <circle cx="33" cy="18" r="2" fill="white"/>
        <path d="M25 30L22 38" stroke="#2A5CAA" stroke-width="4"/>
        <path d="M35 30L38 38" stroke="#2A5CAA" stroke-width="4"/>
      </svg>
    `)}`;
    game.images.dinoJump.onload = () => {
      loadedImages++;
      if (loadedImages === totalImages) game.imagesLoaded = true;
    };

    // Create dino hurt image
    game.images.dinoHurt.src = `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 10C35 10 38 15 38 20V30H22V20C22 15 25 10 30 10Z" fill="#FF3A3A"/>
        <path d="M38 25H45C48 25 50 28 48 30L42 35H38V25Z" fill="#FF3A3A"/>
        <path d="M38 35H42L45 40H38V35Z" fill="#FF3A3A"/>
        <path d="M22 25H15C12 25 10 28 12 30L18 35H22V25Z" fill="#FF3A3A"/>
        <path d="M22 35H18L15 40H22V35Z" fill="#FF3A3A"/>
        <line x1="30" y1="15" x2="36" y2="21" stroke="white" stroke-width="2"/>
        <line x1="36" y1="15" x2="30" y2="21" stroke="white" stroke-width="2"/>
        <path d="M25 30L22 40" stroke="#FF3A3A" stroke-width="4"/>
        <path d="M35 30L38 40" stroke="#FF3A3A" stroke-width="4"/>
      </svg>
    `)}`;
    game.images.dinoHurt.onload = () => {
      loadedImages++;
      if (loadedImages === totalImages) game.imagesLoaded = true;
    };

    // Create cactus images
    for (let i = 0; i < 3; i++) {
      game.images.cactus[i] = new Image();
      game.images.cactus[i].src = `data:image/svg+xml;base64,${btoa(`
        <svg width="30" height="50" viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="0" width="10" height="50" fill="#2A5CAA"/>
          ${
            i >= 1
              ? `<rect x="0" y="15" width="10" height="20" fill="#2A5CAA"/>`
              : ""
          }
          ${
            i >= 2
              ? `<rect x="20" y="20" width="10" height="15" fill="#2A5CAA"/>`
              : ""
          }
          <rect x="7" y="0" width="16" height="5" rx="2" fill="#2A5CAA"/>
          ${
            i >= 1
              ? `<rect x="-3" y="15" width="10" height="5" rx="2" fill="#2A5CAA"/>`
              : ""
          }
          ${
            i >= 2
              ? `<rect x="23" y="20" width="10" height="5" rx="2" fill="#2A5CAA"/>`
              : ""
          }
        </svg>
      `)}`;
      game.images.cactus[i].onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) game.imagesLoaded = true;
      };
    }

    // Create bird images
    for (let i = 0; i < 2; i++) {
      game.images.bird[i] = new Image();
      game.images.bird[i].src = `data:image/svg+xml;base64,${btoa(`
        <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 5C25 5 30 10 30 15C30 20 25 25 20 25C15 25 10 20 10 15C10 10 15 5 20 5Z" fill="#2A5CAA"/>
          <path d="M30 15L40 ${
            i === 0 ? "5" : "25"
          }" stroke="#2A5CAA" stroke-width="4"/>
          <path d="M10 15L0 ${
            i === 0 ? "5" : "25"
          }" stroke="#2A5CAA" stroke-width="4"/>
          <circle cx="23" cy="12" r="2" fill="white"/>
          <path d="M15 20L25 20" stroke="white" stroke-width="2"/>
        </svg>
      `)}`;
      game.images.bird[i].onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) game.imagesLoaded = true;
      };
    }

    // Create rock image
    game.images.rock.src = `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 25L10 10L20 5L30 10L35 25H5Z" fill="#2A5CAA"/>
        <path d="M15 15L20 10L25 15" stroke="white" stroke-width="1"/>
      </svg>
    `)}`;
    game.images.rock.onload = () => {
      loadedImages++;
      if (loadedImages === totalImages) game.imagesLoaded = true;
    };

    // Create cloud image
    game.images.cloud.src = `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20C10 13.3726 15.3726 8 22 8C28.6274 8 34 13.3726 34 20H10Z" fill="#D1E3FF"/>
        <path d="M30 20C30 13.3726 35.3726 8 42 8C48.6274 8 54 13.3726 54 20H30Z" fill="#D1E3FF"/>
        <rect x="10" y="20" width="44" height="10" rx="5" fill="#D1E3FF"/>
      </svg>
    `)}`;
    game.images.cloud.onload = () => {
      loadedImages++;
      if (loadedImages === totalImages) game.imagesLoaded = true;
    };
  }, [isActive]);

  // Initialize game
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 200;

    // Initialize game state
    const game = gameRef.current;
    game.dino.initialY = canvas.height - 70;
    game.dino.y = game.dino.initialY;
    game.ground.y = canvas.height - 20;
    game.obstacles = [];
    game.clouds = [];
    game.frameCount = 0;
    game.lastObstacleTime = 0;
    game.lastCloudTime = 0;
    game.gameSpeed = 5;
    game.collisionTime = null;
    game.score = 0;

    // Initialize ground segments
    game.ground.segments = [];
    const segmentWidth = 50;
    const numSegments = Math.ceil(canvas.width / segmentWidth) + 1;

    for (let i = 0; i < numSegments; i++) {
      game.ground.segments.push({
        x: i * segmentWidth,
        width: segmentWidth,
      });
    }

    // Create background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#E6F0FF");
    gradient.addColorStop(1, "#FFFFFF");
    game.background.gradient = gradient;

    setScore(0);
    setGameOver(false);

    // Start game loop
    startGameLoop();

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === "Space" || e.code === "ArrowUp") &&
        !game.dino.jumping &&
        !gameOver
      ) {
        jump();
        e.preventDefault();
      } else if (e.code === "Space" && gameOver) {
        resetGame();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Handle touch input for mobile
    const handleTouchStart = () => {
      if (gameOver) {
        resetGame();
      } else if (!game.dino.jumping) {
        jump();
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart);

    return () => {
      if (game.animationFrame) {
        cancelAnimationFrame(game.animationFrame);
      }
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isActive]);

  // Reset game when isActive changes
  useEffect(() => {
    if (isActive) {
      resetGame();
    } else {
      const game = gameRef.current;
      if (game.animationFrame) {
        cancelAnimationFrame(game.animationFrame);
        game.animationFrame = null;
      }
    }
  }, [isActive]);

  const resetGame = () => {
    const game = gameRef.current;
    game.dino.y = game.dino.initialY;
    game.dino.jumping = false;
    game.dino.jumpSpeed = 0;
    game.obstacles = [];
    game.clouds = [];
    game.frameCount = 0;
    game.lastObstacleTime = 0;
    game.lastCloudTime = 0;
    game.gameSpeed = 5;
    game.collisionTime = null;
    game.score = 0;
    setScore(0);
    setGameOver(false);
    startGameLoop();
  };

  const startGameLoop = () => {
    const game = gameRef.current;
    if (game.animationFrame) {
      cancelAnimationFrame(game.animationFrame);
    }
    gameLoop();
  };

  const jump = () => {
    const game = gameRef.current;
    if (!gameOver && !game.dino.jumping) {
      game.dino.jumping = true;
      game.dino.jumpSpeed = -game.dino.jumpHeight;
    }
  };

  const gameLoop = () => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (game.background.gradient) {
      ctx.fillStyle = game.background.gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Update game state if not game over
    if (!gameOver) {
      updateDino();
      updateObstacles();
      updateClouds();
      updateGround();
      checkCollisions();

      // Update score
      game.score += 0.1;
      if (game.frameCount % 5 === 0) {
        setScore(Math.floor(game.score));
      }
    } else {
      // Si hay colisión, mostrar la animación de colisión
      if (game.collisionTime === null) {
        game.collisionTime = Date.now();
      }

      // Mostrar la animación de colisión durante 1 segundo antes de permitir reiniciar
      const collisionDuration = Date.now() - (game.collisionTime || 0);
      if (collisionDuration > 1000) {
        // Después de 1 segundo, permitir reiniciar con un clic o tecla
        ctx.fillStyle = "#2A5CAA";
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(
          "Presiona ESPACIO o toca la pantalla para reiniciar",
          canvas.width / 2,
          canvas.height / 2 + 30
        );
      }
    }

    // Draw game elements
    drawClouds(ctx);
    drawGround(ctx);
    drawObstacles(ctx);
    drawDino(ctx);
    drawScore(ctx);

    if (!gameOver) {
      drawInstructions(ctx);
    } else {
      drawCollision(ctx);
    }

    // Increase difficulty over time if not game over
    if (!gameOver && game.frameCount % 500 === 0) {
      game.gameSpeed += 0.2;
    }

    game.frameCount++;

    // Continue game loop
    game.animationFrame = requestAnimationFrame(gameLoop);
  };

  const updateDino = () => {
    const game = gameRef.current;

    if (game.dino.jumping) {
      game.dino.y += game.dino.jumpSpeed;
      game.dino.jumpSpeed += game.dino.gravity;

      // Check if dino has landed
      if (game.dino.y >= game.dino.initialY) {
        game.dino.y = game.dino.initialY;
        game.dino.jumping = false;
      }
    }

    // Update animation frame
    if (
      game.frameCount % game.dino.sprite.animationSpeed === 0 &&
      !game.dino.jumping
    ) {
      game.dino.sprite.currentFrame =
        (game.dino.sprite.currentFrame + 1) % game.dino.sprite.frameCount;
    }
  };

  const updateObstacles = () => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Add new obstacle
    if (game.frameCount - game.lastObstacleTime > 100 + Math.random() * 50) {
      const obstacleType = Math.random();
      let obstacle;

      if (obstacleType < 0.6) {
        // Cactus
        const cactusType = Math.floor(Math.random() * 3);
        const height = 30 + Math.random() * 30;
        obstacle = {
          x: canvas.width,
          y: game.ground.y - height,
          width: 20 + cactusType * 5,
          height: height,
          speed: game.gameSpeed,
          type: "cactus" as const,
          spriteFrame: cactusType,
        };
      } else if (obstacleType < 0.85) {
        // Bird
        const birdHeight = Math.random() > 0.5 ? 50 : 100;
        obstacle = {
          x: canvas.width,
          y: game.ground.y - birdHeight,
          width: 40,
          height: 30,
          speed: game.gameSpeed * 1.2,
          type: "bird" as const,
          spriteFrame: 0,
        };
      } else {
        // Rock
        const height = 20 + Math.random() * 15;
        obstacle = {
          x: canvas.width,
          y: game.ground.y - height,
          width: 40,
          height: height,
          speed: game.gameSpeed,
          type: "rock" as const,
        };
      }

      game.obstacles.push(obstacle);
      game.lastObstacleTime = game.frameCount;
    }

    // Update obstacle positions and animations
    game.obstacles.forEach((obstacle) => {
      obstacle.x -= obstacle.speed;

      // Animate birds
      if (obstacle.type === "bird" && game.frameCount % 15 === 0) {
        obstacle.spriteFrame = obstacle.spriteFrame === 0 ? 1 : 0;
      }
    });

    // Remove obstacles that are off screen
    game.obstacles = game.obstacles.filter(
      (obstacle) => obstacle.x > -obstacle.width
    );
  };

  const updateClouds = () => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add new cloud
    if (game.frameCount - game.lastCloudTime > 200 + Math.random() * 200) {
      const cloudY = 20 + Math.random() * 50;
      game.clouds.push({
        x: canvas.width,
        y: cloudY,
        width: 60,
        height: 30,
        speed: game.gameSpeed * 0.2,
      });
      game.lastCloudTime = game.frameCount;
    }

    // Update cloud positions
    game.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed;
    });

    // Remove clouds that are off screen
    game.clouds = game.clouds.filter((cloud) => cloud.x > -cloud.width);
  };

  const updateGround = () => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update ground segments
    game.ground.segments.forEach((segment) => {
      segment.x -= game.gameSpeed;

      // Reset segment position when it goes off screen
      if (segment.x + segment.width < 0) {
        const lastSegment =
          game.ground.segments[game.ground.segments.length - 1];
        segment.x = lastSegment.x + lastSegment.width;
      }
    });

    // Sort segments by x position
    game.ground.segments.sort((a, b) => a.x - b.x);
  };

  const checkCollisions = () => {
    const game = gameRef.current;

    if (gameOver) return; // No verificar colisiones si el juego ya terminó

    for (const obstacle of game.obstacles) {
      // Adjust collision box to be more forgiving
      const dinoHitbox = {
        x: game.dino.x + 10,
        y: game.dino.y + 5,
        width: game.dino.width - 20,
        height: game.dino.height - 10,
      };

      const obstacleHitbox = {
        x: obstacle.x + 5,
        y: obstacle.y + 5,
        width: obstacle.width - 10,
        height: obstacle.height - 5,
      };

      if (
        dinoHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
        dinoHitbox.x + dinoHitbox.width > obstacleHitbox.x &&
        dinoHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
        dinoHitbox.y + dinoHitbox.height > obstacleHitbox.y
      ) {
        // setGameOver(true);
        game.collisionTime = Date.now();
        return;
      }
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw ground line
    ctx.beginPath();
    ctx.moveTo(0, game.ground.y);
    ctx.lineTo(canvas.width, game.ground.y);
    ctx.strokeStyle = "#2A5CAA";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw ground details
    game.ground.segments.forEach((segment, index) => {
      const patternIndex = index % game.ground.pattern.length;
      const detail = game.ground.pattern[patternIndex];

      if (detail > 0) {
        ctx.fillStyle = "#2A5CAA";
        const detailHeight = detail * 2;
        ctx.fillRect(
          segment.x + segment.width / 2 - 2,
          game.ground.y + 2,
          4,
          detailHeight
        );
      }
    });
  };

  const drawDino = (ctx: CanvasRenderingContext2D) => {
    const game = gameRef.current;

    if (!game.imagesLoaded) {
      // Fallback drawing if images aren't loaded
      ctx.fillStyle = gameOver ? "#FF3A3A" : "#2A5CAA";
      ctx.fillRect(game.dino.x, game.dino.y, game.dino.width, game.dino.height);
      return;
    }

    if (gameOver) {
      ctx.drawImage(
        game.images.dinoHurt,
        game.dino.x,
        game.dino.y,
        game.dino.width,
        game.dino.height
      );
    } else if (game.dino.jumping) {
      ctx.drawImage(
        game.images.dinoJump,
        game.dino.x,
        game.dino.y,
        game.dino.width,
        game.dino.height
      );
    } else {
      ctx.drawImage(
        game.images.dinoRun[game.dino.sprite.currentFrame],
        game.dino.x,
        game.dino.y,
        game.dino.width,
        game.dino.height
      );
    }
  };

  const drawObstacles = (ctx: CanvasRenderingContext2D) => {
    const game = gameRef.current;

    if (!game.imagesLoaded) {
      // Fallback drawing if images aren't loaded
      ctx.fillStyle = "#2A5CAA";
      game.obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
      return;
    }

    game.obstacles.forEach((obstacle) => {
      if (
        obstacle.type === "cactus" &&
        typeof obstacle.spriteFrame === "number"
      ) {
        ctx.drawImage(
          game.images.cactus[obstacle.spriteFrame],
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      } else if (
        obstacle.type === "bird" &&
        typeof obstacle.spriteFrame === "number"
      ) {
        ctx.drawImage(
          game.images.bird[obstacle.spriteFrame],
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      } else if (obstacle.type === "rock") {
        ctx.drawImage(
          game.images.rock,
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      }
    });
  };

  const drawClouds = (ctx: CanvasRenderingContext2D) => {
    const game = gameRef.current;

    if (!game.imagesLoaded) {
      // Fallback drawing if images aren't loaded
      ctx.fillStyle = "#D1E3FF";
      game.clouds.forEach((cloud) => {
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
      });
      return;
    }

    game.clouds.forEach((cloud) => {
      ctx.drawImage(
        game.images.cloud,
        cloud.x,
        cloud.y,
        cloud.width,
        cloud.height
      );
    });
  };

  const drawScore = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.fillStyle = "#2A5CAA";
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = "right";
    // ctx.fillText(`Puntuación: ${score}`, canvas.width - 20, 30);
  };

  const drawInstructions = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#2A5CAA";
    ctx.font = '14px "Inter", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText("Presiona ESPACIO o toca la pantalla para saltar", 20, 30);
  };

  const drawCollision = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Efecto de flash para indicar colisión
    ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game over text
    ctx.fillStyle = "#FF3A3A";
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("¡Colisión!", canvas.width / 2, canvas.height / 2 - 20);
  };

  if (!isActive) return null;

  return (
    <div className="w-full">
      <div
        className="relative bg-white rounded-xl overflow-hidden cursor-pointer"
        onClick={() => {
          if (gameOver) {            
            resetGame();
          } else if (!gameRef.current.dino.jumping) {
            jump();
          }
        }}
      >
        <div className="absolute top-7 right-6 text-xl font-bold text-[#2A5CAA] font-serif ">
          <p>Puntuación: {score}</p>
        </div>
        <canvas ref={canvasRef} className="block w-full" />
      </div>
    </div>
  );
};
