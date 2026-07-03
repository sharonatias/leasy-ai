import { Suspense } from "react";
import { ExportContent } from "./export-content";

export default function ExportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Loading listing...
          </p>
        </div>
      }
    >
      <ExportContent />
    </Suspense>
  );
}
