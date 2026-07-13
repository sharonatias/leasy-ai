import type { AreaIntelligenceModel } from "../build-rental-command-model";

export function AreaIntelligence({ data }: { data: AreaIntelligenceModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Area Intelligence
      </h2>

      <div className="flex flex-col gap-4">
        {data.groups.map((group) => (
          <div key={group.category}>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {group.category}
            </span>
            <div className="flex flex-col gap-0 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
              {group.items.map((item, i) => (
                <div
                  key={item.name}
                  className={`flex gap-3.5 px-5 py-3.5 ${
                    i < group.items.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
                  }`}
                >
                  <span className="mt-0.5 text-base">{item.icon}</span>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</span>
                      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{item.distance}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{item.relevance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
