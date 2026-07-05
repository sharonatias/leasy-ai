"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Card = {
  id: string;
  buildingName: string;
  unitNumber: string;
  readiness: number;
  status: string;
  propertyStatus: string;
  updatedAt: string;
};

export function PropertyCardList({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState(initialCards);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleDelete(e: React.MouseEvent, card: Card) {
    e.preventDefault();
    e.stopPropagation();

    if (card.propertyStatus === "leased") {
      setToast({ type: "error", message: "Cannot delete a leased property." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!window.confirm("Are you sure you want to delete this property? This cannot be undone.")) {
      return;
    }

    setDeletingId(card.id);
    const supabase = createClient();

    const { error: viewingsError } = await supabase
      .from("viewings")
      .delete()
      .eq("property_id", card.id);

    if (viewingsError) {
      setDeletingId(null);
      setToast({ type: "error", message: "Failed to delete viewings. Property not deleted." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const { error: inquiriesError } = await supabase
      .from("tenant_inquiries")
      .delete()
      .eq("property_id", card.id);

    if (inquiriesError) {
      setDeletingId(null);
      setToast({ type: "error", message: "Failed to delete inquiries. Property not deleted." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const { error: propertyError } = await supabase
      .from("properties")
      .delete()
      .eq("id", card.id);

    if (propertyError) {
      setDeletingId(null);
      setToast({ type: "error", message: "Failed to delete property." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setCards((prev) => prev.filter((c) => c.id !== card.id));
    setDeletingId(null);
    setToast({ type: "success", message: `Unit ${card.unitNumber} deleted.` });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="flex flex-col gap-3">
      {toast && (
        <div
          className={`rounded-lg px-4 py-2.5 text-xs font-medium ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {toast.message}
        </div>
      )}

      {cards.map((card) => (
        <div key={card.id} className="group relative">
          <Link
            href={`/onboarding/review?propertyId=${card.id}`}
            data-testid="property-card"
            className={`flex flex-col gap-3 rounded-lg border border-zinc-200 px-5 py-4 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500 ${
              deletingId === card.id ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {card.buildingName}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Unit {card.unitNumber}
                </span>
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
                Continue →
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-1 items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      card.readiness === 100
                        ? "bg-emerald-500"
                        : "bg-zinc-900 dark:bg-zinc-50"
                    }`}
                    style={{ width: `${card.readiness}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {card.readiness}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-medium ${
                  card.status === "Ready"
                    ? "text-emerald-500"
                    : card.status === "In progress"
                      ? "text-amber-500"
                      : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {card.status}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {card.updatedAt}
              </span>
            </div>
          </Link>

          {(card.readiness === 100 || card.propertyStatus === "listed") && (
            <Link
              href={`/find-tenants?propertyId=${card.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 flex items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              🚀 Find Tenants
            </Link>
          )}

          {card.propertyStatus !== "leased" && (
            <button
              type="button"
              onClick={(e) => handleDelete(e, card)}
              disabled={deletingId !== null}
              className="absolute right-2 top-2 hidden rounded-md p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:block dark:text-zinc-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
