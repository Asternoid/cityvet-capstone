export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-gray-mid">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-deep border-t-transparent" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
