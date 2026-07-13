import type { MarketingModel } from "../build-rental-command-model";

const IMPACT_STYLE: Record<string, string> = {
  High: "text-emerald-500",
  Medium: "text-amber-500",
  Low: "text-zinc-400",
};

export function MarketingStrategy({ data }: { data: MarketingModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Marketing Strategy
      </h2>

      <div className="flex flex-col gap-3">
        {data.recommendations.map((r) => (
          <div
            key={r.label}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{r.icon}</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{r.label}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{r.reason}</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Impact</span>
                <span className={`text-xs font-semibold ${IMPACT_STYLE[r.estimatedImpact] ?? "text-zinc-500"}`}>
                  {r.estimatedImpact}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Cost</span>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{r.estimatedCost}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Leads</span>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{r.estimatedLeads}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
