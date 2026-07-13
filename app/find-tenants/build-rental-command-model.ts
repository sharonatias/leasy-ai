import type { MarketProfile } from "./load-market-profile";

// ── Strategy Brief ──────────────────────────────────────────────

export type StrategyAction = { label: string; done: boolean };

export type StrategyBriefModel = {
  successProbability: number;
  expectedDays: number;
  estimatedLeads: string;
  marketStatus: string;
  marketStatusColor: "emerald" | "amber" | "red";
  recommendation: string;
  actions: StrategyAction[];
};

// ── Intelligence Score ──────────────────────────────────────────

export type ScoreCategory = {
  label: string;
  score: number;
  max: number;
};

export type ScoreImprovement = { label: string; impact: string };

export type IntelligenceScoreModel = {
  total: number;
  categories: ScoreCategory[];
  improvements: ScoreImprovement[];
};

// ── Market Snapshot ─────────────────────────────────────────────

export type SnapshotKPI = {
  label: string;
  value: string;
  detail?: string;
  color: "emerald" | "amber" | "red" | "default";
};

export type MarketSnapshotModel = {
  kpis: SnapshotKPI[];
  recommendation: { title: string; text: string };
};

// ── Competition ─────────────────────────────────────────────────

export type CompetitionKPI = {
  label: string;
  value: string;
  detail?: string;
};

export type CompetitorCard = {
  price: string;
  bedrooms: number;
  view: string;
  agency: string;
  strength: string;
  weakness: string;
};

export type CompetitionModel = {
  summary: CompetitionKPI[];
  competitors: CompetitorCard[];
};

// ── Audience ────────────────────────────────────────────────────

export type AudienceCard = {
  audience: string;
  matchScore: number;
  reasons: string[];
  estimatedSize: string;
  isPrimary: boolean;
};

export type AudienceModel = {
  primaryAudience: string;
  secondaryAudience: string;
  confidence: string;
  profiles: AudienceCard[];
};

// ── Area Intelligence ───────────────────────────────────────────

export type AreaEntry = {
  name: string;
  distance: string;
  relevance: string;
  icon: string;
};

export type AreaGroup = {
  category: string;
  items: AreaEntry[];
};

export type AreaIntelligenceModel = {
  groups: AreaGroup[];
};

// ── Broker Intelligence ─────────────────────────────────────────

export type BrokerCard = {
  name: string;
  specialization: string;
  listingsInBuilding: number;
  website: string;
  recommended: boolean;
  reason: string;
};

export type BrokerModel = {
  brokers: BrokerCard[];
};

// ── Distribution Strategy ───────────────────────────────────────

export type DistributionChannel = {
  name: string;
  icon: string;
  status: "Published" | "Ready" | "Recommended" | "Pending";
  priority: "High" | "Medium" | "Low";
  expectedLeads: string;
  estimatedROI: string;
  mode: "Manual" | "Automatic";
};

export type DistributionModel = {
  channels: DistributionChannel[];
};

// ── Marketing Strategy ──────────────────────────────────────────

export type MarketingRecommendation = {
  label: string;
  icon: string;
  reason: string;
  estimatedImpact: string;
  estimatedCost: string;
  estimatedLeads: string;
};

export type MarketingModel = {
  recommendations: MarketingRecommendation[];
};

// ── Timeline ────────────────────────────────────────────────────

export type TimelineEntry = {
  day: number;
  label: string;
  action: string;
};

export type TimelineModel = {
  entries: TimelineEntry[];
};

// ── Next Best Action ────────────────────────────────────────────

export type NextBestActionModel = {
  title: string;
  description: string;
  impact: string;
  buttonLabel: string;
};

// ── Full Model ──────────────────────────────────────────────────

