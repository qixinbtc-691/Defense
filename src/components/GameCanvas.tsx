import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Point, Rocket, Missile, Explosion, City, Tower, GameStatus 
} from '../types';
import { 
  GAME_WIDTH, GAME_HEIGHT, INITIAL_AMMO, SCORE_PER_ROCKET, 
  WIN_SCORE, EXPLOSION_RADIUS, EXPLOSION_DURATION, 
  ROCKET_SPEED_MIN, ROCKET_SPEED_MAX, MISSILE_SPEED, COLORS 
} from '../constants';

interface GameCanvasProps {
  onScoreChange: (score: number) => void;
  onStatusChange: (status: GameStatus) => void;
  status: GameStatus;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreChange, onStatusChange, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game state refs for the loop
  const rocketsRef = useRef<Rocket[]>([]);
  const missilesRef = useRef<Missile[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const citiesRef = useRef<City[]>([]);
  const towersRef = useRef<Tower[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const roundRef = useRef(1);
  const rocketsSpawnedInRound = useRef(0);
  const maxRocketsInRound = useRef(10);

  // Initialize game objects
  const initGame = useCallback(() => {
    // 6 Cities
    const cities: City[] = [];
    const citySpacing = GAME_WIDTH / 9;
    for (let i = 0; i < 6; i++) {
      let x = (i < 3) ? (i + 1.5) * citySpacing : (i + 2.5) * citySpacing;
      cities.push({
        id: `city-${i}`,
        x,
        y: GAME_HEIGHT - 20,
        active: true
      });
    }
    citiesRef.current = cities;

    towersRef.current = [
      { id: 'tower-left', x: citySpacing * 0.5, y: GAME_HEIGHT - 30, active: true, ammo: INITIAL_AMMO.LEFT, maxAmmo: INITIAL_AMMO.LEFT },
      { id: 'tower-middle', x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30, active: true, ammo: INITIAL_AMMO.MIDDLE, maxAmmo: INITIAL_AMMO.MIDDLE },
      { id: 'tower-right', x: GAME_WIDTH - citySpacing * 0.5, y: GAME_HEIGHT - 30, active: true, ammo: INITIAL_AMMO.RIGHT, maxAmmo: INITIAL_AMMO.RIGHT },
    ];

    rocketsRef.current = [];
    missilesRef.current = [];
    explosionsRef.current = [];
    scoreRef.current = 0;
    roundRef.current = 1;
    rocketsSpawnedInRound.current = 0;
    maxRocketsInRound.current = 10;
    onScoreChange(0);
  }, [onScoreChange]);

  const startNextRound = useCallback(() => {
    roundRef.current++;
    rocketsSpawnedInRound.current = 0;
    maxRocketsInRound.current = 10 + roundRef.current * 2;
    
    // Refill ammo for active towers
    towersRef.current.forEach(t => {
      if (t.active) t.ammo = t.maxAmmo;
    });
    
    onStatusChange('PLAYING');
  }, [onStatusChange]);

  useEffect(() => {
    if (status === 'START') {
      initGame();
    } else if (status === 'ROUND_END') {
      // Short delay before next round
      const timer = setTimeout(() => {
        startNextRound();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, initGame, startNextRound]);

  const spawnRocket = useCallback(() => {
    if (rocketsSpawnedInRound.current >= maxRocketsInRound.current) return;

    const targets = [
      ...citiesRef.current.filter(c => c.active),
      ...towersRef.current.filter(t => t.active)
    ];
    if (targets.length === 0) return;

    const target = targets[Math.floor(Math.random() * targets.length)];
    const startX = Math.random() * GAME_WIDTH;
    const speed = ROCKET_SPEED_MIN + Math.random() * (ROCKET_SPEED_MAX - ROCKET_SPEED_MIN) + (roundRef.current * 0.1);
    
    const dx = target.x - startX;
    const dy = target.y - 0;
    const angle = Math.atan2(dy, dx);

    rocketsRef.current.push({
      id: `rocket-${Date.now()}-${Math.random()}`,
      x: startX,
      y: 0,
      targetX: target.x,
      targetY: target.y,
      speed,
      angle
    });
    rocketsSpawnedInRound.current++;
  }, []);

  const handleFire = (targetX: number, targetY: number) => {
    if (status !== 'PLAYING') return;

    let bestTower: Tower | null = null;
    let minDist = Infinity;

    towersRef.current.forEach(tower => {
      if (tower.active && tower.ammo > 0) {
        const dist = Math.hypot(tower.x - targetX, tower.y - targetY);
        if (dist < minDist) {
          minDist = dist;
          bestTower = tower;
        }
      }
    });

    if (bestTower) {
      (bestTower as Tower).ammo--;
      missilesRef.current.push({
        id: `missile-${Date.now()}-${Math.random()}`,
        x: (bestTower as Tower).x,
        y: (bestTower as Tower).y,
        startX: (bestTower as Tower).x,
        startY: (bestTower as Tower).y,
        targetX,
        targetY,
        progress: 0
      });
    }
  };

  const update = useCallback(() => {
    if (status !== 'PLAYING') return;

    frameRef.current++;

    // Spawn rockets
    const spawnRate = Math.max(20, 100 - (roundRef.current * 5));
    if (frameRef.current - lastSpawnRef.current > spawnRate && rocketsSpawnedInRound.current < maxRocketsInRound.current) {
      spawnRocket();
      lastSpawnRef.current = frameRef.current;
    }

    // Update rockets
    rocketsRef.current = rocketsRef.current.filter(rocket => {
      rocket.x += Math.cos(rocket.angle) * rocket.speed;
      rocket.y += Math.sin(rocket.angle) * rocket.speed;

      if (rocket.y >= rocket.targetY) {
        explosionsRef.current.push({
          id: `exp-impact-${Date.now()}`,
          x: rocket.x,
          y: rocket.y,
          radius: 0,
          maxRadius: EXPLOSION_RADIUS,
          life: EXPLOSION_DURATION
        });

        const city = citiesRef.current.find(c => Math.abs(c.x - rocket.targetX) < 5 && c.active);
        if (city) city.active = false;
        
        const tower = towersRef.current.find(t => Math.abs(t.x - rocket.targetX) < 5 && t.active);
        if (tower) tower.active = false;

        if (towersRef.current.every(t => !t.active)) {
          onStatusChange('GAME_OVER');
        }

        return false;
      }

      const hitByExplosion = explosionsRef.current.some(exp => {
        const dist = Math.hypot(rocket.x - exp.x, rocket.y - exp.y);
        return dist < exp.radius;
      });

      if (hitByExplosion) {
        scoreRef.current += SCORE_PER_ROCKET;
        onScoreChange(scoreRef.current);
        if (scoreRef.current >= WIN_SCORE) {
          onStatusChange('WIN');
        }
        return false;
      }

      return true;
    });

    // Update missiles
    missilesRef.current = missilesRef.current.filter(missile => {
      const totalDist = Math.hypot(missile.targetX - missile.startX, missile.targetY - missile.startY);
      const step = MISSILE_SPEED / totalDist;
      missile.progress += step;

      if (missile.progress >= 1) {
        explosionsRef.current.push({
          id: `exp-${Date.now()}`,
          x: missile.targetX,
          y: missile.targetY,
          radius: 0,
          maxRadius: EXPLOSION_RADIUS,
          life: EXPLOSION_DURATION
        });
        return false;
      }

      missile.x = missile.startX + (missile.targetX - missile.startX) * missile.progress;
      missile.y = missile.startY + (missile.targetY - missile.startY) * missile.progress;

      return true;
    });

    // Update explosions
    explosionsRef.current = explosionsRef.current.filter(exp => {
      exp.life--;
      if (exp.life > EXPLOSION_DURATION / 2) {
        exp.radius = (1 - (exp.life - EXPLOSION_DURATION / 2) / (EXPLOSION_DURATION / 2)) * exp.maxRadius;
      } else {
        exp.radius = (exp.life / (EXPLOSION_DURATION / 2)) * exp.maxRadius;
      }
      return exp.life > 0;
    });

    // Check if round should end
    if (rocketsSpawnedInRound.current >= maxRocketsInRound.current && rocketsRef.current.length === 0 && explosionsRef.current.length === 0) {
      // Round complete! Add ammo bonus
      const remainingAmmo = towersRef.current.reduce((acc, t) => acc + (t.active ? t.ammo : 0), 0);
      scoreRef.current += remainingAmmo * 5;
      onScoreChange(scoreRef.current);
      
      if (scoreRef.current >= WIN_SCORE) {
        onStatusChange('WIN');
      } else {
        onStatusChange('ROUND_END');
      }
    }
  }, [status, spawnRocket, onScoreChange, onStatusChange]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Background
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Shanghai Skyline (Three-Piece Set)
    ctx.save();
    ctx.fillStyle = '#1a1a1a';
    
    // Jin Mao Tower (Pagoda style)
    const jmX = GAME_WIDTH * 0.3;
    const jmY = GAME_HEIGHT - 20;
    ctx.beginPath();
    ctx.moveTo(jmX - 20, jmY);
    ctx.lineTo(jmX - 15, jmY - 150);
    ctx.lineTo(jmX - 10, jmY - 150);
    ctx.lineTo(jmX - 5, jmY - 180);
    ctx.lineTo(jmX + 5, jmY - 180);
    ctx.lineTo(jmX + 10, jmY - 150);
    ctx.lineTo(jmX + 15, jmY - 150);
    ctx.lineTo(jmX + 20, jmY);
    ctx.fill();

    // Shanghai World Financial Center (Bottle Opener)
    const swfcX = GAME_WIDTH * 0.5;
    const swfcY = GAME_HEIGHT - 20;
    ctx.beginPath();
    ctx.moveTo(swfcX - 25, swfcY);
    ctx.lineTo(swfcX - 15, swfcY - 220);
    ctx.lineTo(swfcX + 15, swfcY - 220);
    ctx.lineTo(swfcX + 25, swfcY);
    ctx.fill();
    // The "hole" at the top
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.rect(swfcX - 8, swfcY - 210, 16, 12);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Shanghai Tower (Spiral/Twisted)
    const stX = GAME_WIDTH * 0.7;
    const stY = GAME_HEIGHT - 20;
    ctx.beginPath();
    ctx.moveTo(stX - 30, stY);
    ctx.bezierCurveTo(stX - 20, stY - 100, stX - 10, stY - 200, stX - 5, stY - 280);
    ctx.lineTo(stX + 5, stY - 280);
    ctx.bezierCurveTo(stX + 10, stY - 200, stX + 20, stY - 100, stX + 30, stY);
    ctx.fill();

    ctx.restore();

    // Draw Cities
    citiesRef.current.forEach(city => {
      if (city.active) {
        ctx.fillStyle = COLORS.CITY;
        ctx.fillRect(city.x - 15, city.y - 10, 30, 10);
        ctx.fillRect(city.x - 10, city.y - 15, 20, 5);
      }
    });

    // Draw Towers
    towersRef.current.forEach(tower => {
      if (tower.active) {
        ctx.fillStyle = COLORS.TOWER;
        ctx.beginPath();
        ctx.moveTo(tower.x - 20, tower.y + 10);
        ctx.lineTo(tower.x + 20, tower.y + 10);
        ctx.lineTo(tower.x, tower.y - 10);
        ctx.closePath();
        ctx.fill();

        // Ammo count
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tower.ammo.toString(), tower.x, tower.y + 25);
      }
    });

    // Draw Rockets (Planes)
    rocketsRef.current.forEach(rocket => {
      ctx.save();
      ctx.translate(rocket.x, rocket.y);
      ctx.rotate(rocket.angle);
      
      // Draw a small plane (doubled size again)
      ctx.fillStyle = COLORS.ROCKET;
      // Body
      ctx.fillRect(-20, -4, 40, 8);
      // Wings
      ctx.fillRect(-4, -20, 8, 40);
      // Tail
      ctx.fillRect(-20, -10, 4, 20);
      
      ctx.restore();
      
      // Trail
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.3)';
      ctx.beginPath();
      ctx.moveTo(rocket.x - Math.cos(rocket.angle) * 20, rocket.y - Math.sin(rocket.angle) * 20);
      ctx.lineTo(rocket.x, rocket.y);
      ctx.stroke();
    });

    // Draw Missiles
    missilesRef.current.forEach(missile => {
      // Trail
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
      ctx.beginPath();
      ctx.moveTo(missile.startX, missile.startY);
      ctx.lineTo(missile.x, missile.y);
      ctx.stroke();

      // Missile head (Doubled size again)
      const angle = Math.atan2(missile.targetY - missile.startY, missile.targetX - missile.startX);
      ctx.save();
      ctx.translate(missile.x, missile.y);
      ctx.rotate(angle);
      
      ctx.fillStyle = COLORS.MISSILE;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-20, -12);
      ctx.lineTo(-20, 12);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      
      // Target marker
      ctx.strokeStyle = COLORS.CROSSHAIR;
      ctx.beginPath();
      ctx.moveTo(missile.targetX - 3, missile.targetY - 3);
      ctx.lineTo(missile.targetX + 3, missile.targetY + 3);
      ctx.moveTo(missile.targetX + 3, missile.targetY - 3);
      ctx.lineTo(missile.targetX - 3, missile.targetY + 3);
      ctx.stroke();
    });

    // Draw Explosions (Fireworks style)
    explosionsRef.current.forEach(exp => {
      const alpha = exp.life / EXPLOSION_DURATION;
      ctx.save();
      ctx.translate(exp.x, exp.y);
      
      // Core glow
      ctx.fillStyle = `rgba(251, 191, 36, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(0, 0, exp.radius, 0, Math.PI * 2);
      ctx.fill();

      // Sparks
      const numSparks = 10;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < numSparks; i++) {
        const angle = (i / numSparks) * Math.PI * 2 + (exp.life * 0.05);
        const sparkDist = exp.radius * 1.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * exp.radius * 0.6, Math.sin(angle) * exp.radius * 0.6);
        ctx.lineTo(Math.cos(angle) * sparkDist, Math.sin(angle) * sparkDist);
        ctx.stroke();
      }
      
      // Inner star
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      update();
      draw(ctx);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [update, draw]);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    handleFire(x, y);
  };

  return (
    <div ref={containerRef} className="relative w-full aspect-[4/3] bg-black overflow-hidden rounded-lg shadow-2xl border-4 border-zinc-800">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />
    </div>
  );
};

export default GameCanvas;
