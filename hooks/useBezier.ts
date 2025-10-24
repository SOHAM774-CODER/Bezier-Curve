import { useMemo } from 'react';
import type { Point3D } from '../types';
import { getBezierCurvePoint } from '../utils/math';

export const useBezier = (points: Point3D[], steps: number = 100): Point3D[] => {
  const curvePoints = useMemo(() => {
    if (points.length < 2) {
      return [];
    }

    const calculatedPoints: Point3D[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      calculatedPoints.push(getBezierCurvePoint(points, t));
    }
    return calculatedPoints;
  }, [points, steps]);

  return curvePoints;
};
