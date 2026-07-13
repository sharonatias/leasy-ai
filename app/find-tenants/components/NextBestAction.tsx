import type { NextBestActionModel } from "../build-rental-command-model";

export function NextBestAction({ data }: { data: NextBestActionModel }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{data.title}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{data.description}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-semibold text-emerald-500">{data.impact}</span>
          <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 active:bg-emerald-700">
            {data.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
