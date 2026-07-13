"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadMarketProfile } from "./load-market-profile";
import { buildRentalCommandModel, type RentalCommandModel } from "./build-rental-command-model";
import { StrategyBrief } from "./components/StrategyBrief";
import { IntelligenceScore } from "./components/IntelligenceScore";
import { MarketSnapshot } from "./components/MarketSnapshot";
import { CompetitionOverview } from "./components/CompetitionOverview";
import { IdealTenantProfile } from "./components/IdealTenantProfile";
import { AreaIntelligence } from "./components/AreaIntelligence";
import { BrokerOpportunities } from "./components/BrokerOpportunities";
import { DistributionStrategy } from "./components/DistributionStrategy";
import { MarketingStrategy } from "./components/MarketingStrategy";
import { RentalTimeline } from "./components/RentalTimeline";
import { NextBestAction } from "./components/NextBestAction";

type PropertyData = {
  unit_number: string;
  status: string;
  view_type: string | null;
  furnishing: string | null;
  condition: string | null;
  availability_date: string | null;
  buildings: { name: string } | null;
};

function FindTenantsContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [model, setModel] = useState<RentalCommandModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();

      const { data: propData } = await supabase
        .from("properties")
        .select("unit_number, status, view_type, furnishing, condition, availability_date, buildings(name)")
        .eq("id", propertyId)
        .single();

      if (propData) {
        const typed = propData as unknown as PropertyData;
        setProperty(typed);

        const bName = typed.buildings?.name;
        if (bName) {
          const profile = await loadMarketProfile(bName);
          if (profile) {
            setModel(buildRentalCommandModel(profile, typed.status));
          }
        }
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
            No property selected
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select a property from the dashboard first.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Dashboard
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

  if (!property) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <main className="flex max-w-md flex-col items-center gap-6 text-center px-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Property not found
          </h1>
          <Link
            href="/"
            className="mt-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  const buildingName = property.buildings?.name ?? "Property";

  return (
    <div className="flex justify-center">
      <main className="flex w-full max-w-lg flex-col gap-10 px-6 py-8 pb-28">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="mb-3 flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Rental Command Center
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {buildingName} — Unit {property.unit_number}
          </p>
        </div>

        {model ? (
          <>
            <StrategyBrief data={model.strategy} />
            <IntelligenceScore data={model.score} />
            <MarketSnapshot data={model.snapshot} />
            <CompetitionOverview data={model.competition} />
            <IdealTenantProfile data={model.audience} />
            <AreaIntelligence data={model.area} />
            <BrokerOpportunities data={model.brokers} />
            <DistributionStrategy data={model.distribution} />
            <MarketingStrategy data={model.marketing} />
            <RentalTimeline data={model.timeline} />
          </>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-5 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Market intelligence is not available for this property yet.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="w-full rounded-lg border border-zinc-200 px-6 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>
      </main>

      {model && <NextBestAction data={model.nextAction} />}
    </div>
  );
}

export default function FindTenantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
        </div>
      }
    >
      <FindTenantsContent />
    </Suspense>
  );
}
