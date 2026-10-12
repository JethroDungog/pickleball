export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--apple-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-black/10 dark:border-white/10 border-t-black dark:border-t-white animate-spin" />
        <span className="text-xs text-[var(--apple-subtext)] tracking-wider">Loading...</span>
      </div>
    </div>
  )
}
