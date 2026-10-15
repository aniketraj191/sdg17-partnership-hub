import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm animate-pulse flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-24 bg-slate-200 rounded-md" />
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-full bg-slate-100 rounded mb-1" />
        <div className="h-4 w-5/6 bg-slate-100 rounded mb-4" />
      </div>
      <div className="pt-4 border-t border-slate-100">
        <div className="h-3 w-1/2 bg-slate-200 rounded mb-2" />
        <div className="h-2 w-full bg-slate-100 rounded-full" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 w-1/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/6 bg-slate-100 rounded" />
            <div className="h-4 w-1/5 bg-slate-200 rounded" />
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const Spinner = ({ size = 'w-6 h-6', className = 'text-forest-600' }) => {
  return (
    <svg
      className={`animate-spin ${size} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};
