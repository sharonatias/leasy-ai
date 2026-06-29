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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();

      const [{ data: property }, { data: rental }] = await Promise.all([
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

      setSections([
        { label: "Identity", complete: identity },
        { label: "Unit Details", complete: unitDetails },
        { label: "Property Details", complete: propertyDetails },
        { label: "Rental Terms", complete: rentalTerms },
        { label: "Photos", complete: false },
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

        {completedSections.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Completed
            </h2>
            <div className="flex flex-col gap-2">
              {completedSections.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700"
                >
                  <span className="text-emerald-500">&#10003;</span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(missingSections.length > 0 || true) && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Missing
            </h2>
            <div className="flex flex-col gap-2">
              {missingSections.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-700"
                >
                  <span className="text-zinc-300 dark:text-zinc-600">&#9744;</span>
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">
                    {s.label}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-700">
                <span className="text-zinc-300 dark:text-zinc-600">&#9744;</span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">
                  AI Review
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Next Step
          </h2>
          <div className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white opacity-50 cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900">
            Next: Upload Photos
          </div>
        </div>
      </main>
    </div>
  );
}
