import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'forest',
  badgeText,
}) => {
  const colorMap = {
    forest: 'bg-forest-50 text-forest-700 border-forest-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  const chosenColor = colorMap[color] || colorMap.forest;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${chosenColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        {badgeText && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs font-medium text-slate-500">{subtitle}</p>
      )}
    </div>
  );
};
