import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Point3D } from '../types';
import { useBezier } from '../hooks/useBezier';
import { getDeCasteljauPoints } from '../utils/math';

interface BezierCanvasProps {
  points: Point3D[];
  setPoints: React.Dispatch<React.SetStateAction<Point3D[]>>;
  selectedPointIndex: number | null;
  setSelectedPointIndex: (index: number | null) => void;
  svgRef: React.RefObject<SVGSVGElement>;
  showConstruction: boolean;
  tValue: number;
  showCurve: boolean;
}

const FOCAL_LENGTH = 500;

const BezierCanvas: React.FC<BezierCanvasProps> = ({
  points,
  setPoints,
  selectedPointIndex,
  setSelectedPointIndex,
  svgRef,
  showConstruction,
  tValue,
  showCurve
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const curvePoints3D = useBezier(points);
  
  const constructionPoints3D = showConstruction ? getDeCasteljauPoints(points, tValue) : [];
  
  const canvasCenter = useMemo(() => {
    if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        return { x: rect.width / 2, y: rect.height / 2 };
    }
    return { x: 400, y: 300 }; // fallback
  }, [svgRef.current]);

  const project = (point: Point3D) => {
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + point.z);
    return {
      x: point.x * scale + canvasCenter.x * (1 - scale),
      y: point.y * scale + canvasCenter.y * (1 - scale),
      scale
    };
  };

  const unproject = (x: number, y: number, z: number) => {
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
    return {
      x: (x - canvasCenter.x * (1 - scale)) / scale,
      y: (y - canvasCenter.y * (1 - scale)) / scale
    }
  };

  const getMousePosition = (e: React.MouseEvent): {x: number, y: number} => {
    if (svgRef.current) {
      const CTM = svgRef.current.getScreenCTM();
      if (CTM) {
        return {
          x: (e.clientX - CTM.e) / CTM.a,
          y: (e.clientY - CTM.f) / CTM.d,
        };
      }
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDraggingIndex(index);
    setSelectedPointIndex(index);
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIndex !== null && isDraggingRef.current) {
      const mousePos = getMousePosition(e);
      setPoints(prevPoints => {
        const pointToMove = prevPoints[draggingIndex];
        const { x, y } = unproject(mousePos.x, mousePos.y, pointToMove.z);
        return prevPoints.map((p, i) => (i === draggingIndex ? { x, y, z: p.z } : p))
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      const { x, y } = getMousePosition(e);
      setPoints(prevPoints => [...prevPoints, { x, y, z: 0 }]);
    }
  };
  
  useEffect(() => {
    const handleMouseUpGlobal = () => handleMouseUp();
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, []);
  
  const sortedPoints = useMemo(() => 
    points.map((p, i) => ({...p, originalIndex: i}))
          .sort((a, b) => b.z - a.z), 
  [points]);

  const projectedCurvePath = useMemo(() => {
    if (curvePoints3D.length < 2) return '';
    return curvePoints3D.map(p => project(p))
                        .map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`)
                        .join(' ');
  }, [curvePoints3D, canvasCenter]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden border border-slate-200">
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
      >
        {showCurve && (
          <>
            {/* Control Polygon */}
            {points.length > 1 && (
              <polyline
                points={points.map(p => { const proj = project(p); return `${proj.x},${proj.y}`}).join(' ')}
                fill="none"
                stroke="rgba(100, 116, 139, 0.3)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
            
            {/* De Casteljau's Construction */}
            {showConstruction && constructionPoints3D.map((level, levelIndex) =>
              levelIndex > 0 && level.map((p, pIndex) => {
                if (level.length <= pIndex + 1) return null;
                const p0_proj = project(level[pIndex]);
                const p1_proj = project(level[pIndex+1]);
                return (
                  <line
                    key={`${levelIndex}-${pIndex}`}
                    x1={p0_proj.x} y1={p0_proj.y}
                    x2={p1_proj.x} y2={p1_proj.y}
                    stroke={`rgba(14, 165, 233, ${p0_proj.scale})`}
                    strokeWidth={1.5 * p0_proj.scale}
                  />
                )
              })
            )}
            {showConstruction && constructionPoints3D.map((level, levelIndex) =>
                level.map((p, pIndex) => {
                    const proj = project(p);
                    const isFinal = levelIndex === constructionPoints3D.length - 1;
                    return (
                      <circle
                          key={`constr-${levelIndex}-${pIndex}`}
                          cx={proj.x} cy={proj.y}
                          r={(isFinal ? 6 : 4) * proj.scale}
                          fill={isFinal ? '#ef4444' : `rgba(14, 165, 233, ${proj.scale})`}
                      />
                    )
                })
            )}

            {/* Bezier Curve */}
            <path d={projectedCurvePath} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
            
            {/* Tangents */}
            {points.length >= 2 && (
                <g>
                    <line 
                        x1={project(points[0]).x} y1={project(points[0]).y} 
                        x2={project(points[1]).x} y2={project(points[1]).y} 
                        stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3"/>
                    <line 
                        x1={project(points[points.length-1]).x} y1={project(points[points.length-1]).y} 
                        x2={project(points[points.length-2]).x} y2={project(points[points.length-2]).y} 
                        stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3"/>
                </g>
            )}
          </>
        )}

        {/* Control Points */}
        {sortedPoints.map((p) => {
          const i = p.originalIndex;
          const proj = project(p);
          return (
            <g key={i} className="cursor-move" onMouseDown={e => handleMouseDown(e, i)} style={{ opacity: proj.scale * 0.8 + 0.2 }}>
              <circle
                cx={proj.x} cy={proj.y}
                r={12 * proj.scale}
                fill="rgba(255, 255, 255, 0.5)"
              />
              <circle
                cx={proj.x} cy={proj.y}
                r={8 * proj.scale}
                fill={selectedPointIndex === i ? '#f97316' : '#0ea5e9'}
                stroke="#ffffff"
                strokeWidth={2 * proj.scale}
                className="transition-colors"
              />
              <text
                x={proj.x}
                y={proj.y - (15 * proj.scale)}
                textAnchor="middle"
                className="fill-slate-600 font-mono select-none pointer-events-none"
                fontSize={`${0.875 * proj.scale}rem`}
              >
                P{i}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  );
};

export default BezierCanvas;
