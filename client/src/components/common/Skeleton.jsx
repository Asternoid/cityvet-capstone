import React from 'react';

export function Skeleton({ className = '' }) {
  return <span className={`skeleton block rounded-md ${className}`} aria-hidden="true" />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border-l-[6px] border-gray-200 bg-white p-5 shadow-sm"><Skeleton className="h-4 w-36" /><Skeleton className="mt-4 h-6 w-52" /><Skeleton className="mt-3 h-4 w-40" /><Skeleton className="mt-4 h-6 w-28" /></section>
        <section className="rounded-xl border-l-[6px] border-gray-200 bg-white p-5 shadow-sm"><Skeleton className="h-4 w-28" /><Skeleton className="mt-4 h-9 w-12" /><Skeleton className="mt-3 h-4 w-44" /><Skeleton className="mt-4 h-4 w-28" /></section>
      </div>
      <section className="rounded-xl bg-white p-6 shadow-sm"><Skeleton className="h-6 w-44" /><div className="mt-6 space-y-5">{[1, 2, 3].map((item) => <div key={item} className="flex items-center justify-between border-b border-gray-100 pb-4"><div className="w-2/3"><Skeleton className="h-4 w-48" /><Skeleton className="mt-2 h-3 w-36" /></div><Skeleton className="h-6 w-24" /></div>)}</div></section>
    </div>
  );
}

export function BookingHistorySkeleton() {
  return <div className="overflow-hidden rounded-xl bg-white shadow-sm" aria-busy="true" aria-label="Loading appointment history"><div className="space-y-5 p-6 md:hidden">{[1, 2, 3].map((item) => <div key={item} className="border-b border-gray-100 pb-5"><Skeleton className="h-4 w-32" /><Skeleton className="mt-3 h-5 w-56" /><Skeleton className="mt-2 h-4 w-40" /><Skeleton className="mt-3 h-6 w-24" /></div>)}</div><table className="hidden w-full text-sm md:table"><thead><tr className="border-b border-gray-100 bg-gray-50"><th colSpan={6} className="px-6 py-4"><Skeleton className="h-3 w-full" /></th></tr></thead><tbody className="divide-y divide-gray-100">{[1, 2, 3, 4].map((item) => <tr key={item}>{[1, 2, 3, 4, 5, 6].map((cell) => <td key={cell} className="px-6 py-5"><Skeleton className={`h-4 ${cell === 2 ? 'w-40' : 'w-24'}`} /></td>)}</tr>)}</tbody></table></div>;
}

export function NotificationsSkeleton() {
  return <div className="space-y-3" aria-busy="true" aria-label="Loading notifications">{[1, 2, 3].map((item) => <div key={item} className="rounded-lg border-l-[6px] border-gray-200 bg-white p-5 shadow-sm"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-3 h-3 w-32" /></div>)}</div>;
}

export function BookingFormSkeleton() {
  return <div className="space-y-6" aria-busy="true" aria-label="Loading booking options"><div><Skeleton className="h-5 w-32" /><Skeleton className="mt-2 h-12 w-full" /></div><div><Skeleton className="h-5 w-28" /><Skeleton className="mt-2 h-12 w-full" /></div><div><Skeleton className="h-5 w-28" /><Skeleton className="mt-2 h-12 w-full" /></div><div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <Skeleton key={item} className="h-12" />)}</div><Skeleton className="h-24 w-full" /><Skeleton className="h-12 w-full" /></div>;
}
