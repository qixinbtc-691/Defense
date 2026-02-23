export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  id: string;
}

export interface Rocket extends Entity {
  targetX: number;
  targetY: number;
  speed: number;
  angle: number;
}

export interface Missile extends Entity {
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  progress: number; // 0 to 1
}

export interface Explosion extends Point {
  id: string;
  radius: number;
  maxRadius: number;
  life: number; // frames remaining
}

export interface City extends Point {
  id: string;
  active: boolean;
}

export interface Tower extends Point {
  id: string;
  active: boolean;
  ammo: number;
  maxAmmo: number;
}

export type GameStatus = 'START' | 'PLAYING' | 'ROUND_END' | 'GAME_OVER' | 'WIN';

export interface GameState {
  score: number;
  round: number;
  status: GameStatus;
}
