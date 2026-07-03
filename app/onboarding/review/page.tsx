"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type SectionStatus = {
  label: string;
  complete: boolean;
};

type Inquiry = {
  id: string;
  tenant_name: string | null;
  tenant_phone: string | null;
  status: string;
  conversation_summary: string | null;
  created_at: string;
};

type Viewing = {
  id: string;
  inquiry_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
};

export default function PropertyReview() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  const [sections, setSections] = useState<SectionStatus[]>([]);
  const [listingDraftReady, setListingDraftReady] = useState(false);
  const [photosComplete, setPhotosComplete] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [bookingInquiry, setBookingInquiry] = useState<Inquiry | null>(null);
  const [bookingForm, setBookingForm] = useState({ date: "", time: "" });
  const [bookingStatus, setBookingStatus] = useState<"idle" | "saving" | "error">("idle");
  const [bookingError, setBookingError] = useState("");
  const [propertyStatus, setPropertyStatus] = useState<string>("draft");
  const [publishStatus, setPublishStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [leadToast, setLeadToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();

      const [{ data: property }, { data: rental }, { data: media }, { data: listing }, { data: leads }, { data: viewingRows }] =
        await Promise.all([
          supabase
            .from("properties")
            .select(
              "building_id, unit_number, bedrooms, bathrooms, floor, size_sqft, view_type, furnishing, condition, availability_date, status"
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
            .select("asset_type")
            .eq("property_id", propertyId)
            .eq("status", "uploaded"),
          supabase
            .from("ai_generated_content")
            .select("id")
            .eq("property_id", propertyId)
            .eq("content_type", "marketing_description")
            .eq("is_current", true)
            .maybeSingle(),
          supabase
            .from("tenant_inquiries")
            .select("id, tenant_name, tenant_phone, status, conversation_summary, created_at")
            .eq("property_id", propertyId)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("viewings")
            .select("id, inquiry_id, scheduled_date, scheduled_time, status")
            .eq("property_id", propertyId)
            .in("status", ["proposed", "confirmed"]),
        ]);

      const identity =
        property?.building_id != null && property?.unit_number != null;

      const unitDetails =
        property?.bedrooms != null &&
        property?.bathrooms != null &&
        property?.floor != null &&
        property?.size_sqft != null;

      const propertyDetails =
        property?.view_type != null &&
        property?.furnishing != null &&
        property?.condition != null &&
        property?.availability_date != null;

      const rentalTerms =
        rental != null &&
        rental.asking_price_aed != null &&
        rental.payment_schedule != null &&
        rental.security_deposit_aed != null;

      const requiredMediaTypes = [
        "living_room",
        "bedroom",
        "bathroom",
        "kitchen",
        "view",
        "building_exterior",
      ];
      const mediaTypes = new Set(
        (media ?? []).map((m: { asset_type: string }) => m.asset_type)
      );
      const photosOk =
        requiredMediaTypes.filter((t) => mediaTypes.has(t)).length >= 4;

      setPhotosComplete(photosOk);
      setListingDraftReady(listing != null);
      setPropertyStatus(property?.status ?? "draft");
      setInquiries((leads ?? []) as Inquiry[]);
      setViewings((viewingRows ?? []) as Viewing[]);

      setSections([
        { label: "Identity", complete: identity },
        { label: "Unit Details", complete: unitDetails },
        { label: "Property Details", complete: propertyDetails },
        { label: "Rental Terms", complete: rentalTerms },
        { label: "Photos", complete: photosOk },
      ]);

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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  const completedSections = sections.filter((s) => s.complete);
  const missingSections = sections.filter((s) => !s.complete);
  const readiness = sections.length > 0
    ? Math.round((completedSections.length / sections.length) * 100)
    : 0;

  const extraCompleted: SectionStatus[] = [];
  const extraMissing: SectionStatus[] = [];

  if (listingDraftReady) {
    extraCompleted.push({ label: "Listing Draft", complete: true });
  } else {
    extraMissing.push({ label: "Listing Draft", complete: false });
  }
  extraMissing.push({ label: "AI Review", complete: false });

  const allCompleted = [...completedSections, ...extraCompleted];
  const allMissing = [...missingSections, ...extraMissing];

  const editBase = `propertyId=${propertyId}&edit=true`;

  function getEditHref(label: string): string | null {
    switch (label) {
      case "Identity":
        return `/onboarding/property?${editBase}`;
      case "Unit Details":
        return `/onboarding/unit?${editBase}`;
      case "Property Details":
        return `/onboarding/details?${editBase}`;
      case "Rental Terms":
        return `/onboarding/rental?${editBase}`;
      case "Photos":
        return `/onboarding/media?${editBase}`;
      case "Listing Draft":
        return `/onboarding/story?${editBase}`;
      default:
        return null;
    }
  }

  function getNextStep(): { label: string; href: string } | null {
    if (!photosComplete) {
      return { label: "Next: Upload Photos", href: `/onboarding/media?propertyId=${propertyId}` };
    }
    if (!listingDraftReady) {
      return { label: "Next: Generate Listing", href: `/onboarding/story?propertyId=${propertyId}` };
    }
    if (readiness === 100 && listingDraftReady) {
      return { label: "Export Listing", href: `/onboarding/export?propertyId=${propertyId}` };
    }
    return null;
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  function parseConversationSummary(summary: string | null): { viewingDate: string | null; message: string | null } {
    if (!summary) return { viewingDate: null, message: null };
    let viewingDate: string | null = null;
    let message: string | null = null;
    for (const line of summary.split("\n")) {
      if (line.startsWith("Preferred viewing date:")) {
        viewingDate = line.replace("Preferred viewing date:", "").trim();
      } else if (line.startsWith("Message:")) {
        message = line.replace("Message:", "").trim();
      }
    }
    return { viewingDate, message };
  }

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "active", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "closed", label: "Not interested" },
  ] as const;

  const statusStyles: Record<string, { badge: string; active: string }> = {
    new: {
      badge: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      active: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800",
    },
    active: {
      badge: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      active: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800",
    },
    qualified: {
      badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800",
    },
    closed: {
      badge: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
      active: "bg-zinc-200 text-zinc-600 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600",
    },
    viewing_booked: {
      badge: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      active: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800",
    },
  };

  function formatViewingDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function formatViewingTime(timeStr: string): string {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${suffix}`;
  }

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/property/${propertyId}`
    : `/property/${propertyId}`;

  async function handlePublish() {
    setPublishStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("properties")
      .update({ status: "listed" })
      .eq("id", propertyId);
    if (error) {
      setPublishStatus("error");
      return;
    }
    setPropertyStatus("listed");
    setPublishStatus("success");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  async function handleBookViewing() {
    if (!bookingInquiry || !bookingForm.date || !bookingForm.time || !propertyId) return;
    setBookingStatus("saving");
    setBookingError("");

    const supabase = createClient();
    const { error: viewingError } = await supabase.from("viewings").insert({
      inquiry_id: bookingInquiry.id,
      property_id: propertyId,
      scheduled_date: bookingForm.date,
      scheduled_time: bookingForm.time,
      status: "confirmed",
      tenant_name: bookingInquiry.tenant_name ?? "Unknown",
      tenant_phone: bookingInquiry.tenant_phone,
    });

    if (viewingError) {
      setBookingStatus("error");
      if (viewingError.code === "23505") {
        if (viewingError.message.includes("inquiry_id")) {
          setBookingError("This lead already has a viewing booked.");
        } else {
          setBookingError("A viewing is already scheduled at this date and time.");
        }
      } else {
        setBookingError("Something went wrong. Please try again.");
      }
      return;
    }

    const { error: statusError } = await supabase
      .from("tenant_inquiries")
      .update({ status: "viewing_booked" })
      .eq("id", bookingInquiry.id);

    if (statusError) {
      setBookingStatus("error");
      setBookingError("Viewing created but failed to update lead status.");
      return;
    }

    setInquiries((prev) =>
      prev.map((inq) => (inq.id === bookingInquiry.id ? { ...inq, status: "viewing_booked" } : inq))
    );
    setViewings((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        inquiry_id: bookingInquiry.id,
        scheduled_date: bookingForm.date,
        scheduled_time: bookingForm.time,
        status: "confirmed",
      },
    ]);

    setBookingInquiry(null);
    setBookingForm({ date: "", time: "" });
    setBookingStatus("idle");
  }

  async function updateLeadStatus(inquiryId: string, newStatus: string) {
    const previous = inquiries.find((inq) => inq.id === inquiryId)?.status;
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("tenant_inquiries")
      .update({ status: newStatus })
      .eq("id", inquiryId);
    if (error && previous) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: previous } : inq))
      );
    }
  }

  async function handleDeleteLead(inq: Inquiry) {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    setDeletingLeadId(inq.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("tenant_inquiries")
      .delete()
      .eq("id", inq.id);
    if (error) {
      setDeletingLeadId(null);
      setLeadToast({ type: "error", message: "Failed to delete lead." });
      setTimeout(() => setLeadToast(null), 3000);
      return;
    }
    setInquiries((prev) => prev.filter((i) => i.id !== inq.id));
    setViewings((prev) => prev.filter((v) => v.inquiry_id !== inq.id));
    setDeletingLeadId(null);
    setLeadToast({ type: "success", message: `${inq.tenant_name ?? "Lead"} deleted.` });
    setTimeout(() => setLeadToast(null), 3000);
  }

  const nextStep = getNextStep();

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Property Readiness
          </h1>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {readiness}% Ready
          </p>
        </div>

        {allCompleted.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Completed
            </h2>
            <div className="flex flex-col gap-2">
              {allCompleted.map((s) => {
                const editHref = getEditHref(s.label);
                return (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500">&#10003;</span>
                      <span className="text-sm text-zinc-900 dark:text-zinc-50">
                        {s.label}
                      </span>
                    </div>
                    {editHref && (
                      <Link
                        href={editHref}
                        className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {allMissing.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Missing
            </h2>
            <div className="flex flex-col gap-2">
              {allMissing.map((s) => {
                const editHref = getEditHref(s.label);
                return (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg border border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-300 dark:text-zinc-600">&#9744;</span>
                      <span className="text-sm text-zinc-400 dark:text-zinc-500">
                        {s.label}
                      </span>
                    </div>
                    {editHref && (
                      <Link
                        href={editHref}
                        className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {nextStep && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Next Step
            </h2>
            <Link
              href={nextStep.href}
              className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {nextStep.label}
            </Link>
          </div>
        )}

        {/* ── Publish / Share ── */}
        {propertyStatus === "listed" ? (
          <div data-testid="publish-section" className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Published</span>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Public Link</p>
              <p className="mt-0.5 truncate text-xs text-zinc-700 dark:text-zinc-300">{publicUrl}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                Open
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(publicUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .613.613l4.458-1.495A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.559-.678-6.42-1.847l-.447-.283-3.108 1.041 1.041-3.108-.283-.447A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent("Property for Rent")}&body=${encodeURIComponent(publicUrl)}`}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                Email
              </a>
            </div>
          </div>
        ) : (
          <div data-testid="publish-section" className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishStatus === "saving"}
              className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {publishStatus === "saving" ? "Publishing…" : "Publish Property"}
            </button>
            {publishStatus === "error" && (
              <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
            )}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-lg border border-zinc-200 px-6 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Preview Property
            </a>
          </div>
        )}

        {/* ── Leads Inbox ── */}
        <div data-testid="leads-section" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Leads
            </h2>
            {inquiries.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {inquiries.length}
              </span>
            )}
          </div>

          {leadToast && (
            <div
              className={`rounded-lg px-4 py-2.5 text-xs font-medium ${
                leadToast.type === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {leadToast.message}
            </div>
          )}

          {inquiries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No inquiries yet.
              </p>
              <p className="mt-1 text-xs text-zinc-300 dark:text-zinc-600">
                Once a tenant requests a viewing from the public property page, it will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {inquiries.map((inq) => {
                const { viewingDate, message } = parseConversationSummary(inq.conversation_summary);
                const styles = statusStyles[inq.status] ?? statusStyles.new;
                const viewing = viewings.find((v) => v.inquiry_id === inq.id);
                return (
                  <div
                    key={inq.id}
                    className={`group/lead rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700 ${deletingLeadId === inq.id ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {inq.tenant_name || "Unknown"}
                        </span>
                        {inq.tenant_phone && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {inq.tenant_phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-300 dark:text-zinc-600">
                          {timeAgo(inq.created_at)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(inq)}
                          disabled={deletingLeadId !== null}
                          className="hidden rounded p-1 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 group-hover/lead:block dark:text-zinc-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {(viewingDate || message) && (
                      <div className="mt-2 flex flex-col gap-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                        {viewingDate && (
                          <div className="flex items-center gap-1.5">
                            <svg className="h-3 w-3 text-zinc-300 dark:text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
                            </svg>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {viewingDate}
                            </span>
                          </div>
                        )}
                        {message && (
                          <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
                            &ldquo;{message}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Viewing info or Book Viewing button */}
                    {viewing ? (
                      <div className="mt-2 flex items-center gap-1.5 rounded-md bg-purple-50 px-3 py-2 dark:bg-purple-900/20">
                        <svg className="h-3.5 w-3.5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
                        </svg>
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                          Viewing booked: {formatViewingDate(viewing.scheduled_date)} at {formatViewingTime(viewing.scheduled_time)}
                        </span>
                      </div>
                    ) : inq.status === "qualified" ? (
                      <button
                        type="button"
                        onClick={() => { setBookingInquiry(inq); setBookingForm({ date: "", time: "" }); setBookingStatus("idle"); setBookingError(""); }}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-purple-200 px-3 py-2 text-xs font-semibold text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
                        </svg>
                        Book Viewing
                      </button>
                    ) : null}

                    <div className="mt-2.5 flex gap-1.5 border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateLeadStatus(inq.id, opt.value)}
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors ${
                            inq.status === opt.value
                              ? styles.active
                              : "border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                      {inq.status === "viewing_booked" && (
                        <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${statusStyles.viewing_booked.active}`}>
                          Viewing Booked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {bookingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Book Viewing
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              {bookingInquiry.tenant_name} &middot; {bookingInquiry.tenant_phone}
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Date *
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Time *
                </label>
                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
            </div>

            {bookingError && (
              <p className="mt-3 text-xs text-red-500">{bookingError}</p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => { setBookingInquiry(null); setBookingError(""); }}
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!bookingForm.date || !bookingForm.time || bookingStatus === "saving"}
                onClick={handleBookViewing}
                className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {bookingStatus === "saving" ? "Saving…" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
