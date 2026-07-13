import type { BrokerModel } from "../build-rental-command-model";

export function BrokerOpportunities({ data }: { data: BrokerModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Broker Intelligence
      </h2>

      <div className="flex flex-col gap-3">
        {data.brokers.map((b) => (
          <div
            key={b.name}
            className={`rounded-xl border bg-white px-5 py-4 dark:bg-zinc-900 ${
              b.recommended
                ? "border-emerald-200/60 dark:border-emerald-800/40"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{b.name}</span>
                {b.recommended && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    Recommended
                  </span>
                )}
              </div>
              <span className="text-xs font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
                {b.listingsInBuilding} listings
              </span>
            </div>
            <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{b.specialization}</span>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">{b.reason}</p>
            <a
              href={b.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-block text-xs font-medium text-blue-500 hover:text-blue-400"
            >
              Visit Website
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
