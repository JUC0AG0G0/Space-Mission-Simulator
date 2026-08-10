import type { Vector2 } from '../../types/simulation';

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vector2, factor: number): Vector2 {
  return { x: v.x * factor, y: v.y * factor };
}

export function magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function normalize(v: Vector2): Vector2 {
  const length = magnitude(v);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / length, y: v.y / length };
}

export function fromAngle(radians: number): Vector2 {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export const ZERO_VECTOR: Vector2 = { x: 0, y: 0 };
