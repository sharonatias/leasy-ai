"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Building = {
  id: string;
  name: string;
  developer: string | null;
};

export default function PropertySearch() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Building[]>([]);
  const [selected, setSelected] = useState<Building | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
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
  }, [search]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Which building is your property in?
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
                  onClick={() => setSelected(building)}
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

        {selected ? (
          <Link
            href="/onboarding/property"
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Continue
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white opacity-50 cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900"
          >
            Continue
          </button>
        )}
      </main>
    </div>
  );
}
