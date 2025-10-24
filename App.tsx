import React, { useState, useCallback, useRef } from 'react';
import type { Point3D } from './types';
import BezierCanvas from './components/BezierCanvas';
import ControlPanel from './components/ControlPanel';

const initialPoints: Point3D[] = [
  { x: 100, y: 400, z: 0 },
  { x: 300, y: 400, z: 50 },
  { x: 500, y: 100, z: -50 },
  { x: 700, y: 100, z: 0 },
];

const App: React.FC = () => {
  const [controlPoints, setControlPoints] = useState<Point3D[]>(initialPoints);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [showConstruction, setShowConstruction] = useState<boolean>(false);
  const [tValue, setTValue] = useState<number>(0.5);
  const [showCurve, setShowCurve] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointUpdate = useCallback((index: number, newPoint: Point3D) => {
    setShowCurve(false);
    setControlPoints(prevPoints => {
      const newPoints = [...prevPoints];
      newPoints[index] = newPoint;
      return newPoints;
    });
  }, []);

  const addPoint = useCallback(() => {
    setShowCurve(false);
    const lastPoint = controlPoints[controlPoints.length - 1] || { x: 400, y: 300, z: 0 };
    const newPoint = { x: lastPoint.x + 50, y: lastPoint.y - 50, z: lastPoint.z };
    setControlPoints(prev => [...prev, newPoint]);
    setSelectedPointIndex(controlPoints.length);
  }, [controlPoints]);

  const removePoint = useCallback((index: number) => {
    setShowCurve(false);
    setControlPoints(prev => prev.filter((_, i) => i !== index));
    if (selectedPointIndex === index) {
      setSelectedPointIndex(null);
    } else if (selectedPointIndex && selectedPointIndex > index) {
      setSelectedPointIndex(prev => (prev ? prev - 1 : null));
    }
  }, [selectedPointIndex]);

  const handleCanvasPointsUpdate = useCallback((updater: React.SetStateAction<Point3D[]>) => {
    setShowCurve(false);
    setControlPoints(updater);
  }, []);

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-100 text-slate-800">
      <header className="p-4 bg-white shadow-md text-center z-10">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-wider">CAD ASSIGNMENT : BEZIER CURVE</h1>
        <p className="text-lg text-slate-600">Soham Burhan_68</p>
      </header>
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <ControlPanel
          points={controlPoints}
          selectedPointIndex={selectedPointIndex}
          onPointUpdate={handlePointUpdate}
          onAddPoint={addPoint}
          onRemovePoint={removePoint}
          onSelectPoint={setSelectedPointIndex}
          svgRef={svgRef}
          showConstruction={showConstruction}
          setShowConstruction={setShowConstruction}
          tValue={tValue}
          setTValue={setTValue}
          onMakeCurve={() => setShowCurve(true)}
        />
        <main className="flex-1 flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
          <BezierCanvas
            points={controlPoints}
            setPoints={handleCanvasPointsUpdate}
            selectedPointIndex={selectedPointIndex}
            setSelectedPointIndex={setSelectedPointIndex}
            svgRef={svgRef}
            showConstruction={showConstruction}
            tValue={tValue}
            showCurve={showCurve}
          />
        </main>
      </div>
    </div>
  );
};

export default App;