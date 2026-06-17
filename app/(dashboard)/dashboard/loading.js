// Skeleton shown instantly while dashboard server data loads — replaces the
// blank screen so navigation feels responsive on mobile.
export default function Loading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Hero */}
      <div className="h-28 md:h-32 rounded-2xl bg-gray-200" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-6 w-24 rounded bg-gray-200" />
            <div className="h-8 w-full rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className="h-72 rounded-2xl bg-white border border-gray-100" />
        <div className="h-72 rounded-2xl bg-white border border-gray-100" />
      </div>

      {/* Lower row */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-4">
        <div className="h-64 rounded-2xl bg-white border border-gray-100" />
        <div className="h-64 rounded-2xl bg-white border border-gray-100" />
      </div>
    </div>
  );
}
