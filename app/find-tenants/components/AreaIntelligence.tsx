type AreaItem = {
  category: string;
  name: string;
  distance: string;
  relevance: string;
  icon: string;
};

const AREA_ITEMS: AreaItem[] = [
  { category: "Major Employer", name: "Dubai Silicon Oasis HQ", distance: "10 min", relevance: "Attracts tech professionals seeking nearby housing", icon: "🏢" },
  { category: "School", name: "GEMS Wellington Academy", distance: "8 min", relevance: "Top-rated school — key for family tenants", icon: "🎓" },
  { category: "University", name: "Heriot-Watt University Dubai", distance: "12 min", relevance: "Student and faculty housing demand", icon: "🏛️" },
  { category: "Shopping", name: "City Centre Al Zahia", distance: "5 min", relevance: "Daily convenience for all tenant profiles", icon: "🛒" },
  { category: "Entertainment", name: "IMG Worlds of Adventure", distance: "5 min", relevance: "Major attraction — appeals to families and young professionals", icon: "🎡" },
  { category: "Transportation", name: "Dubai Metro (Green Line)", distance: "15 min", relevance: "Public transit access increases tenant pool", icon: "🚇" },
];

export function AreaIntelligence() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Area Intelligence
      </h2>

      <div className="flex flex-col gap-0 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {AREA_ITEMS.map((item, i) => (
          <div
            key={item.name}
            className={`flex gap-3.5 px-5 py-4 ${
              i < AREA_ITEMS.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
            }`}
          >
            <span className="mt-0.5 text-base">{item.icon}</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {item.name}
                </span>
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {item.distance}
                </span>
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {item.category}
              </span>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.relevance}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
