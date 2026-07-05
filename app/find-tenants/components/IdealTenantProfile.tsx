type TenantProfile = {
  audience: string;
  matchScore: number;
  reasons: string[];
};

const PROFILES: TenantProfile[] = [
  {
    audience: "Young Professionals",
    matchScore: 5,
    reasons: ["Close to business districts", "Pool & Gym", "Fully Furnished"],
  },
  {
    audience: "Young Couples",
    matchScore: 4,
    reasons: ["2-bedroom layout", "Modern interiors", "Community amenities"],
  },
  {
    audience: "Small Families",
    matchScore: 3,
    reasons: ["Kids playground", "Secure building", "Spacious 1,200 sqft"],
  },
  {
    audience: "Investors",
    matchScore: 3,
    reasons: ["High rental yield area", "Strong demand", "Low vacancy rate"],
  },
];

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

export function IdealTenantProfile() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Ideal Tenant Profile
      </h2>

      <div className="flex flex-col gap-3">
        {PROFILES.map((p) => (
          <div
            key={p.audience}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {p.audience}
              </span>
              <Stars count={p.matchScore} />
            </div>
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
