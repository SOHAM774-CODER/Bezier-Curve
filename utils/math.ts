import type { Point3D } from '../types';

const factorial = (n: number): number => {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

export const combinations = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
};

export const bernstein = (n: number, i: number, t: number): number => {
  return combinations(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
};

export const getBezierCurvePoint = (points: Point3D[], t: number): Point3D => {
  const n = points.length - 1;
  if (n < 0) return { x: 0, y: 0, z: 0 };

  let x = 0;
  let y = 0;
  let z = 0;

  points.forEach((point, i) => {
    const basis = bernstein(n, i, t);
    x += point.x * basis;
    y += point.y * basis;
    z += point.z * basis;
  });

  return { x, y, z };
};

export const getDeCasteljauPoints = (points: Point3D[], t: number): Point3D[][] => {
    if (points.length < 2) return [];

    const levels: Point3D[][] = [points];
    
    for (let i = 1; i < points.length; i++) {
        const prevLevel = levels[i-1];
        const newLevel: Point3D[] = [];
        for (let j = 0; j < prevLevel.length - 1; j++) {
            const p0 = prevLevel[j];
            const p1 = prevLevel[j+1];
            newLevel.push({
                x: (1 - t) * p0.x + t * p1.x,
                y: (1 - t) * p0.y + t * p1.y,
                z: (1 - t) * p0.z + t * p1.z,
            });
        }
        levels.push(newLevel);
    }
    return levels;
};
