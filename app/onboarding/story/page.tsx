"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type PropertyData = {
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  size_sqft: number | null;
  view_type: string | null;
  furnishing: string | null;
  condition: string | null;
  availability_date: string | null;
  buildings: {
    name: string;
    developer: string | null;
    amenities: string[] | null;
  } | null;
};

type RentalData = {
  asking_price_aed: number | null;
  payment_schedule: string | null;
  security_deposit_aed: number | null;
};

type ListingDraft = {
  title: string;
  description: string;
  highlights: string;
  amenities: string;
  headline: string;
  highlightPills: string[];
  trustSignals: string[];
};

function formatEnum(value: string | null): string {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrice(value: number | null): string {
  if (!value) return "—";
  return value.toLocaleString("en-AE");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function generateDraft(
  property: PropertyData,
  rental: RentalData | null
): ListingDraft {
  const building = property.buildings?.name ?? "the building";
  const developer = property.buildings?.developer;
  const bed = property.bedrooms ?? 0;
  const bath = property.bathrooms ?? 0;
  const flr = property.floor ?? 0;
  const sqft = property.size_sqft ?? 0;
  const view = formatEnum(property.view_type);
  const furn = formatEnum(property.furnishing);
  const cond = formatEnum(property.condition);
  const date = formatDate(property.availability_date);
  const price = formatPrice(rental?.asking_price_aed ?? null);
  const schedule = formatEnum(rental?.payment_schedule ?? null);

  const title = `${bed} BR Apartment in ${building}`;

  const descParts = [
    `${furn} ${bed}-bedroom, ${bath}-bathroom apartment on floor ${flr} of ${building}.`,
    `${sqft.toLocaleString()} sqft with ${view.toLowerCase()} views.`,
    cond ? `${cond} condition.` : "",
    `Available from ${date}.`,
    rental ? `Asking ${price} AED/year (${schedule.toLowerCase()}).` : "",
  ];
  const description = descParts.filter(Boolean).join(" ");

  const highlightItems = [
    view ? `${view} view` : "",
    furn ? furn : "",
    flr ? `Floor ${flr}` : "",
    sqft ? `${sqft.toLocaleString()} sqft` : "",
    cond ? `${cond} condition` : "",
    developer ? `by ${developer}` : "",
  ].filter(Boolean);
  const highlights = highlightItems.map((h) => `• ${h}`).join("\n");

  const buildingAmenities = property.buildings?.amenities;
  const amenities =
    buildingAmenities && buildingAmenities.length > 0
      ? buildingAmenities.map((a) => `• ${formatEnum(a)}`).join("\n")
      : "Building amenities will be added once available.";

  const headline = `Your next home in ${building} — ${bed} BR with ${view.toLowerCase()} views`;

  const highlightPills = [
    furn ? `${furn} & move-in ready` : "",
    sqft ? `Spacious ${sqft.toLocaleString()} sqft layout` : "",
    view ? `${view} views` : "",
    cond ? `${cond} condition` : "",
  ].filter(Boolean).slice(0, 4);

  const trustSignals = [
    "Secure inquiry",
    "Private viewing available",
    "Fast owner response",
  ];

  return { title, description, highlights, amenities, headline, highlightPills, trustSignals };
}

export default function PropertyStory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const editMode = searchParams.get("edit") === "true";

  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();

      const { data: existing } = await supabase
        .from("ai_generated_content")
        .select("content")
        .eq("property_id", propertyId)
        .eq("content_type", "marketing_description")
        .eq("is_current", true)
        .maybeSingle();

      if (existing) {
        try {
          const parsed = JSON.parse(existing.content);
          if (!parsed.highlightPills) parsed.highlightPills = [];
          if (!parsed.trustSignals) parsed.trustSignals = [];
          setDraft(parsed);
          setLoading(false);
          return;
        } catch {
          // fall through to regenerate
        }
      }

      const [{ data: property }, { data: rental }] = await Promise.all([
        supabase
          .from("properties")
          .select(
            "bedrooms, bathrooms, floor, size_sqft, view_type, furnishing, condition, availability_date, buildings(name, developer, amenities)"
          )
          .eq("id", propertyId)
          .single(),
        supabase
          .from("rental_terms")
          .select("asking_price_aed, payment_schedule, security_deposit_aed")
          .eq("property_id", propertyId)
          .maybeSingle(),
      ]);

      if (property) {
        setDraft(
          generateDraft(property as unknown as PropertyData, rental)
        );
      }

      setLoading(false);
    }

    load();
  }, [propertyId]);

  if (!propertyId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <main className="flex max-w-md flex-col items-center gap-6 text-center px-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Something went wrong
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No property found. Please start over.
          </p>
          <Link
            href="/onboarding/property"
            className="mt-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to Property Search
          </Link>
        </main>
      </div>
    );
  }

  if (loading || !draft) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Generating listing draft...
        </p>
      </div>
    );
  }

  function updateField(field: keyof ListingDraft, value: string) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleApprove() {
    if (!draft) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    await supabase
      .from("ai_generated_content")
      .update({ is_current: false })
      .eq("property_id", propertyId)
      .eq("content_type", "marketing_description");

    const { error: insertError } = await supabase
      .from("ai_generated_content")
      .insert({
        property_id: propertyId,
        content_type: "marketing_description",
        content: JSON.stringify(draft),
        is_current: true,
      });

    if (insertError) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }

    router.push(`/onboarding/review?propertyId=${propertyId}`);
  }

  const textareaClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 resize-y";

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Listing Draft
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review and edit your property listing. You can adjust any section
            before approving.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Property Title
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Description
            </label>
            <textarea
              value={draft.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={5}
              className={textareaClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Highlights
            </label>
            <textarea
              value={draft.highlights}
              onChange={(e) => updateField("highlights", e.target.value)}
              rows={4}
              className={textareaClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Amenities
            </label>
            <textarea
              value={draft.amenities}
              onChange={(e) => updateField("amenities", e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Suggested Headline
            </label>
            <input
              type="text"
              value={draft.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Highlight Pills
              </label>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {draft.highlightPills.length}/4
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Short phrases shown below the About section on the property page.
            </p>
            <div className="flex flex-col gap-2">
              {draft.highlightPills.map((pill, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={pill}
                    onChange={(e) => {
                      const updated = [...draft.highlightPills];
                      updated[i] = e.target.value;
                      setDraft((prev) => prev ? { ...prev, highlightPills: updated } : prev);
                    }}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = draft.highlightPills.filter((_, j) => j !== i);
                      setDraft((prev) => prev ? { ...prev, highlightPills: updated } : prev);
                    }}
                    className="rounded-lg border border-zinc-200 px-3 text-xs text-zinc-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-zinc-700 dark:text-zinc-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              {draft.highlightPills.length < 4 && (
                <button
                  type="button"
                  onClick={() => setDraft((prev) => prev ? { ...prev, highlightPills: [...prev.highlightPills, ""] } : prev)}
                  className="w-full rounded-lg border border-dashed border-zinc-200 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500"
                >
                  + Add highlight
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Trust Signals
              </label>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {draft.trustSignals.length}/3
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Shown inside the CTA card on the property page.
            </p>
            <div className="flex flex-col gap-2">
              {draft.trustSignals.map((signal, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={signal}
                    onChange={(e) => {
                      const updated = [...draft.trustSignals];
                      updated[i] = e.target.value;
                      setDraft((prev) => prev ? { ...prev, trustSignals: updated } : prev);
                    }}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = draft.trustSignals.filter((_, j) => j !== i);
                      setDraft((prev) => prev ? { ...prev, trustSignals: updated } : prev);
                    }}
                    className="rounded-lg border border-zinc-200 px-3 text-xs text-zinc-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-zinc-700 dark:text-zinc-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              {draft.trustSignals.length < 3 && (
                <button
                  type="button"
                  onClick={() => setDraft((prev) => prev ? { ...prev, trustSignals: [...prev.trustSignals, ""] } : prev)}
                  className="w-full rounded-lg border border-dashed border-zinc-200 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500"
                >
                  + Add trust signal
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={handleApprove}
            className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
              !submitting
                ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
                : "bg-zinc-900 text-white opacity-50 cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900"
            }`}
          >
            {submitting ? "Saving..." : "Approve Listing Draft"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
