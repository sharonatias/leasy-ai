-- Market Intelligence: market_profiles table
-- Run this manually in Supabase SQL Editor

create table market_profiles (
  id            uuid primary key default gen_random_uuid(),
  country       text not null,
  city          text not null,
  community     text not null,
  building      text not null,
  property_type text not null default 'apartment',
  data          jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_market_profiles_building on market_profiles (building);
create index idx_market_profiles_location on market_profiles (community, city, country);

-- Auto-update updated_at on row change
create or replace function update_market_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_market_profiles_updated_at
  before update on market_profiles
  for each row
  execute function update_market_profiles_updated_at();

-- Enable RLS
alter table market_profiles enable row level security;

-- Allow public read access (market data is not sensitive)
create policy "Market profiles are publicly readable"
  on market_profiles for select
  using (true);

-- Seed: MAG 330 Tower
insert into market_profiles (country, city, community, building, property_type, data)
values (
  'UAE',
  'Dubai',
  'City of Arabia',
  'MAG 330 Tower',
  'apartment',
  '{
    "snapshot": {
      "kpis": [
        { "label": "Market Demand", "value": "HIGH", "detail": "Based on area search volume", "highlight": true },
        { "label": "Competition", "value": "37", "detail": "Active listings nearby" },
        { "label": "Average Price", "value": "87,500", "detail": "AED / year" },
        { "label": "Your Price", "value": "85,000", "detail": "AED / year" },
        { "label": "Price Position", "value": "Below Avg", "detail": "2,500 AED under market", "highlight": true },
        { "label": "Est. Days to Rent", "value": "14", "detail": "Based on similar units" }
      ],
      "recommendation": {
        "title": "Recommendation",
        "text": "Excellent pricing. Your unit is competitively positioned below the area average with strong amenities. High probability of fast tenant acquisition."
      }
    },
    "audiences": [
      { "audience": "Young Professionals", "matchScore": 5, "reasons": ["Close to business districts", "Pool & Gym", "Fully Furnished"] },
      { "audience": "Young Couples", "matchScore": 4, "reasons": ["2-bedroom layout", "Modern interiors", "Community amenities"] },
      { "audience": "Small Families", "matchScore": 3, "reasons": ["Kids playground", "Secure building", "Spacious 1,200 sqft"] },
      { "audience": "Investors", "matchScore": 3, "reasons": ["High rental yield area", "Strong demand", "Low vacancy rate"] }
    ],
    "nearby": [
      { "category": "Major Employer", "name": "Dubai Silicon Oasis HQ", "distance": "10 min", "relevance": "Attracts tech professionals seeking nearby housing", "icon": "🏢" },
      { "category": "School", "name": "GEMS Wellington Academy", "distance": "8 min", "relevance": "Top-rated school — key for family tenants", "icon": "🎓" },
      { "category": "University", "name": "Heriot-Watt University Dubai", "distance": "12 min", "relevance": "Student and faculty housing demand", "icon": "🏛️" },
      { "category": "Shopping", "name": "City Centre Al Zahia", "distance": "5 min", "relevance": "Daily convenience for all tenant profiles", "icon": "🛒" },
      { "category": "Entertainment", "name": "IMG Worlds of Adventure", "distance": "5 min", "relevance": "Major attraction — appeals to families and young professionals", "icon": "🎡" },
      { "category": "Transportation", "name": "Dubai Metro (Green Line)", "distance": "15 min", "relevance": "Public transit access increases tenant pool", "icon": "🚇" }
    ],
    "competitors": [
      { "price": "82,000", "bedrooms": 2, "view": "Community View", "agency": "Allsopp & Allsopp", "strength": "Lower price point", "weakness": "No pool view, unfurnished" },
      { "price": "90,000", "bedrooms": 2, "view": "Pool View", "agency": "Betterhomes", "strength": "Same view type, established agency", "weakness": "Higher price, smaller layout" },
      { "price": "88,000", "bedrooms": 2, "view": "Garden View", "agency": "Driven Properties", "strength": "Garden view premium", "weakness": "Semi-furnished, older fit-out" },
      { "price": "95,000", "bedrooms": 3, "view": "Pool View", "agency": "Haus & Haus", "strength": "3 bedrooms, larger unit", "weakness": "Significantly higher price" }
    ],
    "brokers": [
      { "name": "Allsopp & Allsopp", "specialization": "Dubai residential rentals", "listingsInBuilding": 5, "website": "https://www.allsoppandallsopp.com" },
      { "name": "Betterhomes", "specialization": "Premium apartments & villas", "listingsInBuilding": 3, "website": "https://www.betterhomes.com" },
      { "name": "Driven Properties", "specialization": "Off-plan & secondary market", "listingsInBuilding": 2, "website": "https://www.drivenproperties.ae" }
    ],
    "marketing": [
      { "label": "Target British Expats", "icon": "🇬🇧" },
      { "label": "Target Young Professionals", "icon": "💼" },
      { "label": "Run Meta Ads", "icon": "📣" },
      { "label": "Contact Local Agencies", "icon": "🏢" },
      { "label": "Share with Community Groups", "icon": "👥" }
    ]
  }'::jsonb
);
