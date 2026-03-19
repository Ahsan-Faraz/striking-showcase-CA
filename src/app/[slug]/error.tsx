'use client';

export default function PublicProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        We could not load this profile. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/20 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
