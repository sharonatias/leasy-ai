"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PAYMENT_OPTIONS = [
  { value: "1_cheque", label: "1 cheque" },
  { value: "2_cheques", label: "2 cheques" },
  { value: "4_cheques", label: "4 cheques" },
  { value: "6_cheques", label: "6 cheques" },
  { value: "12_cheques", label: "12 cheques" },
] as const;

export default function RentalTerms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const editMode = searchParams.get("edit") === "true";

  const [askingPrice, setAskingPrice] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!propertyId);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("rental_terms")
        .select("asking_price_aed, payment_schedule, security_deposit_aed")
        .eq("property_id", propertyId)
        .maybeSingle();

      if (data) {
        if (data.asking_price_aed != null) setAskingPrice(data.asking_price_aed.toString());
        if (data.payment_schedule) setPaymentSchedule(data.payment_schedule);
        if (data.security_deposit_aed != null) setSecurityDeposit(data.security_deposit_aed.toString());
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

  const priceNum = parseFloat(askingPrice);
  const depositNum = parseFloat(securityDeposit);

  const canContinue =
    askingPrice !== "" &&
    !isNaN(priceNum) &&
    priceNum > 0 &&
    paymentSchedule !== "" &&
    securityDeposit !== "" &&
    !isNaN(depositNum) &&
    depositNum >= 0;

  async function handleContinue() {
    if (!canContinue) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: upsertError } = await supabase
      .from("rental_terms")
      .upsert(
        {
          property_id: propertyId,
          asking_price_aed: priceNum,
          payment_schedule: paymentSchedule,
          security_deposit_aed: depositNum,
        },
        { onConflict: "property_id" }
      );

    if (upsertError) {
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
      return;
    }

    router.push(`/onboarding/review?propertyId=${propertyId}`);
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

  const chipBase =
    "rounded-lg border px-4 py-2.5 text-sm transition-colors cursor-pointer";
  const chipActive =
    "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900";
  const chipInactive =
    "border-zinc-200 text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500";

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Rental terms
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Set the price and payment structure for your property.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="asking-price"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Asking price (AED / year)
            </label>
            <input
              id="asking-price"
              type="number"
              min="1"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="e.g. 85000"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Payment schedule
            </span>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentSchedule(opt.value)}
                  className={`${chipBase} ${paymentSchedule === opt.value ? chipActive : chipInactive}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="security-deposit"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Security deposit (AED)
            </label>
            <input
              id="security-deposit"
              type="number"
              min="0"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              placeholder="e.g. 5000"
              className={inputClass}
            />
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