export type RentalCommandModel = {
  strategy: StrategyBriefModel;
  score: IntelligenceScoreModel;
  snapshot: MarketSnapshotModel;
  competition: CompetitionModel;
  audience: AudienceModel;
  area: AreaIntelligenceModel;
  brokers: BrokerModel;
  distribution: DistributionModel;
  marketing: MarketingModel;
  timeline: TimelineModel;
  nextAction: NextBestActionModel;
};

// ── Builder ─────────────────────────────────────────────────────

const CATEGORY_ORDER = ["Major Employer", "School", "University", "Shopping", "Entertainment", "Transportation"];
const CATEGORY_GROUPS: Record<string, string> = {
  "Major Employer": "Employers",
  "School": "Education",
  "University": "Education",
  "Shopping": "Lifestyle",
  "Entertainment": "Lifestyle",
  "Transportation": "Transport",
};

function kpiColor(label: string, value: string): "emerald" | "amber" | "red" | "default" {
  const l = label.toLowerCase();
  const v = value.toLowerCase();
  if (l.includes("demand") && v === "high") return "emerald";
  if (l.includes("demand") && v === "medium") return "amber";
  if (l.includes("demand") && v === "low") return "red";
  if (l.includes("position") && v.includes("below")) return "emerald";
  if (l.includes("position") && v.includes("above")) return "red";
  if (l.includes("days") && parseInt(value) <= 14) return "emerald";
  if (l.includes("days") && parseInt(value) <= 30) return "amber";
  if (l.includes("days") && parseInt(value) > 30) return "red";
  return "default";
}

