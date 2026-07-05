"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

type PropertyData = {
  unit_number: string;
  status: string;
  view_type: string | null;
  furnishing: string | null;
  condition: string | null;
  availability_date: string | null;
  buildings: { name: string } | null;
};

type RentalData = {
  asking_price_aed: number | null;
  payment_schedule: string | null;
  security_deposit_aed: number | null;
};

type StoryData = {
  description: string;
  highlights: string;
};

type ScoreItem = {
  label: string;
  points: number;
  earned: boolean;
};

type Channel = {
  name: string;
  status: "Published" | "Ready" | "Recommended";
  action: string;
  actionType: "link" | "copy" | "preview";
  href?: string;
  icon: string;
};

type RecommendedChannel = {
  name: string;
  type: string;
  stars: number;
  url: string;
};

const RECOMMENDED_CHANNELS: RecommendedChannel[] = [
  { name: "Dubai Expats", type: "Facebook Group", stars: 5, url: "https://www.facebook.com/groups/dubaiexpats" },
  { name: "Dubai Rentals", type: "Facebook Group", stars: 5, url: "https://www.facebook.com/groups/dubairentals" },
  { name: "Telegram Dubai Rent", type: "Telegram Channel", stars: 4, url: "https://t.me/dubairent" },
  { name: "Property Finder", type: "Portal", stars: 5, url: "https://www.propertyfinder.ae" },
  { name: "Bayut", type: "Portal", stars: 5, url: "https://www.bayut.com" },
  { name: "Dubizzle", type: "Portal", stars: 4, url: "https://www.dubizzle.com" },
];

const MISSING_ITEMS = [
  { label: "Add a video tour", icon: "🎬" },
  { label: "Upload a floor plan", icon: "📐" },
  { label: "Publish to Facebook Groups", icon: "📢" },
  { label: "Share with brokers", icon: "🤝" },
  { label: "Run Meta Ads", icon: "📣" },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="text-xs tracking-wide">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"}>
          ★
        </span>
      ))}
    </span>
  );
}

function FindTenantsContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [rental, setRental] = useState<RentalData | null>(null);
  const [story, setStory] = useState<StoryData | null>(null);
  const [mediaCount, setMediaCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();

      const [
        { data: propData },
        { data: rentalData },
        { data: listingData },
        { data: mediaData },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("unit_number, status, view_type, furnishing, condition, availability_date, buildings(name)")
          .eq("id", propertyId)
          .single(),
        supabase
          .from("rental_terms")
          .select("asking_price_aed, payment_schedule, security_deposit_aed")
          .eq("property_id", propertyId)
          .maybeSingle(),
        supabase
          .from("ai_generated_content")
          .select("content")
          .eq("property_id", propertyId)
          .eq("content_type", "marketing_description")
          .eq("is_current", true)
          .maybeSingle(),
        supabase
          .from("media_assets")
          .select("id")
          .eq("property_id", propertyId)
          .eq("status", "uploaded"),
      ]);

      if (propData) setProperty(propData as unknown as PropertyData);
      if (rentalData) setRental(rentalData);
      if (mediaData) setMediaCount(mediaData.length);

      if (listingData?.content) {
        try {
          const parsed = JSON.parse(listingData.content);
          setStory({
            description: parsed.description ?? "",
            highlights: parsed.highlights ?? "",
          });
        } catch { /* ignore */ }
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

  const scoreItems: ScoreItem[] = [
    { label: "Website published", points: 20, earned: property.status === "listed" },
    { label: "Story completed", points: 20, earned: !!(story?.description) },
    { label: "Photos uploaded", points: 20, earned: mediaCount >= 4 },
    { label: "Listing export ready", points: 20, earned: !!(story?.description && story?.highlights) },
    {
      label: "Property details complete",
      points: 20,
      earned: !!(
        property.view_type &&
        property.furnishing &&
        property.condition &&
        property.availability_date &&
        rental?.asking_price_aed &&
        rental?.payment_schedule
      ),
    },
  ];

  const totalScore = scoreItems.reduce((sum, item) => sum + (item.earned ? item.points : 0), 0);

  const propertyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/property/${propertyId}`;

  const channels: Channel[] = [
    {
      name: "Website",
      status: property.status === "listed" ? "Published" : "Ready",
      action: property.status === "listed" ? "Open Property" : "Publish First",
      actionType: "link",
      href: property.status === "listed" ? `/property/${propertyId}` : `/onboarding/review?propertyId=${propertyId}`,
      icon: "🌐",
    },
    {
      name: "Bayut",
      status: "Ready",
      action: "Preview Listing",
      actionType: "preview",
      icon: "🏢",
    },
    {
      name: "Property Finder",
      status: "Ready",
      action: "Preview Listing",
      actionType: "preview",
      icon: "🔍",
    },
    {
      name: "Dubizzle",
      status: "Ready",
      action: "Preview Listing",
      actionType: "preview",
      icon: "📋",
    },
    {
      name: "WhatsApp",
      status: "Ready",
      action: "Copy Message",
      actionType: "copy",
      icon: "💬",
    },
    {
      name: "Facebook",
      status: "Recommended",
      action: "Preview Post",
      actionType: "preview",
      icon: "📘",
    },
    {
      name: "Telegram",
      status: "Recommended",
      action: "Preview Post",
      actionType: "preview",
      icon: "✈️",
    },
  ];

  function handleCopy() {
    const msg = `🏠 ${buildingName} — Unit ${property!.unit_number}\n\n${story?.description ? story.description.slice(0, 200) + "..." : "Premium apartment available for rent."}\n\n🔗 ${propertyUrl}`;
    navigator.clipboard.writeText(msg);
  }

  return (
    <div className="flex justify-center">
      <main className="flex w-full max-w-lg flex-col gap-10 px-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="mb-3 flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            🚀 Find Tenants
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {buildingName} — Unit {property.unit_number}
          </p>
        </div>

        {/* Distribution Score */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Distribution Score
          </h2>

          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold tabular-nums ${totalScore === 100 ? "text-emerald-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                {totalScore}
              </span>
              <span className="text-lg text-zinc-400 dark:text-zinc-500">/ 100</span>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-2 rounded-full transition-all ${totalScore === 100 ? "bg-emerald-500" : "bg-zinc-900 dark:bg-zinc-50"}`}
                style={{ width: `${totalScore}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              This score estimates how ready your property is for successful distribution.
            </p>

            <div className="mt-4 flex flex-col gap-0">
              {scoreItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-t border-zinc-100 py-2.5 dark:border-zinc-800">
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.earned ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600"}`}>
                    {item.earned ? `+${item.points}` : `+${item.points}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Distribution Channels */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Distribution Channels
          </h2>

          <div className="flex flex-col gap-3">
            {channels.map((ch) => (
              <div
                key={ch.name}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{ch.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {ch.name}
                    </span>
                    <span className={`text-xs font-medium ${
                      ch.status === "Published" ? "text-emerald-500" :
                      ch.status === "Ready" ? "text-amber-500" :
                      "text-zinc-400 dark:text-zinc-500"
                    }`}>
                      {ch.status}
                    </span>
                  </div>
                </div>

                {ch.actionType === "link" && ch.href ? (
                  <Link
                    href={ch.href}
                    className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {ch.action}
                  </Link>
                ) : ch.actionType === "copy" ? (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    {ch.action}
                  </button>
                ) : (
                  <Link
                    href={`/onboarding/review?propertyId=${propertyId}#listing-export`}
                    className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {ch.action}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Channels */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Recommended for this property
          </h2>

          <div className="flex flex-col gap-0 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            {RECOMMENDED_CHANNELS.map((ch, i) => (
              <div
                key={ch.name}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < RECOMMENDED_CHANNELS.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {ch.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">{ch.type}</span>
                    <Stars count={ch.stars} />
                  </div>
                </div>
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* What's Missing */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            What&apos;s Missing
          </h2>

          <div className="flex flex-col gap-2">
            {MISSING_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-white/50 px-5 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-300">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Back */}
        <Link
          href="/"
          className="w-full rounded-lg border border-zinc-200 px-6 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>
      </main>
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
