"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const VIEW_OPTIONS = [
  { value: "sea", label: "Sea View" },
  { value: "city", label: "City View" },
  { value: "garden", label: "Garden View" },
  { value: "pool", label: "Pool View" },
  { value: "community", label: "Community View" },
  { value: "other", label: "Other" },
] as const;

const FURNISHING_OPTIONS = [
  { value: "furnished", label: "Furnished" },
  { value: "semi_furnished", label: "Semi-furnished" },
  { value: "unfurnished", label: "Unfurnished" },
] as const;

const CONDITION_OPTIONS = [
  { value: "new", label: "New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "needs_maintenance", label: "Needs maintenance" },
] as const;

export default function PropertyDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const editMode = searchParams.get("edit") === "true";

  const [viewType, setViewType] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [condition, setCondition] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!propertyId);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("view_type, furnishing, condition, availability_date")
        .eq("id", propertyId)
        .single();

      if (data) {
        if (data.view_type) setViewType(data.view_type);
        if (data.furnishing) setFurnishing(data.furnishing);
        if (data.condition) setCondition(data.condition);
        if (data.availability_date) setAvailabilityDate(data.availability_date);
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

  const canContinue =
    viewType !== "" &&
    furnishing !== "" &&
    condition !== "" &&
    availabilityDate !== "";

  async function handleContinue() {
    if (!canContinue) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        view_type: viewType,
        furnishing: furnishing,
        condition: condition,
        availability_date: availabilityDate,
      })
      .eq("id", propertyId);

    if (updateError) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }

    if (editMode) {
      router.push(`/onboarding/review?propertyId=${propertyId}`);
    } else {
      router.push(`/onboarding/rental?propertyId=${propertyId}`);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  const chipBase =
    "rounded-lg border px-4 py-2.5 text-sm transition-colors cursor-pointer";
  const chipActive =
    "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900";
  const chipInactive =
    "border-zinc-200 text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500";

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Property details
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A few more details about your apartment.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              View
            </span>
            <div className="flex flex-wrap gap-2">
              {VIEW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setViewType(opt.value)}
                  className={`${chipBase} ${viewType === opt.value ? chipActive : chipInactive}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Furnishing
            </span>
            <div className="flex flex-wrap gap-2">
              {FURNISHING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFurnishing(opt.value)}
                  className={`${chipBase} ${furnishing === opt.value ? chipActive : chipInactive}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Condition
            </span>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCondition(opt.value)}
                  className={`${chipBase} ${condition === opt.value ? chipActive : chipInactive}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="availability-date"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Available from
            </label>
            <input
              id="availability-date"
              type="date"
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!canContinue || submitting}
            onClick={handleContinue}
            className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
              canContinue && !submitting
                ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
                : "bg-zinc-900 text-white opacity-50 cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900"
            }`}
          >
            {submitting ? "Saving..." : "Continue"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