export function buildRentalCommandModel(
  profile: MarketProfile,
  propertyStatus: string
): RentalCommandModel {
  // ── Strategy Brief ──
  const demandKpi = profile.snapshot.kpis.find(k => k.label.toLowerCase().includes("demand"));
  const demandLevel = demandKpi?.value?.toUpperCase() ?? "MEDIUM";
  const daysKpi = profile.snapshot.kpis.find(k => k.label.toLowerCase().includes("days"));
  const expectedDays = parseInt(daysKpi?.value ?? "21") || 21;

  const strategy: StrategyBriefModel = {
    successProbability: demandLevel === "HIGH" ? 91 : demandLevel === "MEDIUM" ? 72 : 48,
    expectedDays: expectedDays,
    estimatedLeads: demandLevel === "HIGH" ? "18–24" : demandLevel === "MEDIUM" ? "10–15" : "5–8",
    marketStatus: `${demandLevel} DEMAND`,
    marketStatusColor: demandLevel === "HIGH" ? "emerald" : demandLevel === "MEDIUM" ? "amber" : "red",
    recommendation: profile.snapshot.recommendation.text,
    actions: [
      { label: "Keep current price", done: true },
      { label: "Publish on Bayut", done: propertyStatus === "listed" },
      { label: `Contact ${profile.brokers[0]?.name ?? "local agency"}`, done: false },
      { label: "Launch Meta campaign", done: false },
    ],
  };

  // ── Intelligence Score ──
  const hasPhotos = true; // already checked via distribution score
  const isPublished = propertyStatus === "listed";
  const hasStory = true;
  const marketScore = demandLevel === "HIGH" ? 20 : demandLevel === "MEDIUM" ? 14 : 8;
  const competitionScore = profile.competitors.length > 0 ? 16 : 10;
  const marketingScore = isPublished ? 18 : 10;
  const distributionScore = isPublished ? 20 : 12;
  const audienceScore = profile.audiences.length >= 3 ? 17 : 10;
  const total = marketScore + competitionScore + marketingScore + distributionScore + audienceScore;

  const score: IntelligenceScoreModel = {
    total,
    categories: [
      { label: "Market", score: marketScore, max: 20 },
      { label: "Competition", score: competitionScore, max: 20 },
      { label: "Marketing", score: marketingScore, max: 20 },
      { label: "Distribution", score: distributionScore, max: 20 },
      { label: "Audience", score: audienceScore, max: 20 },
    ],
    improvements: [
      ...(!hasPhotos ? [{ label: "Add video tour", impact: "+5" }] : []),
      { label: "Mention Pool View in ads", impact: "+3" },
      { label: "Contact agencies directly", impact: "+4" },
      ...(!isPublished ? [{ label: "Publish property listing", impact: "+8" }] : []),
    ],
  };

  // ── Market Snapshot ──
  const snapshot: MarketSnapshotModel = {
    kpis: profile.snapshot.kpis.map(k => ({
      label: k.label,
      value: k.value,
      detail: k.detail,
      color: kpiColor(k.label, k.value),
    })),
    recommendation: profile.snapshot.recommendation,
  };

  // ── Competition ──
  const prices = profile.competitors.map(c => parseInt(c.price.replace(/,/g, ""))).filter(n => !isNaN(n));
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const yourPriceKpi = profile.snapshot.kpis.find(k => k.label.toLowerCase().includes("your price"));
  const yourPrice = parseInt(yourPriceKpi?.value?.replace(/,/g, "") ?? "0") || 0;
  const position = yourPrice < avgPrice ? "Below Average" : yourPrice > avgPrice ? "Above Average" : "At Average";

  const competition: CompetitionModel = {
    summary: [
      { label: "Average Price", value: avgPrice.toLocaleString(), detail: "AED/yr" },
      { label: "Lowest", value: minPrice.toLocaleString(), detail: "AED/yr" },
      { label: "Highest", value: maxPrice.toLocaleString(), detail: "AED/yr" },
      { label: "Your Position", value: position },
      { label: "Active Listings", value: profile.snapshot.kpis.find(k => k.label.toLowerCase().includes("competition"))?.value ?? "—" },
    ],
    competitors: profile.competitors,
  };

  // ── Audience ──
  const sorted = [...profile.audiences].sort((a, b) => b.matchScore - a.matchScore);
  const sizeMap: Record<number, string> = { 5: "~12,000", 4: "~8,500", 3: "~5,000", 2: "~2,500", 1: "~1,000" };

  const audience: AudienceModel = {
    primaryAudience: sorted[0]?.audience ?? "—",
    secondaryAudience: sorted[1]?.audience ?? "—",
    confidence: sorted[0]?.matchScore >= 4 ? "High" : "Medium",
    profiles: sorted.map((p, i) => ({
      audience: p.audience,
      matchScore: p.matchScore,
      reasons: p.reasons,
      estimatedSize: sizeMap[p.matchScore] ?? "~3,000",
      isPrimary: i === 0,
    })),
  };

  // ── Area Intelligence ──
  const groupMap = new Map<string, AreaEntry[]>();
  for (const item of profile.nearby) {
    const group = CATEGORY_GROUPS[item.category] ?? item.category;
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push({
      name: item.name,
      distance: item.distance,
      relevance: item.relevance,
      icon: item.icon,
    });
  }
  const groupOrder = ["Employers", "Education", "Lifestyle", "Transport"];
  const area: AreaIntelligenceModel = {
    groups: groupOrder
      .filter(g => groupMap.has(g))
      .map(g => ({ category: g, items: groupMap.get(g)! })),
  };

  // ── Broker Intelligence ──
  const topBroker = profile.brokers.reduce((a, b) => a.listingsInBuilding > b.listingsInBuilding ? a : b, profile.brokers[0]);
  const brokers: BrokerModel = {
    brokers: profile.brokers.map(b => ({
      name: b.name,
      specialization: b.specialization,
      listingsInBuilding: b.listingsInBuilding,
      website: b.website,
      recommended: b.name === topBroker?.name,
      reason: b.name === topBroker?.name
        ? `Most active in this building with ${b.listingsInBuilding} listings`
        : `Specializes in ${b.specialization.toLowerCase()}`,
    })),
  };

  // ── Distribution Strategy ──
  const distribution: DistributionModel = {
    channels: [
      { name: "Website", icon: "🌐", status: isPublished ? "Published" : "Pending", priority: "High", expectedLeads: "3–5", estimatedROI: "Free", mode: "Automatic" },
      { name: "Bayut", icon: "🏢", status: "Ready", priority: "High", expectedLeads: "8–12", estimatedROI: "High", mode: "Manual" },
      { name: "Property Finder", icon: "🔍", status: "Ready", priority: "High", expectedLeads: "6–10", estimatedROI: "High", mode: "Manual" },
      { name: "Dubizzle", icon: "📋", status: "Ready", priority: "Medium", expectedLeads: "4–6", estimatedROI: "Medium", mode: "Manual" },
      { name: "WhatsApp", icon: "💬", status: "Ready", priority: "Medium", expectedLeads: "2–4", estimatedROI: "Free", mode: "Manual" },
      { name: "Facebook", icon: "📘", status: "Recommended", priority: "Medium", expectedLeads: "3–5", estimatedROI: "Low", mode: "Manual" },
      { name: "Telegram", icon: "✈️", status: "Recommended", priority: "Low", expectedLeads: "1–3", estimatedROI: "Free", mode: "Manual" },
    ],
  };

  // ── Marketing Strategy ──
  const marketing: MarketingModel = {
    recommendations: profile.marketing.map(m => {
      const enrichment = MARKETING_ENRICHMENT[m.label] ?? { reason: "Increases visibility", impact: "Medium", cost: "Free", leads: "2–4" };
      return {
        label: m.label,
        icon: m.icon,
        reason: enrichment.reason,
        estimatedImpact: enrichment.impact,
        estimatedCost: enrichment.cost,
        estimatedLeads: enrichment.leads,
      };
    }),
  };

  // ── Timeline ──
  const timeline: TimelineModel = {
    entries: [
      { day: 1, label: "Launch", action: "Publish listing on website" },
      { day: 2, label: "Social", action: "Post in Facebook groups" },
      { day: 3, label: "Messaging", action: "Share on Telegram & WhatsApp" },
      { day: 5, label: "Outreach", action: "Contact top brokers" },
      { day: 10, label: "Review", action: "Evaluate leads & adjust price" },
      { day: 14, label: "Boost", action: "Launch paid ads if needed" },
      { day: 21, label: "Refresh", action: "Update listing photos & copy" },
      { day: 30, label: "Assess", action: "Full strategy review" },
    ],
  };

  // ── Next Best Action ──
  const nextAction: NextBestActionModel = !isPublished
    ? { title: "Publish Your Listing", description: "Your property is ready but not yet published. Publishing unlocks all distribution channels.", impact: "+20% distribution score", buttonLabel: "Go to Review" }
    : { title: `Contact ${topBroker?.name ?? "a local broker"}`, description: `${topBroker?.name ?? "This agency"} has ${topBroker?.listingsInBuilding ?? 0} active listings in your building and can accelerate tenant acquisition.`, impact: "+14% exposure", buttonLabel: "Start" };

  return { strategy, score, snapshot, competition, audience, area, brokers, distribution, marketing, timeline, nextAction };
}

const MARKETING_ENRICHMENT: Record<string, { reason: string; impact: string; cost: string; leads: string }> = {
  "Target British Expats": { reason: "Large expat community in Dubai seeking furnished rentals", impact: "High", cost: "200 AED", leads: "8–12" },
  "Target Young Professionals": { reason: "Growing tech workforce near City of Arabia", impact: "High", cost: "150 AED", leads: "6–10" },
  "Run Meta Ads": { reason: "High competition requires paid visibility", impact: "High", cost: "300 AED", leads: "12–18" },
  "Contact Local Agencies": { reason: "Brokers have existing tenant databases", impact: "Medium", cost: "Free", leads: "4–8" },
  "Share with Community Groups": { reason: "Direct access to active renters", impact: "Medium", cost: "Free", leads: "3–5" },
};
