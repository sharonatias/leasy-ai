"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type PropertyData = {
  unit_number: string;
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
  } | null;
};

type RentalData = {
  asking_price_aed: number | null;
  payment_schedule: string | null;
  security_deposit_aed: number | null;
};

type MediaRecord = {
  asset_type: string;
  url: string;
};

type ListingDraft = {
  title: string;
  description: string;
  highlights: string;
  amenities: string;
  headline: string;
};

function formatEnum(value: string | null): string {
  if (!value) return "—";
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

const MEDIA_LABELS: Record<string, string> = {
  living_room: "Living Room",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  view: "Balcony / View",
  building_exterior: "Building Exterior",
  floor_plan: "Floor Plan",
};

function generateMarkdown(
  property: PropertyData,
  rental: RentalData | null,
  draft: ListingDraft,
  media: MediaRecord[]
): string {
  const lines: string[] = [];

  lines.push(`# ${draft.title}`);
  lines.push("");
  lines.push(`> ${draft.headline}`);
  lines.push("");

  lines.push("## Description");
  lines.push("");
  lines.push(draft.description);
  lines.push("");

  lines.push("## Highlights");
  lines.push("");
  lines.push(draft.highlights);
  lines.push("");

  if (draft.amenities && !draft.amenities.includes("will be added")) {
    lines.push("## Amenities");
    lines.push("");
    lines.push(draft.amenities);
    lines.push("");
  }

  lines.push("## Property Facts");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|-------|-------|");
  lines.push(`| Unit | ${property.unit_number} |`);
  lines.push(`| Building | ${property.buildings?.name ?? "—"} |`);
  if (property.buildings?.developer) {
    lines.push(`| Developer | ${property.buildings.developer} |`);
  }
  lines.push(`| Bedrooms | ${property.bedrooms ?? "—"} |`);
  lines.push(`| Bathrooms | ${property.bathrooms ?? "—"} |`);
  lines.push(`| Floor | ${property.floor ?? "—"} |`);
  lines.push(
    `| Size | ${property.size_sqft ? `${property.size_sqft.toLocaleString()} sqft` : "—"} |`
  );
  lines.push(`| View | ${formatEnum(property.view_type)} |`);
  lines.push(`| Furnishing | ${formatEnum(property.furnishing)} |`);
  lines.push(`| Condition | ${formatEnum(property.condition)} |`);
  lines.push(`| Available | ${formatDate(property.availability_date)} |`);
  lines.push("");

  lines.push("## Rental Terms");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|-------|-------|");
  lines.push(
    `| Asking Price | ${rental ? `${formatPrice(rental.asking_price_aed)} AED/year` : "—"} |`
  );
  lines.push(
    `| Payment | ${rental ? formatEnum(rental.payment_schedule) : "—"} |`
  );
  lines.push(
    `| Security Deposit | ${rental?.security_deposit_aed ? `${formatPrice(rental.security_deposit_aed)} AED` : "—"} |`
  );
  lines.push("");

  if (media.length > 0) {
    lines.push("## Photos");
    lines.push("");
    media.forEach((m, i) => {
      const label = MEDIA_LABELS[m.asset_type] ?? formatEnum(m.asset_type);
      lines.push(`${i + 1}. ${label} — ${m.url}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("Ready for: Bayut · Dubizzle · Property Finder");
  lines.push("");

  return lines.join("\n");
}

export default function ListingExport() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [rental, setRental] = useState<RentalData | null>(null);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();

      const [
        { data: propertyData },
        { data: rentalData },
        { data: mediaData },
        { data: listingData },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select(
            "unit_number, bedrooms, bathrooms, floor, size_sqft, view_type, furnishing, condition, availability_date, buildings(name, developer)"
          )
          .eq("id", propertyId)
          .single(),
        supabase
          .from("rental_terms")
          .select("asking_price_aed, payment_schedule, security_deposit_aed")
          .eq("property_id", propertyId)
          .maybeSingle(),
        supabase
          .from("media_assets")
          .select("asset_type, url")
          .eq("property_id", propertyId)
          .eq("status", "uploaded")
          .order("sort_order"),
        supabase
          .from("ai_generated_content")
          .select("content")
          .eq("property_id", propertyId)
          .eq("content_type", "marketing_description")
          .eq("is_current", true)
          .maybeSingle(),
      ]);

      if (propertyData) setProperty(propertyData as unknown as PropertyData);
      if (rentalData) setRental(rentalData);
      if (mediaData) setMedia(mediaData);

      if (listingData) {
        try {
          setDraft(JSON.parse(listingData.content));
        } catch {
          // invalid JSON
        }
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Loading listing...
        </p>
      </div>
    );
  }

  if (!property || !draft) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <main className="flex max-w-md flex-col items-center gap-6 text-center px-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Listing not ready
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Complete all onboarding steps and approve your listing draft first.
          </p>
          <Link
            href={`/onboarding/review?propertyId=${propertyId}`}
            className="mt-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to Review
          </Link>
        </main>
      </div>
    );
  }

  function handleExport() {
    if (!property || !draft) return;

    const markdown = generateMarkdown(property, rental, draft, media);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `listing-${propertyId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Listing Export
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review your complete listing package before exporting.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Title
            </span>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {draft.title}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Headline
            </span>
            <p className="text-sm italic text-zinc-600 dark:text-zinc-300">
              {draft.headline}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Description
            </span>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {draft.description}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Highlights
            </span>
            <p className="whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">
              {draft.highlights}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Rental Terms
            </span>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Asking Price
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {rental
                    ? `${formatPrice(rental.asking_price_aed)} AED/year`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Payment
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {rental ? formatEnum(rental.payment_schedule) : "—"}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Security Deposit
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {rental?.security_deposit_aed
                    ? `${formatPrice(rental.security_deposit_aed)} AED`
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Property Facts
            </span>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
              {[
                ["Unit", property.unit_number],
                ["Building", property.buildings?.name ?? "—"],
                ["Bedrooms", property.bedrooms?.toString() ?? "—"],
                ["Bathrooms", property.bathrooms?.toString() ?? "—"],
                ["Floor", property.floor?.toString() ?? "—"],
                [
                  "Size",
                  property.size_sqft
                    ? `${property.size_sqft.toLocaleString()} sqft`
                    : "—",
                ],
                ["View", formatEnum(property.view_type)],
                ["Furnishing", formatEnum(property.furnishing)],
                ["Condition", formatEnum(property.condition)],
                ["Available", formatDate(property.availability_date)],
              ].map(([label, value], i, arr) => (
                <div
                  key={label}
                  className={`flex justify-between px-4 py-2 ${
                    i < arr.length - 1
                      ? "border-b border-zinc-200 dark:border-zinc-700"
                      : ""
                  }`}
                >
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {media.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Photos ({media.length})
              </span>
              <div className="flex flex-col gap-3">
                {media.map((m) => (
                  <div key={m.asset_type} className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {MEDIA_LABELS[m.asset_type] ??
                        formatEnum(m.asset_type)}
                    </span>
                    <Image
                      src={m.url}
                      alt={
                        MEDIA_LABELS[m.asset_type] ??
                        formatEnum(m.asset_type)
                      }
                      width={400}
                      height={200}
                      className="h-40 w-full rounded-lg object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
          >
            Export Listing
          </button>
          <Link
            href={`/onboarding/review?propertyId=${propertyId}`}
            className="w-full rounded-lg border border-zinc-200 px-6 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Back to Review
          </Link>
        </div>
      </main>
    </div>
  );
}
