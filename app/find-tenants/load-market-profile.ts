import { createClient } from "@/lib/supabase/client";

export type KPI = {
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
};

export type SnapshotData = {
  kpis: KPI[];
  recommendation: { title: string; text: string };
};

export type TenantProfile = {
  audience: string;
  matchScore: number;
  reasons: string[];
};

export type AreaItem = {
  category: string;
  name: string;
  distance: string;
  relevance: string;
  icon: string;
};

export type Competitor = {
  price: string;
  bedrooms: number;
  view: string;
  agency: string;
  strength: string;
  weakness: string;
};

export type Broker = {
  name: string;
  specialization: string;
  listingsInBuilding: number;
  website: string;
};

export type MarketingItem = {
  label: string;
  icon: string;
};

export type MarketProfile = {
  snapshot: SnapshotData;
  audiences: TenantProfile[];
  nearby: AreaItem[];
  competitors: Competitor[];
  brokers: Broker[];
  marketing: MarketingItem[];
};

export async function loadMarketProfile(
  buildingName: string
): Promise<MarketProfile | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from("market_profiles")
    .select("data")
    .eq("building", buildingName)
    .limit(1)
    .maybeSingle();

  if (!data?.data) return null;

  const json = data.data as Record<string, unknown>;

  return {
    snapshot: (json.snapshot as SnapshotData) ?? { kpis: [], recommendation: { title: "", text: "" } },
    audiences: (json.audiences as TenantProfile[]) ?? [],
    nearby: (json.nearby as AreaItem[]) ?? [],
    competitors: (json.competitors as Competitor[]) ?? [],
    brokers: (json.brokers as Broker[]) ?? [],
    marketing: (json.marketing as MarketingItem[]) ?? [],
  };
}
