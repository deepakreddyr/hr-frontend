
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
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className="glass-card rounded-2xl p-6 hover-glow group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-sm`}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>

        {trend && (
          <span className="text-xs text-green-500 font-semibold px-2 py-1 bg-green-500/10 rounded-full">
            {trend}
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{title}</p>
    </div>
  );
};

export default MetricCard;
