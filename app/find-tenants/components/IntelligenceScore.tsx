import type { IntelligenceScoreModel } from "../build-rental-command-model";

export function IntelligenceScore({ data }: { data: IntelligenceScoreModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Property Intelligence Score
      </h2>

      <div className="rounded-xl border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold tabular-nums ${data.total >= 80 ? "text-emerald-500" : data.total >= 60 ? "text-amber-500" : "text-zinc-900 dark:text-zinc-50"}`}>
            {data.total}
          </span>
          <span className="text-lg text-zinc-400 dark:text-zinc-500">/ 100</span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {data.categories.map((cat) => (
            <div key={cat.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{cat.label}</span>
                <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                  {cat.score}/{cat.max}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    cat.score / cat.max >= 0.8 ? "bg-emerald-500" :
                    cat.score / cat.max >= 0.6 ? "bg-amber-500" :
                    "bg-zinc-400 dark:bg-zinc-500"
                  }`}
                  style={{ width: `${(cat.score / cat.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {data.improvements.length > 0 && (
          <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              What will improve your score?
            </span>
            <div className="mt-2 flex flex-col gap-1.5">
              {data.improvements.map((imp) => (
                <div key={imp.label} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">+ {imp.label}</span>
                  <span className="text-xs font-medium text-emerald-500">{imp.impact}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
