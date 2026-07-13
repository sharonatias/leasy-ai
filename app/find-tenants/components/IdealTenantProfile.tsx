import type { AudienceModel } from "../build-rental-command-model";

function Stars({ count }: { count: number }) {
  return (
    <span className="text-xs tracking-wide">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function IdealTenantProfile({ data }: { data: AudienceModel }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Audience Intelligence
      </h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Primary</span>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{data.primaryAudience}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Secondary</span>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{data.secondaryAudience}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Confidence</span>
          <span className={`text-xs font-semibold ${data.confidence === "High" ? "text-emerald-500" : "text-amber-500"}`}>
            {data.confidence}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {data.profiles.map((p) => (
          <div
            key={p.audience}
            className={`rounded-xl border bg-white px-5 py-4 dark:bg-zinc-900 ${
              p.isPrimary
                ? "border-emerald-200/60 dark:border-emerald-800/40"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.audience}
                </span>
                {p.isPrimary && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    Primary
                  </span>
                )}
              </div>
              <Stars count={p.matchScore} />
            </div>
            <span className="mt-1 block text-[11px] text-zinc-400 dark:text-zinc-500">
              Est. audience: {p.estimatedSize}
            </span>
            <div className="mt-2.5 flex flex-col gap-1">
              {p.reasons.map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-500">●</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{r}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
