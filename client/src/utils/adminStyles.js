// Shared Admin Panel Styling Constants

export const ADMIN_STYLES = {
  // Color Palette
  colors: {
    // Neutrals (Slate)
    slate: {
      50: 'bg-slate-50',
      100: 'bg-slate-100',
      200: 'bg-slate-200',
      300: 'bg-slate-300',
      600: 'text-slate-600',
      700: 'text-slate-700',
      800: 'text-slate-800',
    },
    // Brand Color (Emerald)
    brand: {
      500: 'bg-emerald-500',
      600: 'bg-emerald-600',
      700: 'bg-emerald-700',
      800: 'bg-emerald-800',
      900: 'bg-emerald-900',
      text: 'text-emerald-600',
      light: 'bg-emerald-50/50',
      border: 'border-emerald-200',
    },
    // Alert Color (Amber/Red)
    alert: {
      amber: {
        light: 'bg-amber-50/50',
        border: 'border-amber-200',
        text: 'text-amber-700',
      },
      red: {
        light: 'bg-red-50/50',
        border: 'border-red-200',
        text: 'text-red-700',
      },
    },
  },

  // Card Styling
  card: {
    base: 'bg-white rounded-lg border border-slate-200 shadow-sm',
    padding: 'p-4 sm:p-6',
    header: 'px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100',
    body: 'px-4 sm:px-6 py-4 sm:py-5',
  },

  // Table Styling
  table: {
    head: 'text-slate-600 bg-slate-50 border-b border-slate-200',
    headCell: 'px-6 py-3.5 font-semibold uppercase tracking-wider text-xs',
    body: 'divide-y divide-slate-100 bg-white',
    row: 'border-b border-slate-100 hover:bg-slate-50/50 transition-colors',
    cell: 'px-6 py-4',
  },

  // Typography
  typography: {
    pageTitle: 'text-3xl font-bold text-slate-900 tracking-tight',
    sectionHeader: 'text-xl font-semibold text-slate-800',
    subsectionHeader: 'text-lg font-semibold text-slate-700',
    label: 'text-sm font-semibold text-slate-700 uppercase tracking-wider',
    body: 'text-sm text-slate-600',
    smallText: 'text-xs text-slate-500',
  },

  // Spacing
  spacing: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4 sm:space-y-5',
    lg: 'space-y-6 sm:space-y-8',
  },

  // Button Styles
  button: {
    primary:
      'inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm',
    secondary:
      'inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-lg font-medium border border-slate-200 hover:bg-slate-50 transition-colors',
    danger:
      'inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm',
    sm: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors',
    smPrimary: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors',
    smSecondary: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors',
  },

  // Badge Styles
  badge: {
    base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    success: 'bg-emerald-50/50 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-50/50 text-amber-700 border border-amber-200',
    error: 'bg-red-50/50 text-red-700 border border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  },

  // Skeleton Loading
  skeleton: {
    base: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded',
    statCard: 'h-4 w-24 mb-3',
    statValue: 'h-8 w-16 mb-2',
    text: 'h-3 w-20',
  },

  // Status Colors
  status: {
    pending: 'bg-amber-50/50 border-amber-200 text-amber-700',
    active: 'bg-emerald-50/50 border-emerald-200 text-emerald-700',
    inactive: 'bg-slate-100 border-slate-200 text-slate-700',
    error: 'bg-red-50/50 border-red-200 text-red-700',
  },
};

// Helper function to merge class names
export const cn = (...classes) => classes.filter(Boolean).join(' ');

// Reusable component classes
export const COMPONENT_CLASSES = {
  StatCard: cn(
    ADMIN_STYLES.card.base,
    ADMIN_STYLES.card.padding
  ),
  Table: cn(
    'w-full text-sm text-left'
  ),
  TableHead: cn(
    ADMIN_STYLES.table.head
  ),
  TableBody: cn(
    ADMIN_STYLES.table.body
  ),
  TableRow: cn(
    ADMIN_STYLES.table.row
  ),
};
