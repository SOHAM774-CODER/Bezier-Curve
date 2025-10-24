import React from 'react';
import type { Point3D } from '../types';
import { CurveIcon, DownloadIcon, PlusIcon, TrashIcon } from './icons';


interface ControlPanelProps {
  points: Point3D[];
  selectedPointIndex: number | null;
  onPointUpdate: (index: number, newPoint: Point3D) => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
  onSelectPoint: (index: number | null) => void;
  svgRef: React.RefObject<SVGSVGElement>;
  showConstruction: boolean;
  setShowConstruction: (show: boolean) => void;
  tValue: number;
  setTValue: (t: number) => void;
  onMakeCurve: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  points,
  selectedPointIndex,
  onPointUpdate,
  onAddPoint,
  onRemovePoint,
  onSelectPoint,
  svgRef,
  showConstruction,
  setShowConstruction,
  tValue,
  setTValue,
  onMakeCurve
}) => {
  const handleCoordinateChange = (
    index: number,
    axis: 'x' | 'y' | 'z',
    value: string
  ) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const point = points[index];
      onPointUpdate(index, { ...point, [axis]: numericValue });
    }
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const a = document.createElement("a");
    a.download = "bezier-curve.svg";
    a.href = url;
    a.click();
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white shadow-lg flex flex-col h-1/3 md:h-full">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-700">3D Bezier Creator</h1>
        <p className="text-sm text-slate-500">Click canvas to add points. Drag to move.</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-600">Control Points</h2>
          <button onClick={onAddPoint} className="p-2 rounded-full text-sky-600 hover:bg-sky-100 transition-colors">
            <PlusIcon />
          </button>
        </div>
        
        <div className="space-y-2 max-h-60 md:max-h-none overflow-y-auto pr-2">
          {points.map((p, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg border-2 transition-colors ${selectedPointIndex === i ? 'border-orange-400 bg-orange-50' : 'border-transparent bg-slate-100'}`}
              onClick={() => onSelectPoint(i)}
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-700 w-8">P{i}</span>
                <div className="flex-1 grid grid-cols-3 gap-x-2">
                    <div className="flex items-center space-x-1">
                        <label className="font-mono text-sm text-slate-500">X</label>
                        <input
                            type="number"
                            value={Math.round(p.x)}
                            onChange={e => handleCoordinateChange(i, 'x', e.target.value)}
                            className="w-full p-1 rounded-md border border-slate-200 bg-slate-50 text-center focus:bg-white focus:border-sky-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="flex items-center space-x-1">
                        <label className="font-mono text-sm text-slate-500">Y</label>
                        <input
                            type="number"
                            value={Math.round(p.y)}
                            onChange={e => handleCoordinateChange(i, 'y', e.target.value)}
                            className="w-full p-1 rounded-md border border-slate-200 bg-slate-50 text-center focus:bg-white focus:border-sky-400 focus:outline-none transition-colors"
                        />
                    </div>
                     <div className="flex items-center space-x-1">
                        <label className="font-mono text-sm text-slate-500">Z</label>
                        <input
                            type="number"
                            value={Math.round(p.z)}
                            onChange={e => handleCoordinateChange(i, 'z', e.target.value)}
                            className="w-full p-1 rounded-md border border-slate-200 bg-slate-50 text-center focus:bg-white focus:border-sky-400 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onRemovePoint(i); }} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
          {points.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No control points.</p>}
        </div>
        
        <div>
          <h3 className="text-md font-semibold text-slate-600 mb-2">Visualization</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-700">Show Construction</span>
            <div className="relative">
              <input type="checkbox" checked={showConstruction} onChange={(e) => setShowConstruction(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </div>
          </label>
          {showConstruction && (
            <div className="mt-2">
              <label htmlFor="t-slider" className="text-sm font-mono">t = {tValue.toFixed(2)}</label>
              <input 
                id="t-slider"
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={tValue} 
                onChange={(e) => setTValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-slate-200 space-y-2">
        <button
          onClick={onMakeCurve}
          disabled={points.length < 2}
          className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <CurveIcon />
          <span className="ml-2">Make Curve</span>
        </button>
        <button
          onClick={handleDownloadSVG}
          className="w-full flex items-center justify-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold"
        >
          <DownloadIcon />
          <span className="ml-2">Download as SVG</span>
        </button>
      </div>
    </aside>
  );
};

export default ControlPanel;