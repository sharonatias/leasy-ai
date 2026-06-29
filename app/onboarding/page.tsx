import Link from "next/link";

export default function OnboardingWelcome() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex max-w-md flex-col items-center gap-8 text-center px-6">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome to Leasy AI
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            I'm going to help you prepare your property for leasing.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-left text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-zinc-400 dark:text-zinc-500">1.</span>
            <p>I'll guide you through 7 short steps to build your property profile.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-zinc-400 dark:text-zinc-500">2.</span>
            <p>The whole process takes about 10–15 minutes.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-zinc-400 dark:text-zinc-500">3.</span>
            <p>You can stop at any time and continue later — nothing is lost.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-zinc-400 dark:text-zinc-500">4.</span>
            <p>At the end, I'll generate a complete property profile and a professional listing for you.</p>
          </div>
        </div>

        <Link
          href="/onboarding/property"
          className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Get Started
        </Link>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          You can stop and continue anytime.
        </p>
      </main>
    </div>
  );
}
