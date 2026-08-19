import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'pending_technician_confirmation', label: 'Pending' },
  { key: 'technician_confirmed', label: 'Confirmed' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

export default function StatusStepper({ status, statusLog = [] }) {
  if (status === 'no_show' || status === 'cancelled') {
    const noShow = status === 'no_show';
    return (
      <div className={`rounded-xl px-4 py-3 text-sm font-medium ${noShow ? 'bg-red-light text-red-muted' : 'bg-off-white text-gray-mid'}`}>
        This appointment was {noShow ? 'marked as no-show.' : 'cancelled.'}
      </div>
    );
  }

  const currentIndex = Math.max(0, STEPS.findIndex((step) => step.key === status));

  return (
    <div className="flex w-full items-start">
      {STEPS.map((step, index) => {
        const complete = index < currentIndex;
        const current = index === currentIndex;
        const timestamp = statusLog.find((entry) => entry.new_status === step.key)?.changed_at;

        return (
          <React.Fragment key={step.key}>
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${complete || current ? 'bg-teal-deep text-white' : 'border-2 border-gray-light bg-white text-gray-mid'} ${current ? 'ring-4 ring-teal-deep/10' : ''}`}>
                {complete ? <Check size={15} strokeWidth={3} /> : index + 1}
              </div>
              <span className={`mt-2 text-xs ${current ? 'font-semibold text-teal-deep' : 'text-gray-mid'}`}>{step.label}</span>
              {timestamp && <span className="mt-1 hidden text-[10px] text-gray-mid sm:block">{new Date(timestamp).toLocaleDateString('en-PH')}</span>}
            </div>
            {index < STEPS.length - 1 && <div className={`mt-4 h-0.5 flex-1 ${index < currentIndex ? 'bg-teal-deep' : 'bg-gray-light'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
