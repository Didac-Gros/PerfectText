"use client";

function Oscillator(options: { phase?: number; amplitude?: number; frequency?: number; offset?: number }) {
  this.init(options || {});
}

Oscillator.prototype = {
  init: function(options: { phase?: number; amplitude?: number; frequency?: number; offset?: number }) {
    this.phase = options.phase || 0;
    this.offset = options.offset || 0;
    this.frequency = options.frequency || 0.001;
    this.amplitude = options.amplitude || 1;
  },
  update: function() {
    this.phase += this.frequency;
    return this.offset + Math.sin(this.phase) * this.amplitude;
  }
};

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

class Line {
  spring: number;
  friction: number;
  nodes: Node[];

  constructor(options: { spring: number }) {
    this.spring = options.spring + 0.1 * Math.random() - 0.05;
    this.friction = config.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    
    for (let i = 0; i < config.size; i++) {
      this.nodes.push({
        x: mousePos.x,
        y: mousePos.y,
        vx: 0,
        vy: 0
      });
    }
  }

  update() {
    let spring = this.spring;
    let node = this.nodes[0];
    
    node.vx += (mousePos.x - node.x) * spring;
    node.vy += (mousePos.y - node.y) * spring;

    for (let i = 1, n = this.nodes.length; i < n; i++) {
      node = this.nodes[i];
      const prev = this.nodes[i - 1];
      
      node.vx += (prev.x - node.x) * spring;
      node.vy += (prev.y - node.y) * spring;
      node.vx += prev.vx * config.dampening;
      node.vy += prev.vy * config.dampening;
      
      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      
      spring *= config.tension;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    let x = this.nodes[0].x, 
        y = this.nodes[0].y;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    for (let i = 1, n = this.nodes.length - 2; i < n; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      x = (a.x + b.x) * 0.5;
      y = (a.y + b.y) * 0.5;
      ctx.quadraticCurveTo(a.x, a.y, x, y);
    }
    
    const a = this.nodes[this.nodes.length - 2];
    const b = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
    ctx.stroke();
    ctx.closePath();
  }
}

const config = {
  friction: 0.5,
  trails: 30,
  size: 50,
  dampening: 0.25,
  tension: 0.98
};

let lines: Line[] = [];
let mousePos = { x: 0, y: 0 };
let oscillator: any;

function createLines() {
  lines = [];
  for (let i = 0; i < config.trails; i++) {
    lines.push(new Line({ spring: 0.45 + (i / config.trails) * 0.025 }));
  }
}

function render(ctx: CanvasRenderingContext2D & { running?: boolean; frame?: number }) {
  if (ctx.running) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `hsla(${Math.round(oscillator.update())},100%,50%,0.1)`;
    ctx.lineWidth = 1;

    for (let i = 0; i < config.trails; i++) {
      lines[i].update();
      lines[i].draw(ctx);
    }

    ctx.frame = (ctx.frame || 0) + 1;
    window.requestAnimationFrame(() => render(ctx));
  }
}

export const renderCanvas = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D & { running?: boolean; frame?: number };
  ctx.running = true;
  ctx.frame = 1;

  oscillator = new Oscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });

  const handlePointer = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      mousePos.x = e.touches[0].pageX;
      mousePos.y = e.touches[0].pageY;
    } else {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    }
    e.preventDefault();
  };

  const resizeCanvas = () => {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  };

  document.addEventListener('mousemove', handlePointer);
  document.addEventListener('touchmove', handlePointer);
  document.addEventListener('touchstart', handlePointer);
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('focus', () => {
    if (!ctx.running) {
      ctx.running = true;
      render(ctx);
    }
  });
  window.addEventListener('blur', () => {
    ctx.running = false;
  });

  resizeCanvas();
  createLines();
  render(ctx);
};