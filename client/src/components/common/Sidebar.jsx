export default function Sidebar({ items = [], activeItem, onSelect }) {
  return (
    <aside className="rounded-card border border-gray-light bg-white p-3 shadow-card">
      <div className="mb-3 border-b border-gray-light pb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Portal</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onSelect?.(item)}
            className={`flex w-full items-center justify-between rounded-btn px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${
              activeItem === item ? 'bg-teal-deep text-white' : 'text-charcoal hover:bg-off-white'
            }`}
          >
            <span>{item}</span>
            <span className="text-xs opacity-70">•</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
