import type { CompetitionModel } from "../build-rental-command-model";

export function CompetitionOverview({ data }: { data: CompetitionModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Competition Summary
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {data.summary.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {kpi.label}
            </span>
            <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {kpi.value}
            </span>
            {kpi.detail && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{kpi.detail}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {data.competitors.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {c.price} <span className="text-xs font-normal text-zinc-400">AED/yr</span>
              </span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {c.bedrooms} BR · {c.view}
              </span>
            </div>
            <span className="mt-1 block text-xs text-zinc-400 dark:text-zinc-500">{c.agency}</span>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Strength</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{c.strength}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Weakness</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{c.weakness}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
