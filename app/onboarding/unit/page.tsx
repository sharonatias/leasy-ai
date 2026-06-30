"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function UnitDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const editMode = searchParams.get("edit") === "true";

  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [floor, setFloor] = useState("");
  const [sizeSqft, setSizeSqft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!propertyId);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("bedrooms, bathrooms, floor, size_sqft")
        .eq("id", propertyId)
        .single();

      if (data) {
        if (data.bedrooms != null) setBedrooms(data.bedrooms.toString());
        if (data.bathrooms != null) setBathrooms(data.bathrooms.toString());
        if (data.floor != null) setFloor(data.floor.toString());
        if (data.size_sqft != null) setSizeSqft(data.size_sqft.toString());
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
    bedrooms !== "" && bathrooms !== "" && floor !== "" && sizeSqft !== "";

  async function handleContinue() {
    if (!canContinue) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        floor: parseInt(floor),
        size_sqft: parseFloat(sizeSqft),
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
      router.push(`/onboarding/details?propertyId=${propertyId}`);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500";

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tell us about the unit
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Basic details about your apartment.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="bedrooms"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Bedrooms
              </label>
              <input
                id="bedrooms"
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="e.g. 2"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="bathrooms"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Bathrooms
              </label>
              <input
                id="bathrooms"
                type="number"
                min="1"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="e.g. 2"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="floor"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Floor
              </label>
              <input
                id="floor"
                type="number"
                min="0"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 9"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="size"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Size (sqft)
              </label>
              <input
                id="size"
                type="number"
                min="1"
                value={sizeSqft}
                onChange={(e) => setSizeSqft(e.target.value)}
                placeholder="e.g. 1200"
                className={inputClass}
              />
            </div>
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
