import type { DistributionModel } from "../build-rental-command-model";

const STATUS_STYLE: Record<string, string> = {
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Ready: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Recommended: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Pending: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export function DistributionStrategy({ data }: { data: DistributionModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Distribution Strategy
      </h2>

      <div className="flex flex-col gap-0 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {data.channels.map((ch, i) => (
          <div
            key={ch.name}
            className={`flex items-center gap-3.5 px-5 py-3.5 ${
              i < data.channels.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
            }`}
          >
            <span className="text-lg">{ch.icon}</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{ch.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[ch.status] ?? STATUS_STYLE.Pending}`}>
                  {ch.status}
                </span>
              </div>
              <div className="flex gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                <span>Leads: {ch.expectedLeads}</span>
                <span>ROI: {ch.estimatedROI}</span>
                <span>{ch.mode}</span>
              </div>
            </div>
            <span
              className={`text-[10px] font-semibold uppercase ${
                ch.priority === "High"
                  ? "text-emerald-500"
                  : ch.priority === "Medium"
                  ? "text-amber-500"
                  : "text-zinc-400"
              }`}
            >
              {ch.priority}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
