"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Building = {
  id: string;
  name: string;
  developer: string | null;
};

export default function PropertySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const editMode = searchParams.get("edit") === "true";

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Building[]>([]);
  const [selected, setSelected] = useState<Building | null>(null);
  const [unitNumber, setUnitNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(!!propertyId);

  const canContinue = selected !== null && unitNumber.trim().length > 0;

  useEffect(() => {
    if (!propertyId) return;

    async function loadExisting() {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("unit_number, building_id, buildings(id, name, developer)")
        .eq("id", propertyId)
        .single();

      if (data) {
        if (data.unit_number) setUnitNumber(data.unit_number);
        if (data.buildings) {
          const b = data.buildings as unknown as Building;
          setSelected(b);
          setSearch(b.name);
          setResults([b]);
        }
      }
      setInitialLoading(false);
    }

    loadExisting();
  }, [propertyId]);

  useEffect(() => {
    if (search.length < 2) {
      if (!selected) setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("buildings")
        .select("id, name, developer")
        .ilike("name", `%${search}%`)
        .limit(5);
      setResults(data ?? []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, selected]);

  async function handleContinue() {
    if (!selected || !unitNumber.trim()) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    if (editMode && propertyId) {
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          building_id: selected.id,
          unit_number: unitNumber.trim(),
        })
        .eq("id", propertyId);

      if (updateError) {
        setSubmitting(false);
        if (updateError.code === "23505") {
          setError("This unit already exists in this building.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      router.push(`/onboarding/review?propertyId=${propertyId}`);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("properties")
      .insert({
        building_id: selected.id,
        unit_number: unitNumber.trim(),
      })
      .select("id")
      .single();

    if (insertError) {
      setSubmitting(false);
      if (insertError.code === "23505") {
        setError("This unit already exists in this building.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      return;
    }

    router.push(`/onboarding/unit?propertyId=${data.id}`);
  }

  if (initialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {editMode ? "Edit property identity" : "Which building is your property in?"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Search for your building. If it&#39;s not in the system yet,
            we&#39;ll set it up for you.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
              setUnitNumber("");
              setError(null);
            }}
            placeholder="Start typing your building name..."
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
          />

          {search.length < 2 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12 dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Search results will appear here.
              </p>
            </div>
          )}

          {search.length >= 2 && loading && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12 dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Searching...
              </p>
            </div>
          )}

          {search.length >= 2 && !loading && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12 dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Can&#39;t find your building?
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                You&#39;ll be able to create it in the next step.
              </p>
            </div>
          )}

          {search.length >= 2 && !loading && results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((building) => (
                <button
                  key={building.id}
                  type="button"
                  onClick={() => {
                    setSelected(building);
                    setError(null);
                  }}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected?.id === building.id
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-200 text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500"
                  }`}
                >
                  <span className="font-medium">{building.name}</span>
                  {building.developer && (
                    <span className="ml-2 text-xs opacity-60">
                      by {building.developer}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="unit-number"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Unit number
            </label>
            <input
              id="unit-number"
              type="text"
              value={unitNumber}
              onChange={(e) => {
                setUnitNumber(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 927"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
            />
          </div>
        )}

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
            {submitting ? "Creating..." : "Continue"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
