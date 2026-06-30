"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const MEDIA_ITEMS = [
  { type: "living_room", label: "Living Room", required: true },
  { type: "kitchen", label: "Kitchen", required: true },
  { type: "bedroom", label: "Bedroom", required: true },
  { type: "bathroom", label: "Bathroom", required: true },
  { type: "view", label: "Balcony / View", required: true },
  { type: "building_exterior", label: "Building Exterior", required: true },
  { type: "floor_plan", label: "Floor Plan", required: false },
] as const;

type MediaRecord = {
  id: string;
  asset_type: string;
  url: string;
  status: string;
};

const BUCKET = "property-media";

export default function MediaUpload() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const editMode = searchParams.get("edit") === "true";

  const [records, setRecords] = useState<Map<string, MediaRecord>>(new Map());
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (!propertyId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("media_assets")
        .select("id, asset_type, url, status")
        .eq("property_id", propertyId);

      if (data) {
        const map = new Map<string, MediaRecord>();
        for (const row of data) {
          map.set(row.asset_type, row);
        }
        setRecords(map);
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  async function handleUpload(assetType: string, file: File) {
    setUploading((prev) => new Set(prev).add(assetType));
    setError(null);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${propertyId}/${assetType}.${ext}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading((prev) => {
        const next = new Set(prev);
        next.delete(assetType);
        return next;
      });
      setError(`Failed to upload ${assetType.replace(/_/g, " ")}. Please try again.`);
      return;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    const existing = records.get(assetType);

    let savedRecord: MediaRecord | null = null;

    if (existing && existing.status !== "needs_update") {
      const { data, error: updateError } = await supabase
        .from("media_assets")
        .update({ url: publicUrl, status: "uploaded" })
        .eq("id", existing.id)
        .select("id, asset_type, url, status")
        .single();

      if (updateError) {
        setError("Failed to save record. Please try again.");
      } else {
        savedRecord = data;
      }
    } else {
      const upsertPayload: Record<string, unknown> = {
        property_id: propertyId,
        asset_type: assetType,
        url: publicUrl,
        status: "uploaded",
        sort_order: MEDIA_ITEMS.findIndex((m) => m.type === assetType),
      };
      if (existing) {
        upsertPayload.id = existing.id;
      }

      const { data, error: upsertError } = await supabase
        .from("media_assets")
        .upsert(upsertPayload)
        .select("id, asset_type, url, status")
        .single();

      if (upsertError) {
        setError("Failed to save record. Please try again.");
      } else {
        savedRecord = data;
      }
    }

    if (savedRecord) {
      setRecords((prev) => {
        const next = new Map(prev);
        next.set(assetType, savedRecord);
        return next;
      });
    }

    setUploading((prev) => {
      const next = new Set(prev);
      next.delete(assetType);
      return next;
    });
  }

  async function handleDelete(assetType: string) {
    const record = records.get(assetType);
    if (!record) return;

    setError(null);
    const supabase = createClient();

    const pathPrefix = `${propertyId}/${assetType}.`;
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(propertyId!, { search: assetType });

    if (files) {
      const toRemove = files
        .filter((f) => f.name.startsWith(`${assetType}.`))
        .map((f) => `${propertyId}/${f.name}`);
      if (toRemove.length > 0) {
        await supabase.storage.from(BUCKET).remove(toRemove);
      }
    }

    await supabase.from("media_assets").delete().eq("id", record.id);

    setRecords((prev) => {
      const next = new Map(prev);
      next.delete(assetType);
      return next;
    });
  }

  function isUploaded(assetType: string): boolean {
    const record = records.get(assetType);
    return record != null && record.status === "uploaded" && record.url !== "pending-upload";
  }

  const uploadedCount = MEDIA_ITEMS.filter(
    (item) => item.required && isUploaded(item.type)
  ).length;

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Photos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Upload photos of your property. {uploadedCount} of 6 required photos
            uploaded.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {MEDIA_ITEMS.map((item) => {
            const uploaded = isUploaded(item.type);
            const record = records.get(item.type);
            const isUploading = uploading.has(item.type);

            return (
              <div
                key={item.type}
                className={`rounded-lg border px-4 py-3 ${
                  uploaded
                    ? "border-zinc-900 dark:border-zinc-50"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {item.label}
                    {!item.required && (
                      <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                        (optional)
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    {uploaded && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.type)}
                        className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    )}

                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current.set(item.type, el);
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(item.type, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() =>
                        fileInputRefs.current.get(item.type)?.click()
                      }
                      className="rounded-md bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading
                        ? "Uploading..."
                        : uploaded
                          ? "Replace"
                          : "Upload"}
                    </button>
                  </div>
                </div>

                {uploaded && record && (
                  <div className="mt-3">
                    <Image
                      src={record.url}
                      alt={item.label}
                      width={400}
                      height={200}
                      className="h-32 w-full rounded-md object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(`/onboarding/review?propertyId=${propertyId}`)
            }
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
          >
            Continue to Review
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
