export default function Loading() {
  const box = "rounded-xl border border-zinc-200 bg-white";
  return (
    <div aria-busy="true" aria-label="Loading" className="grid gap-6">
      <div className="skeleton h-4 w-16" />
      <div className={`${box} flex items-center gap-4 p-5`}>
        <div className="skeleton size-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-6 w-48 max-w-full" />
          <div className="skeleton h-4 w-64 max-w-full" />
        </div>
        <div className="hidden gap-2 md:flex">
          <div className="skeleton h-9 w-24 rounded-lg" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${box} p-5 lg:col-span-2`}>
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className={`${box} space-y-4 p-5`}>
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-4 w-full" />)}
        </div>
      </div>
    </div>
  );
}
