type Broker = {
  name: string;
  specialization: string;
  listingsInBuilding: number;
  website: string;
};

const BROKERS: Broker[] = [
  {
    name: "Allsopp & Allsopp",
    specialization: "Dubai residential rentals",
    listingsInBuilding: 5,
    website: "https://www.allsoppandallsopp.com",
  },
  {
    name: "Betterhomes",
    specialization: "Premium apartments & villas",
    listingsInBuilding: 3,
    website: "https://www.betterhomes.com",
  },
  {
    name: "Driven Properties",
    specialization: "Off-plan & secondary market",
    listingsInBuilding: 2,
    website: "https://www.drivenproperties.ae",
  },
];

export function BrokerOpportunities() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Broker Opportunities
      </h2>

      <div className="flex flex-col gap-3">
        {BROKERS.map((b) => (
          <div
            key={b.name}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {b.name}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {b.specialization}
              </span>
              <span className="text-[11px] font-medium text-amber-500">
                {b.listingsInBuilding} listings in this building
              </span>
            </div>
            <a
              href={b.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Website
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
