"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MEDIA_ITEMS = [
  { type: "living_room", label: "Living Room", required: true },
  { type: "kitchen", label: "Kitchen", required: true },
  { type: "bedroom", label: "Bedroom", required: true },
  { type: "bathroom", label: "Bathroom", required: true },
  { type: "view", label: "Balcony / View", required: true },
  { type: "building_exterior", label: "Building Exterior", required: true },
  { type: "floor_plan", label: "Floor Plan", required: false },
] as const;

export default function MediaChecklist() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("media_assets")
        .select("asset_type")
        .eq("property_id", propertyId);

      if (data) {
        setAvailable(new Set(data.map((r) => r.asset_type)));
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
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  function toggle(type: string) {
    setAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  async function handleContinue() {
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("media_assets")
      .delete()
      .eq("property_id", propertyId);

    if (deleteError) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }

    if (available.size > 0) {
      const rows = Array.from(available).map((type) => ({
        property_id: propertyId,
        asset_type: type,
        url: "pending-upload",
        status: "needs_update" as const,
        sort_order: MEDIA_ITEMS.findIndex((m) => m.type === type),
      }));

      const { error: insertError } = await supabase
        .from("media_assets")
        .insert(rows);

      if (insertError) {
        setSubmitting(false);
        setError("Something went wrong. Please try again.");
        return;
      }
    }

    router.push(`/onboarding/review?propertyId=${propertyId}`);
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Photos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Mark which photos you have available. You&#39;ll upload them later.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {MEDIA_ITEMS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => toggle(item.type)}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                available.has(item.type)
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500"
              }`}
            >
              <span>
                {item.label}
                {!item.required && (
                  <span className="ml-2 text-xs opacity-60">(optional)</span>
                )}
              </span>
              <span className="text-xs">
                {available.has(item.type) ? "Available" : "Missing"}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={handleContinue}
            className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
              !submitting
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
