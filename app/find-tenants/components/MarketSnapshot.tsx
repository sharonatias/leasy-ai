type KPI = {
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
};

const KPIS: KPI[] = [
  { label: "Market Demand", value: "HIGH", detail: "Based on area search volume", highlight: true },
  { label: "Competition", value: "37", detail: "Active listings nearby" },
  { label: "Average Price", value: "87,500", detail: "AED / year" },
  { label: "Your Price", value: "85,000", detail: "AED / year" },
  { label: "Price Position", value: "Below Avg", detail: "2,500 AED under market", highlight: true },
  { label: "Est. Days to Rent", value: "14", detail: "Based on similar units" },
];

const RECOMMENDATION = {
  title: "Recommendation",
  text: "Excellent pricing. Your unit is competitively positioned below the area average with strong amenities. High probability of fast tenant acquisition.",
};

export function MarketSnapshot() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Market Snapshot
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {kpi.label}
            </span>
            <span
              className={`text-xl font-bold tabular-nums ${
                kpi.highlight
                  ? "text-emerald-500"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
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

      <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-5 py-4 dark:border-emerald-800/40 dark:bg-emerald-900/20">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {RECOMMENDATION.title}
        </span>
        <p className="mt-1.5 text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">
          {RECOMMENDATION.text}
        </p>
      </div>
    </section>
  );
}
