type Competitor = {
  price: string;
  bedrooms: number;
  view: string;
  agency: string;
  strength: string;
  weakness: string;
};

const COMPETITORS: Competitor[] = [
  {
    price: "82,000",
    bedrooms: 2,
    view: "Community View",
    agency: "Allsopp & Allsopp",
    strength: "Lower price point",
    weakness: "No pool view, unfurnished",
  },
  {
    price: "90,000",
    bedrooms: 2,
    view: "Pool View",
    agency: "Betterhomes",
    strength: "Same view type, established agency",
    weakness: "Higher price, smaller layout",
  },
  {
    price: "88,000",
    bedrooms: 2,
    view: "Garden View",
    agency: "Driven Properties",
    strength: "Garden view premium",
    weakness: "Semi-furnished, older fit-out",
  },
  {
    price: "95,000",
    bedrooms: 3,
    view: "Pool View",
    agency: "Haus & Haus",
    strength: "3 bedrooms, larger unit",
    weakness: "Significantly higher price",
  },
];

export function CompetitionOverview() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Competition Overview
      </h2>

      <div className="flex flex-col gap-3">
        {COMPETITORS.map((c, i) => (
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

            <span className="mt-1 block text-xs text-zinc-400 dark:text-zinc-500">
              {c.agency}
            </span>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                  Strength
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{c.strength}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                  Weakness
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{c.weakness}</span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-3 w-full rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
            >
              View Listing
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
