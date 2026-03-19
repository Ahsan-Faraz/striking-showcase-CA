export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white animate-pulse">
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white/10 flex-shrink-0" />
          <div className="space-y-4 flex-1">
            <div className="h-10 bg-white/10 rounded-lg w-64" />
            <div className="h-5 bg-white/5 rounded w-48" />
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <div className="h-8 bg-white/10 rounded w-40 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.04] border border-white/10 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
