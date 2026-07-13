import type { MarketSnapshotModel } from "../build-rental-command-model";

const COLOR_MAP = {
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  red: "text-red-400",
  default: "text-zinc-900 dark:text-zinc-50",
};

export function MarketSnapshot({ data }: { data: MarketSnapshotModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Market Snapshot
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {data.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {kpi.label}
            </span>
            <span className={`text-xl font-bold tabular-nums ${COLOR_MAP[kpi.color]}`}>
              {kpi.value}
            </span>
            {kpi.detail && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {kpi.detail}
              </span>
            )}
          </div>
        ))}
      </div>

      {data.recommendation.text && (
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-5 py-4 dark:border-emerald-800/40 dark:bg-emerald-900/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {data.recommendation.title}
          </span>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">
            {data.recommendation.text}
          </p>
        </div>
      )}
    </section>
  );
}
