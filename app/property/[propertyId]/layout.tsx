import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ propertyId: string }>;
  children: React.ReactNode;
};

function formatEnum(value: string | null): string {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatViewType(value: string | null): string {
  if (!value) return "";
  const formatted = formatEnum(value);
  if (value === "other" || formatted.toLowerCase().endsWith("view")) return formatted;
  return `${formatted} View`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { propertyId } = await params;
  const supabase = await createClient();

  const [{ data: property }, { data: rental }, { data: media }, { data: listing }] =
    await Promise.all([
      supabase
        .from("properties")
        .select(
          "unit_number, bedrooms, bathrooms, size_sqft, view_type, furnishing, buildings(name)"
        )
        .eq("id", propertyId)
        .single(),
      supabase
        .from("rental_terms")
        .select("asking_price_aed")
        .eq("property_id", propertyId)
        .maybeSingle(),
      supabase
        .from("media_assets")
        .select("url")
        .eq("property_id", propertyId)
        .eq("status", "uploaded")
        .order("sort_order")
        .limit(1),
      supabase
        .from("ai_generated_content")
        .select("content")
        .eq("property_id", propertyId)
        .eq("content_type", "marketing_description")
        .eq("is_current", true)
        .maybeSingle(),
    ]);

  if (!property) {
    return { title: "Property | Leasy AI" };
  }

  const buildingName =
    (property as Record<string, unknown>).buildings
      ? ((property as Record<string, unknown>).buildings as { name: string }).name
      : "Property";
  const unit = property.unit_number ?? "";

  const titleParts = [`${buildingName} Unit ${unit}`];
  if (property.bedrooms != null) titleParts.push(`${property.bedrooms} BR`);
  if (rental?.asking_price_aed) titleParts.push(`AED ${rental.asking_price_aed.toLocaleString("en-AE")}/yr`);
  const pageTitle = titleParts.join(" — ");

  let description = "";
  if (listing?.content) {
    try {
      const parsed = JSON.parse(listing.content);
      if (parsed.description) {
        description = parsed.description.length > 155
          ? parsed.description.slice(0, 152) + "..."
          : parsed.description;
      }
    } catch { /* ignore */ }
  }
  if (!description) {
    const parts: string[] = [];
    if (property.furnishing) parts.push(formatEnum(property.furnishing));
    if (property.bedrooms != null) parts.push(`${property.bedrooms}-bedroom apartment`);
    if (property.size_sqft != null) parts.push(`${property.size_sqft.toLocaleString()} sqft`);
    if (property.view_type) parts.push(formatViewType(property.view_type).toLowerCase());
    description = parts.length
      ? `${parts.join(", ")} at ${buildingName}. Available for rent in Dubai.`
      : `${buildingName} Unit ${unit} — Available for rent in Dubai.`;
  }

  const heroImage = (media ?? []).length > 0 ? (media as { url: string }[])[0].url : null;

  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://leasy.ai"}/property/${propertyId}`;

  const metadata: Metadata = {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      siteName: "Leasy AI",
      type: "website",
      ...(heroImage ? { images: [{ url: heroImage, width: 1200, height: 630, alt: `${buildingName} Unit ${unit}` }] } : {}),
    },
    twitter: {
      card: heroImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      ...(heroImage ? { images: [heroImage] } : {}),
    },
  };

  return metadata;
}

export default function PropertyLayout({ children }: Props) {
  return children;
}
