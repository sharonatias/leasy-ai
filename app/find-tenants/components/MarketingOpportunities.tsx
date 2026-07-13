import type { MarketingItem } from "../load-market-profile";

export function MarketingOpportunities({ data }: { data: MarketingItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Marketing Opportunities
      </h2>

      <div className="flex flex-col gap-2">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-white/50 px-5 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/50"
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
