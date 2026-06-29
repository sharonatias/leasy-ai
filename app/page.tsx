import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Leasy AI
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Prepare your first Dubai property for leasing.
        </p>
        <Link
          href="/onboarding"
          className="mt-4 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Property
        </Link>
      </main>
    </div>
  );
}
