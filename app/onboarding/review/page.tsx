"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type SectionStatus = {
  label: string;
  complete: boolean;
};

export default function PropertyReview() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const [sections, setSections] = useState<SectionStatus[]>([]);
  const [listingDraftReady, setListingDraftReady] = useState(false);
  const [photosComplete, setPhotosComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();

      const [{ data: property }, { data: rental }, { data: media }, { data: listing }] =
        await Promise.all([
          supabase
            .from("properties")
            .select(
              "building_id, unit_number, bedrooms, bathrooms, floor, size_sqft, view_type, furnishing, condition, availability_date"
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
            .select("asset_type")
            .eq("property_id", propertyId)
            .eq("status", "uploaded"),
          supabase
            .from("ai_generated_content")
            .select("id")
            .eq("property_id", propertyId)
            .eq("content_type", "marketing_description")
            .eq("is_current", true)
            .maybeSingle(),
        ]);

      const identity =
        property?.building_id != null && property?.unit_number != null;

      const unitDetails =
        property?.bedrooms != null &&
        property?.bathrooms != null &&
        property?.floor != null &&
        property?.size_sqft != null;

      const propertyDetails =
        property?.view_type != null &&
        property?.furnishing != null &&
        property?.condition != null &&
        property?.availability_date != null;

      const rentalTerms =
        rental != null &&
        rental.asking_price_aed != null &&
        rental.payment_schedule != null &&
        rental.security_deposit_aed != null;

      const requiredMediaTypes = [
        "living_room",
        "bedroom",
        "bathroom",
        "kitchen",
        "view",
        "building_exterior",
      ];
      const mediaTypes = new Set(
        (media ?? []).map((m: { asset_type: string }) => m.asset_type)
      );
      const photosOk =
        requiredMediaTypes.filter((t) => mediaTypes.has(t)).length >= 4;

      setPhotosComplete(photosOk);
      setListingDraftReady(listing != null);

      setSections([
        { label: "Identity", complete: identity },
        { label: "Unit Details", complete: unitDetails },
        { label: "Property Details", complete: propertyDetails },
        { label: "Rental Terms", complete: rentalTerms },
        { label: "Photos", complete: photosOk },
      ]);

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
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  const completedSections = sections.filter((s) => s.complete);
  const missingSections = sections.filter((s) => !s.complete);
  const readiness = sections.length > 0
    ? Math.round((completedSections.length / sections.length) * 100)
    : 0;

  const extraCompleted: SectionStatus[] = [];
  const extraMissing: SectionStatus[] = [];

  if (listingDraftReady) {
    extraCompleted.push({ label: "Listing Draft", complete: true });
  } else {
    extraMissing.push({ label: "Listing Draft", complete: false });
  }
  extraMissing.push({ label: "AI Review", complete: false });

  const allCompleted = [...completedSections, ...extraCompleted];
  const allMissing = [...missingSections, ...extraMissing];

  const editBase = `propertyId=${propertyId}&edit=true`;

  function getEditHref(label: string): string | null {
    switch (label) {
      case "Identity":
        return `/onboarding/property?${editBase}`;
      case "Unit Details":
        return `/onboarding/unit?${editBase}`;
      case "Property Details":
        return `/onboarding/details?${editBase}`;
      case "Rental Terms":
        return `/onboarding/rental?${editBase}`;
      case "Photos":
        return `/onboarding/media?${editBase}`;
      case "Listing Draft":
        return `/onboarding/story?${editBase}`;
      default:
        return null;
    }
  }

  function getNextStep(): { label: string; href: string } | null {
    if (!photosComplete) {
      return { label: "Next: Upload Photos", href: `/onboarding/media?propertyId=${propertyId}` };
    }
    if (!listingDraftReady) {
      return { label: "Next: Generate Listing", href: `/onboarding/story?propertyId=${propertyId}` };
    }
    if (readiness === 100 && listingDraftReady) {
      return { label: "Export Listing", href: `/onboarding/export?propertyId=${propertyId}` };
    }
    return null;
  }

  const nextStep = getNextStep();

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Property Readiness
          </h1>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {readiness}% Ready
          </p>
        </div>

        {allCompleted.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Completed
            </h2>
            <div className="flex flex-col gap-2">
              {allCompleted.map((s) => {
                const editHref = getEditHref(s.label);
                return (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500">&#10003;</span>
                      <span className="text-sm text-zinc-900 dark:text-zinc-50">
                        {s.label}
                      </span>
                    </div>
                    {editHref && (
                      <Link
                        href={editHref}
                        className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {allMissing.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Missing
            </h2>
            <div className="flex flex-col gap-2">
              {allMissing.map((s) => {
                const editHref = getEditHref(s.label);
                return (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg border border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-300 dark:text-zinc-600">&#9744;</span>
                      <span className="text-sm text-zinc-400 dark:text-zinc-500">
                        {s.label}
                      </span>
                    </div>
                    {editHref && (
                      <Link
                        href={editHref}
                        className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {nextStep && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Next Step
            </h2>
            <Link
              href={nextStep.href}
              className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {nextStep.label}
            </Link>
          </div>
        )}

        <Link
          href={`/property/${propertyId}`}
          className="w-full rounded-lg border border-zinc-200 px-6 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Preview Property
        </Link>
      </main>
    </div>
  );
}
