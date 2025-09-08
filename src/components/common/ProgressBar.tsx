import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  color = 'blue',
  size = 'md',
  showPercentage = true
}) => {
  const percentage = Math.min((current / total) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div 
        className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden cursor-pointer`}
        onClick={() => {
          if (label) {
            alert(`${label}: ${current}/${total} (${Math.round(percentage)}%)`);
          }
        }}
      >
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {!label && showPercentage && (
        <div className="text-center mt-1">
          <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;