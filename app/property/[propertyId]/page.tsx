"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PropertyData = {
  unit_number: string;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  size_sqft: number | null;
  view_type: string | null;
  furnishing: string | null;
  condition: string | null;
  availability_date: string | null;
  buildings: { name: string; developer: string | null } | null;
};

type RentalData = {
  asking_price_aed: number | null;
  payment_schedule: string | null;
  security_deposit_aed: number | null;
};

type MediaRecord = {
  asset_type: string;
  url: string;
};

type ListingDraft = {
  title: string;
  description: string;
  highlights: string;
  amenities: string;
  headline: string;
};

function formatEnum(value: string | null): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrice(value: number | null): string {
  if (!value) return "—";
  return value.toLocaleString("en-AE");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function PropertyShowcase() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [loading, setLoading] = useState(true);
  const [p, setProperty] = useState<PropertyData | null>(null);
  const [r, setRental] = useState<RentalData | null>(null);
  const [photos, setPhotos] = useState<MediaRecord[]>([]);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", date: "", message: "" });

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();
      const [
        { data: property },
        { data: rental },
        { data: media },
        { data: listing },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select(
            "unit_number, bedrooms, bathrooms, floor, size_sqft, view_type, furnishing, condition, availability_date, buildings(name, developer)"
          )
          .eq("id", propertyId)
          .single(),
        supabase
          .from("rental_terms")
          .select("asking_price_aed, payment_schedule, security_deposit_aed")
          .eq("property_id", propertyId)
          .maybeSingle(),
        supabase
          .from("media_assets")
          .select("asset_type, url")
          .eq("property_id", propertyId)
          .eq("status", "uploaded")
          .order("sort_order"),
        supabase
          .from("ai_generated_content")
          .select("content")
          .eq("property_id", propertyId)
          .eq("content_type", "marketing_description")
          .eq("is_current", true)
          .maybeSingle(),
      ]);

      if (property) setProperty(property as unknown as PropertyData);
      setRental(rental as RentalData | null);
      setPhotos((media ?? []) as MediaRecord[]);

      if (listing) {
        try {
          setDraft(JSON.parse(listing.content));
        } catch {
          // invalid JSON
        }
      }

      setLoading(false);
    }

    load();
  }, [propertyId]);

  async function handleSubmitInquiry() {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitStatus("submitting");
    setSubmitError("");

    const summaryParts: string[] = [];
    if (form.date) summaryParts.push(`Preferred viewing date: ${form.date}`);
    if (form.message.trim()) summaryParts.push(`Message: ${form.message.trim()}`);

    const supabase = createClient();
    const { error } = await supabase.from("tenant_inquiries").insert({
      property_id: propertyId,
      channel: "web_chat",
      tenant_name: form.name.trim(),
      tenant_phone: form.phone.trim(),
      status: "new",
      qualification_result: "pending",
      conversation_summary: summaryParts.length > 0 ? summaryParts.join("\n") : null,
    });

    if (error) {
      setSubmitStatus("error");
      setSubmitError("Something went wrong. Please try again.");
      return;
    }

    setSubmitStatus("success");
    setTimeout(() => {
      setShowModal(false);
      setSubmitStatus("idle");
      setForm({ name: "", phone: "", date: "", message: "" });
    }, 3000);
  }

  function goTo(index: number) {
    setActiveIndex(index);
    setFadeKey((k) => k + 1);
  }

  function prev() {
    goTo(activeIndex === 0 ? photos.length - 1 : activeIndex - 1);
  }

  function next() {
    goTo(activeIndex === photos.length - 1 ? 0 : activeIndex + 1);
  }

  if (loading || !p) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  const buildingName = p.buildings?.name ?? "Property";
  const description = draft?.description ?? null;

  const subtitle = [
    p.furnishing ? formatEnum(p.furnishing) : null,
    p.bedrooms != null ? `${p.bedrooms}-Bedroom Apartment` : "Apartment",
    p.buildings?.developer ? `by ${p.buildings.developer}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const factsRow1 = [
    p.bedrooms != null ? { value: String(p.bedrooms), label: "Bedrooms" } : null,
    p.bathrooms != null ? { value: String(p.bathrooms), label: "Bathrooms" } : null,
    p.size_sqft != null ? { value: p.size_sqft.toLocaleString(), label: "Sq Ft" } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  const factsRow2 = [
    p.floor != null ? { value: String(p.floor), label: "Floor" } : null,
    p.view_type ? { value: formatEnum(p.view_type), label: "View" } : null,
    p.furnishing ? { value: formatEnum(p.furnishing), label: "Furnishing" } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  const heroUrl = photos[activeIndex]?.url ?? null;
  const thumbPhotos = photos.slice(0, 5);

  return (
    <div className="h-screen bg-[#faf9f7] dark:bg-zinc-950">
      <div className="flex h-full flex-col lg:flex-row lg:overflow-hidden">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col lg:w-[58%] lg:h-full">

          {/* Hero */}
          <div className="relative min-h-[280px] overflow-hidden bg-zinc-200 dark:bg-zinc-900 lg:min-h-0 lg:flex-1">
            {heroUrl ? (
              <Image
                key={fadeKey}
                src={heroUrl}
                alt={photos[activeIndex]?.asset_type.replace(/_/g, " ") ?? buildingName}
                fill
                className="object-cover transition-opacity duration-300"
                unoptimized
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-black/4" />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-zinc-600 shadow-lg shadow-black/8 backdrop-blur-md transition-all hover:bg-white/85 hover:scale-105 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-zinc-600 shadow-lg shadow-black/8 backdrop-blur-md transition-all hover:bg-white/85 hover:scale-105 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {photos.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/30 px-3.5 py-1.5 backdrop-blur-md">
                <span className="text-[11px] font-medium tracking-wide text-white/90">
                  {activeIndex + 1} / {photos.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip — fixed landscape aspect ratio */}
          {photos.length > 1 && (
            <div className="flex gap-2 bg-[#faf9f7] px-3 py-3 dark:bg-zinc-950">
              {thumbPhotos.map((photo, i) => (
                <button
                  key={photo.asset_type}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`group relative flex-1 overflow-hidden rounded-lg transition-all duration-200 ${
                    activeIndex === i
                      ? "ring-2 ring-amber-600/80 ring-offset-2 ring-offset-[#faf9f7] dark:ring-amber-500 dark:ring-offset-zinc-950"
                      : "opacity-50 hover:opacity-90"
                  }`}
                >
                  <div className="aspect-[16/10]">
                    <Image
                      src={photo.url}
                      alt={photo.asset_type.replace(/_/g, " ")}
                      width={200}
                      height={125}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  {i === 4 && photos.length > 5 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <span className="text-sm font-semibold text-white">
                        +{photos.length - 5}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col bg-[#faf8f5] lg:w-[42%] lg:h-full lg:overflow-y-auto lg:border-l lg:border-zinc-200/20 dark:bg-zinc-950 dark:lg:border-zinc-800/30">
          <div className="flex flex-1 flex-col px-8 py-7 sm:px-10 lg:px-10 lg:py-6">

            {/* Location */}
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-amber-500/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400/80 dark:text-zinc-500">
                City of Arabia, Dubai
              </span>
            </div>

            {/* Title — dominant focal point */}
            <h1 className="text-[38px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#141425] dark:text-zinc-50 lg:text-[52px]">
              {buildingName}
            </h1>
            <h2 className="mt-0.5 text-[38px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#141425] dark:text-zinc-50 lg:text-[52px]">
              Unit <span className="text-amber-600/80 dark:text-amber-500">{p.unit_number}</span>
            </h2>

            {/* Gold accent line */}
            <div className="mt-4 h-[2px] w-10 rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/20" />

            {/* Price — second most important */}
            {r?.asking_price_aed && (
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[34px] font-extrabold tracking-[-0.02em] text-[#141425] dark:text-zinc-50 lg:text-[42px]">
                  {formatPrice(r.asking_price_aed)}
                </span>
                <span className="text-[12px] font-medium tracking-wide text-zinc-400/60 dark:text-zinc-500">
                  AED / year
                </span>
              </div>
            )}

            {/* Subtitle — elegant secondary */}
            <p className="mt-2 text-[15px] font-light tracking-[0.01em] text-zinc-400/80 dark:text-zinc-500 lg:text-[17px]">
              {subtitle}
            </p>

            {/* Facts — premium grid */}
            <div className="mt-7 mb-6 rounded-2xl border border-zinc-200/30 bg-white/50 py-1 dark:border-zinc-800/30 dark:bg-zinc-900/30">
              {factsRow1.length > 0 && (
                <div className="grid grid-cols-3">
                  {factsRow1.map((fact, i) => (
                    <div
                      key={fact.label}
                      className={`flex flex-col items-center gap-1.5 py-5 ${
                        i > 0 ? "border-l border-zinc-200/20 dark:border-zinc-800/30" : ""
                      }`}
                    >
                      <span className="text-[18px] font-bold text-[#141425] dark:text-zinc-50">
                        {fact.value}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] dark:text-zinc-600" style={{ color: '#b5b5bd' }}>
                        {fact.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {factsRow2.length > 0 && (
                <div className="grid grid-cols-3 border-t border-zinc-200/20 dark:border-zinc-800/30">
                  {factsRow2.map((fact, i) => (
                    <div
                      key={fact.label}
                      className={`flex flex-col items-center gap-1.5 py-5 ${
                        i > 0 ? "border-l border-zinc-200/20 dark:border-zinc-800/30" : ""
                      }`}
                    >
                      <span className="text-[18px] font-bold text-[#141425] dark:text-zinc-50">
                        {fact.value}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] dark:text-zinc-600" style={{ color: '#b5b5bd' }}>
                        {fact.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* About — with Read more toggle */}
            {description && (
              <div className="mb-6">
                <h3 className="mb-3 text-[20px] font-bold tracking-[-0.01em] text-[#141425] dark:text-zinc-100">
                  About this property
                </h3>
                <p className={`text-[15px] leading-[1.8] text-zinc-500 dark:text-zinc-400 ${showMore ? "" : "line-clamp-3"}`}>
                  {description}
                </p>
                <button
                  type="button"
                  onClick={() => setShowMore(!showMore)}
                  className="mt-2 text-[13px] font-medium text-amber-600/80 transition-colors hover:text-amber-600 dark:text-amber-500/80 dark:hover:text-amber-500"
                >
                  {showMore ? "Show less" : "Read more"}
                </button>
              </div>
            )}

            {/* Amenities — icon row */}
            <div className="mb-6">
              <h3 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.18em] dark:text-zinc-600" style={{ color: '#b5b5bd' }}>
                Amenities
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { name: "Pool", icon: <><path d="M2 12h2a2 2 0 012 2 2 2 0 002 2h0a2 2 0 002-2 2 2 0 012-2h2a2 2 0 012 2 2 2 0 002 2h0a2 2 0 002-2 2 2 0 012-2h2" /><path d="M2 17h2a2 2 0 012 2 2 2 0 002 2h0a2 2 0 002-2 2 2 0 012-2h2a2 2 0 012 2 2 2 0 002 2h0a2 2 0 002-2 2 2 0 012-2h2" /><path d="M9 8V4a2 2 0 012-2h2a2 2 0 012 2v4" /></> },
                  { name: "Gym", icon: <><path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><path d="M12 6.5v11" /><rect x="3" y="8" width="3" height="8" rx="1" /><rect x="18" y="8" width="3" height="8" rx="1" /></> },
                  { name: "Security", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
                  { name: "Parking", icon: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 17V7h4a3 3 0 010 6H9" /></> },
                  { name: "Kids", icon: <><circle cx="12" cy="4" r="2" /><path d="M12 6v4" /><path d="M8 10l4 2 4-2" /><path d="M10 14l-2 8" /><path d="M14 14l2 8" /></> },
                ].map((amenity) => (
                  <div key={amenity.name} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/60 py-3 dark:bg-zinc-900/30">
                    <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {amenity.icon}
                    </svg>
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom two-column: Rental Terms + CTA */}
            <div className="mt-auto grid grid-cols-1 gap-3 lg:grid-cols-2">

              {/* Rental Terms card */}
              {r && (
                <div className="flex flex-col rounded-2xl border border-zinc-200/25 bg-white/50 px-5 py-5 shadow-sm shadow-zinc-300/10 dark:border-zinc-800/30 dark:bg-zinc-900/30 dark:shadow-none">
                  <h3 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.18em] dark:text-zinc-600" style={{ color: '#b5b5bd' }}>
                    Rental Terms
                  </h3>
                  <div className="flex flex-1 flex-col justify-center gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-400 dark:text-zinc-500">Payment</span>
                      <span className="text-[14px] font-semibold text-[#141425] dark:text-zinc-300">
                        {formatEnum(r.payment_schedule)}
                      </span>
                    </div>
                    {r.security_deposit_aed && (
                      <div className="flex items-center justify-between border-t border-zinc-100/50 pt-3 dark:border-zinc-800/20">
                        <span className="text-[13px] text-zinc-400 dark:text-zinc-500">Deposit</span>
                        <span className="text-[14px] font-semibold text-[#141425] dark:text-zinc-300">
                          {formatPrice(r.security_deposit_aed)} AED
                        </span>
                      </div>
                    )}
                    {p.condition && (
                      <div className="flex items-center justify-between border-t border-zinc-100/50 pt-3 dark:border-zinc-800/20">
                        <span className="text-[13px] text-zinc-400 dark:text-zinc-500">Condition</span>
                        <span className="text-[14px] font-semibold text-[#141425] dark:text-zinc-300">
                          {formatEnum(p.condition)}
                        </span>
                      </div>
                    )}
                    {p.availability_date && (
                      <div className="flex items-center justify-between border-t border-zinc-100/50 pt-3 dark:border-zinc-800/20">
                        <span className="text-[13px] text-zinc-400 dark:text-zinc-500">Available</span>
                        <span className="text-[14px] font-semibold text-[#141425] dark:text-zinc-300">
                          {formatDate(p.availability_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTA card */}
              <div className="flex flex-col justify-between rounded-2xl bg-[#141425] px-6 py-5 shadow-lg shadow-[#141425]/6 dark:bg-zinc-800/90 dark:shadow-none">
                <div>
                  <p className="text-[16px] font-semibold text-white/95">
                    Interested?
                  </p>
                  <p className="mt-1.5 text-[12px] font-light leading-relaxed text-zinc-400">
                    Schedule a private viewing at your convenience.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-amber-700/15 transition-all hover:from-amber-500 hover:to-amber-400 hover:shadow-lg hover:shadow-amber-600/20"
                >
                  Request a Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEWING REQUEST MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white px-7 py-8 shadow-2xl dark:bg-zinc-900">
            {/* Close button */}
            <button
              type="button"
              onClick={() => { setShowModal(false); setSubmitStatus("idle"); setSubmitError(""); }}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>

            {submitStatus === "success" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
                  <svg className="h-7 w-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-[18px] font-semibold text-[#141425] dark:text-zinc-100">
                  Request received
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Thanks — we received your request and will contact you shortly.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-[22px] font-bold text-[#141425] dark:text-zinc-100">
                  Request a Viewing
                </h3>
                <p className="mt-1.5 text-[14px] text-zinc-400 dark:text-zinc-500">
                  {buildingName} · Unit {p.unit_number}
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                      Full name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. John Smith"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[15px] text-[#141425] outline-none transition-colors placeholder:text-zinc-300 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                      WhatsApp / Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +971 50 123 4567"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[15px] text-[#141425] outline-none transition-colors placeholder:text-zinc-300 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                      Preferred viewing date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[15px] text-[#141425] outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                      Message <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-300 dark:text-zinc-600">(optional)</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={3}
                      placeholder="Any questions or preferences..."
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[15px] text-[#141425] outline-none transition-colors placeholder:text-zinc-300 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {submitError && (
                  <p className="mt-3 text-[13px] text-red-500">{submitError}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitInquiry}
                  disabled={!form.name.trim() || !form.phone.trim() || submitStatus === "submitting"}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-amber-700/15 transition-all hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitStatus === "submitting" ? "Submitting..." : "Submit Request"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
