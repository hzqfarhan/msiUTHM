export default function PrayerLoading() {
    return (
        <div className="space-y-4">
            <div>
                <div className="h-7 w-40 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-64 rounded-lg bg-muted animate-pulse mt-1.5" />
            </div>

            {/* Date */}
            <div className="h-4 w-48 mx-auto rounded bg-muted animate-pulse" />

            {/* Prayer grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card rounded-xl px-3 py-2.5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="h-3.5 w-14 rounded bg-muted animate-pulse" />
                                <div className="h-2.5 w-10 rounded bg-muted animate-pulse" />
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                                <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Source text */}
            <div className="h-3 w-72 mx-auto rounded bg-muted animate-pulse" />
        </div>
    );
}
