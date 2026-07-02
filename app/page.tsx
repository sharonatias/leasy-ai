import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PropertyRow = {
  id: string;
  unit_number: string;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  size_sqft: number | null;
  view_type: string | null;
  furnishing: string | null;
  condition: string | null;
  availability_date: string | null;
  building_id: string | null;
  updated_at: string;
  buildings: { name: string } | null;
};

type RentalRow = {
  property_id: string;
  asking_price_aed: number | null;
  payment_schedule: string | null;
  security_deposit_aed: number | null;
};

type MediaRow = {
  property_id: string;
};

type ListingRow = {
  property_id: string;
};

function calculateReadiness(
  property: PropertyRow,
  rental: RentalRow | undefined,
  mediaCount: number
): number {
  let completed = 0;

  if (property.building_id != null && property.unit_number != null) completed++;

  if (
    property.bedrooms != null &&
    property.bathrooms != null &&
    property.floor != null &&
    property.size_sqft != null
  )
    completed++;

  if (
    property.view_type != null &&
    property.furnishing != null &&
    property.condition != null &&
    property.availability_date != null
  )
    completed++;

  if (
    rental &&
    rental.asking_price_aed != null &&
    rental.payment_schedule != null &&
    rental.security_deposit_aed != null
  )
    completed++;

  if (mediaCount >= 4) completed++;

  return Math.round((completed / 5) * 100);
}

function getStatus(readiness: number): string {
  if (readiness === 0) return "Not started";
  if (readiness === 100) return "Ready";
  return "In progress";
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function Home() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select(
      "id, unit_number, bedrooms, bathrooms, floor, size_sqft, view_type, furnishing, condition, availability_date, building_id, updated_at, buildings(name)"
    )
    .order("updated_at", { ascending: false });

  const allProperties = (properties ?? []) as unknown as PropertyRow[];

  let rentalMap = new Map<string, RentalRow>();
  let mediaCountMap = new Map<string, number>();

  if (allProperties.length > 0) {
    const propertyIds = allProperties.map((p) => p.id);

    const [{ data: rentals }, { data: mediaAssets }] = await Promise.all([
      supabase
        .from("rental_terms")
        .select("property_id, asking_price_aed, payment_schedule, security_deposit_aed")
        .in("property_id", propertyIds),
      supabase
        .from("media_assets")
        .select("property_id")
        .in("property_id", propertyIds)
        .eq("status", "uploaded"),
    ]);

    for (const r of (rentals ?? []) as RentalRow[]) {
      rentalMap.set(r.property_id, r);
    }

    for (const m of (mediaAssets ?? []) as MediaRow[]) {
      mediaCountMap.set(m.property_id, (mediaCountMap.get(m.property_id) ?? 0) + 1);
    }
  }

  const cards = allProperties.map((property) => {
    const rental = rentalMap.get(property.id);
    const mediaCount = mediaCountMap.get(property.id) ?? 0;
    const readiness = calculateReadiness(property, rental, mediaCount);
    const status = getStatus(readiness);

    return {
      id: property.id,
      buildingName: property.buildings?.name ?? "Unknown building",
      unitNumber: property.unit_number,
      readiness,
      status,
      updatedAt: formatTimeAgo(property.updated_at),
    };
  });

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Leasy AI
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {cards.length > 0
              ? "Your properties"
              : "Prepare your first Dubai property for leasing."}
          </p>
        </div>

        {cards.length > 0 && (
          <div className="flex flex-col gap-3">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/onboarding/review?propertyId=${card.id}`}
                data-testid="property-card"
                className="group flex flex-col gap-3 rounded-lg border border-zinc-200 px-5 py-4 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {card.buildingName}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Unit {card.unitNumber}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
                    Continue →
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          card.readiness === 100
                            ? "bg-emerald-500"
                            : "bg-zinc-900 dark:bg-zinc-50"
                        }`}
                        style={{ width: `${card.readiness}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      {card.readiness}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      card.status === "Ready"
                        ? "text-emerald-500"
                        : card.status === "In progress"
                          ? "text-amber-500"
                          : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {card.status}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {card.updatedAt}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/onboarding"
          className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Property
        </Link>
      </main>
    </div>
  );
}
