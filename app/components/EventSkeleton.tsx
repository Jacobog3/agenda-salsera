export default function EventSkeleton() {
    return (
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="animate-pulse">
          <div className="aspect-[16/9] w-full bg-neutral-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-24 rounded bg-neutral-200" />
            <div className="h-4 w-3/4 rounded bg-neutral-200" />
            <div className="flex gap-2">
              <div className="h-3 w-20 rounded bg-neutral-200" />
              <div className="h-3 w-24 rounded bg-neutral-200" />
              <div className="h-3 w-16 rounded bg-neutral-200" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="h-9 w-full rounded-xl bg-neutral-200" />
              <div className="h-9 w-full rounded-xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }