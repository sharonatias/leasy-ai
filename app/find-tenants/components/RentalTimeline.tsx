import type { TimelineModel } from "../build-rental-command-model";

export function RentalTimeline({ data }: { data: TimelineModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Rental Timeline
      </h2>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {data.entries.map((entry, i) => (
          <div
            key={entry.day}
            className={`flex items-start gap-4 px-5 py-3.5 ${
              i < data.entries.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
            }`}
          >
            <div className="flex w-12 flex-col items-center">
              <span className="text-xs font-bold tabular-nums text-emerald-500">Day {entry.day}</span>
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{entry.label}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{entry.action}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
