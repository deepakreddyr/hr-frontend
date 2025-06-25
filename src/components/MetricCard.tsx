
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'primary' | 'accent' | 'success' | 'warning';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary' 
}) => {
  const colorClasses = {
    primary: 'from-primary to-blue-600',
    accent: 'from-accent to-purple-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600'
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} glow-primary`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm text-green-400 font-medium">
            {trend}
          </span>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-2">{value}</h3>
      <p className="text-muted-foreground text-sm">{title}</p>
    </div>
  );
};

export default MetricCard;
