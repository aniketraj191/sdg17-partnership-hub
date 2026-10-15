import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Completed: 'bg-teal-100 text-teal-800 border-teal-200',
    Planned: 'bg-blue-100 text-blue-800 border-blue-200',
    Confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Unread: 'bg-sky-100 text-sky-800 border-sky-200',
    Read: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status}
    </span>
  );
};

export const SdgCategoryBadge = ({ category, sdgNumber }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-forest-50 text-forest-800 border border-forest-200">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-forest-700 text-white text-[10px] font-bold">
        {sdgNumber || 17}
      </span>
      {category}
    </span>
  );
};

export const DemoDataBadge = () => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60" title="Demonstration sample record">
      Demo Record
    </span>
  );
};
