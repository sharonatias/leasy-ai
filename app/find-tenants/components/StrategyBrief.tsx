import type { StrategyBriefModel } from "../build-rental-command-model";

const STATUS_STYLES = {
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  red: "text-red-400",
};

export function StrategyBrief({ data }: { data: StrategyBriefModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        AI Strategy Brief
      </h2>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="grid grid-cols-2 gap-0">
          <div className="border-b border-r border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Success Probability
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-500">{data.successProbability}%</p>
          </div>
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Expected Days
            </span>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{data.expectedDays}</p>
          </div>
          <div className="border-r border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Estimated Leads
            </span>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{data.estimatedLeads}</p>
          </div>
          <div className="px-5 py-4">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Market Status
            </span>
            <p className={`mt-1 text-lg font-bold ${STATUS_STYLES[data.marketStatusColor]}`}>
              {data.marketStatus}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Today&apos;s Strategy
          </span>
          <div className="mt-2 flex flex-col gap-1.5">
            {data.actions.map((a) => (
              <div key={a.label} className="flex items-center gap-2">
                <span className={`text-xs ${a.done ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600"}`}>
                  {a.done ? "✓" : "○"}
                </span>
                <span className={`text-sm ${a.done ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-900 font-medium dark:text-zinc-50"}`}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
