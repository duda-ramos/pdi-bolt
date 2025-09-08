import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div 
      onClick={() => {
        alert(`${title}: ${value}\nClique para ver detalhes`);
      }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:scale-105"
    >
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs. mês anterior</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;