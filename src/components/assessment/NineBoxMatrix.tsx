import React from 'react';

interface NineBoxProps {
  hardScore: number;
  softScore: number;
}

const NineBoxMatrix: React.FC<NineBoxProps> = ({ hardScore, softScore }) => {
  // Convert scores (0-10) to grid position (0-2)
  const getGridPosition = (score: number) => {
    if (score <= 3.33) return 0;
    if (score <= 6.66) return 1;
    return 2;
  };

  const hardPos = getGridPosition(hardScore);
  const softPos = getGridPosition(softScore);

  const labels = {
    x: ['Baixo', 'Médio', 'Alto'],
    y: ['Baixo', 'Médio', 'Alto']
  };

  const getQuadrantColor = (x: number, y: number) => {
    const score = x + y;
    if (score <= 1) return 'bg-red-100 border-red-300';
    if (score <= 3) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriz 9-Box</h3>
      <p className="text-sm text-gray-600 mb-6">Hard Skills vs Soft Skills</p>
      
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
          <span className="text-sm font-medium text-gray-700">Soft Skills</span>
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-3 gap-1 w-64 h-64 mx-auto">
          {Array.from({ length: 9 }, (_, i) => {
            const x = i % 3;
            const y = Math.floor(i / 3);
            const isUserPosition = x === hardPos && (2 - y) === softPos;
            
            return (
              <div
                key={i}
                className={`border-2 flex items-center justify-center relative ${
                  getQuadrantColor(x, 2 - y)
                } ${isUserPosition ? 'ring-4 ring-blue-500' : ''}`}
              >
                {isUserPosition && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* X-axis label */}
        <div className="text-center mt-4">
          <span className="text-sm font-medium text-gray-700">Hard Skills</span>
        </div>
        
        {/* Axis labels */}
        <div className="flex justify-between mt-2 px-8">
          {labels.x.map((label, index) => (
            <span key={index} className="text-xs text-gray-500">{label}</span>
          ))}
        </div>
        
        <div className="absolute -left-8 top-0 h-full flex flex-col justify-between py-4">
          {labels.y.reverse().map((label, index) => (
            <span key={index} className="text-xs text-gray-500 transform -rotate-90">{label}</span>
          ))}
        </div>
      </div>
      
      {/* Score Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div 
          onClick={() => {
            alert(`Hard Skills: ${hardScore.toFixed(1)}/10\nBaseado em competências técnicas`);
          }}
          className="text-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <p className="text-sm text-gray-600">Hard Skills</p>
          <p className="text-xl font-bold text-blue-600">{hardScore.toFixed(1)}</p>
        </div>
        <div 
          onClick={() => {
            alert(`Soft Skills: ${softScore.toFixed(1)}/10\nBaseado em competências comportamentais`);
          }}
          className="text-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
        >
          <p className="text-sm text-gray-600">Soft Skills</p>
          <p className="text-xl font-bold text-green-600">{softScore.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

export default NineBoxMatrix;