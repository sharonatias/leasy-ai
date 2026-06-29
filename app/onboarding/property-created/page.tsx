import Link from "next/link";

export default function PropertyCreated() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex max-w-md flex-col items-center gap-6 text-center px-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Property created
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your property has been saved as a draft. The next onboarding steps are
          coming soon.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to Dashboard
        </Link>
      </main>
    </div>
  );
}
