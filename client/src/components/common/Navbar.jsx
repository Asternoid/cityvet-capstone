import React from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar({ title = 'CityVet', subtitle = 'Office of the City Veterinarian', tabs = [], activeTab, onSelect, userName = 'Client' }) {
  return (
    <header className="rounded-card border border-gray-light bg-white p-4 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-card bg-teal-deep text-xl font-bold text-white shadow-card">
            C
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">{subtitle}</p>
            <h1 className="font-display text-xl font-bold text-charcoal sm:text-2xl">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onSelect?.(tab)}
                className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  activeTab === tab ? 'bg-teal-deep text-white' : 'bg-off-white text-charcoal hover:bg-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-btn border border-gray-light bg-off-white px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-deep text-xs font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-charcoal">{userName}</span>
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
}
