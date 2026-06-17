// Skeleton shown instantly while the installations server data loads — avoids
// the blank flash that made navigation feel laggy on mobile.
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="h-7 w-40 rounded-lg bg-gray-200" />
        <div className="h-10 w-44 rounded-xl bg-gray-200 hidden sm:block" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[68px] rounded-2xl bg-white border border-gray-100 flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-16 rounded bg-gray-200" />
              <div className="h-4 w-10 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[42px] w-28 rounded-xl bg-gray-200 flex-shrink-0" />
        ))}
      </div>

      {/* Search */}
      <div className="h-11 w-full rounded-xl bg-gray-100 mb-4" />

      {/* Rows */}
      <div className="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200 hidden sm:block" />
            <div className="h-4 w-20 rounded bg-gray-200 hidden md:block ml-auto" />
            <div className="h-6 w-16 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
