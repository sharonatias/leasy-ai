"use client";

import { useState } from "react";

export default function PropertySearch() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Which building is your property in?
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Search for your building. If it's not in the system yet, we'll set it up for you.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Start typing your building name..."
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
          />

          {search.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12 dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Search results will appear here.
              </p>
            </div>
          )}

          {search.length > 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12 dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No buildings found for "{search}"
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Database search coming soon.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white opacity-50 cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900"
        >
          Continue
        </button>
      </main>
    </div>
  );
}
