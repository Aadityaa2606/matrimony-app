// Skeleton shown while any admin page loads (the sidebar stays put).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-6">
        <div className="skeleton h-7 w-48" />
        <div className="skeleton mt-2 h-4 w-72 max-w-full" />
      </div>
      <div className="mb-4 flex gap-2">
        <div className="skeleton h-9 w-full max-w-sm rounded-lg" />
        <div className="skeleton h-9 w-20 rounded-lg" />
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 bg-zinc-50/70 px-4 py-3"><div className="skeleton h-3 w-1/3" /></div>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-0">
            <div className="skeleton size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-40 max-w-full" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton hidden h-5 w-20 rounded-full sm:block" />
            <div className="skeleton hidden h-3.5 w-24 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
