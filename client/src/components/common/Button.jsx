const variants = {
  primary: 'bg-teal-deep text-white hover:bg-teal-mid',
  secondary: 'border border-teal-deep bg-white text-teal-deep hover:bg-green-light',
  danger: 'bg-red-muted text-white hover:opacity-90',
  ghost: 'bg-transparent text-teal-deep hover:bg-off-white',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-btn px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
