-- Leasy AI — MVP-0 Database Schema
-- Source: docs/domain/property-domain-model.md
-- Date: 2026-06-29
-- Status: Draft — DO NOT RUN until reviewed and approved
--
-- This schema supports MVP-0 only.
-- No seed data. No RLS policies. No storage buckets.


-- ============================================================================
-- ENUMS
-- ============================================================================

-- Property enums
CREATE TYPE view_type AS ENUM (
  'sea',
  'city',
  'garden',
  'pool',
  'community',
  'other'
);

CREATE TYPE furnishing_type AS ENUM (
  'furnished',
  'semi_furnished',
  'unfurnished'
);

CREATE TYPE condition_type AS ENUM (
  'new',
  'excellent',
  'good',
  'needs_maintenance'
);

CREATE TYPE property_status AS ENUM (
  'draft',
  'in_progress',
  'ready_to_lease',
  'listed',
  'leased'
);

-- Building enums
CREATE TYPE parking_type AS ENUM (
  'included',
  'available_for_purchase',
  'none'
);

-- Rental terms enums
CREATE TYPE min_lease_term_type AS ENUM (
  '6_months',
  '1_year',
  '2_years'
);

CREATE TYPE payment_schedule_type AS ENUM (
  '1_cheque',
  '2_cheques',
  '4_cheques',
  '6_cheques',
  '12_cheques'
);

CREATE TYPE pet_policy_type AS ENUM (
  'allowed',
  'not_allowed',
  'case_by_case'
);

-- Media asset enums
CREATE TYPE asset_type AS ENUM (
  'living_room',
  'bedroom',
  'bathroom',
  'kitchen',
  'view',
  'building_exterior',
  'floor_plan',
  'other'
);

CREATE TYPE asset_status AS ENUM (
  'uploaded',
  'needs_update'
);

-- AI generated content enums
CREATE TYPE content_type AS ENUM (
  'marketing_description',
  'faqs',
  'highlights',
  'weaknesses',
  'improvements',
  'missing_photos'
);

-- Tenant inquiry enums
CREATE TYPE inquiry_channel AS ENUM (
  'whatsapp',
  'web_chat'
);

CREATE TYPE inquiry_status AS ENUM (
  'new',
  'active',
  'qualified',
  'viewing_booked',
  'closed'
);

CREATE TYPE qualification_result AS ENUM (
  'pending',
  'qualified',
  'not_qualified'
);

-- Viewing enums
CREATE TYPE viewing_status AS ENUM (
  'proposed',
  'confirmed',
  'completed',
  'cancelled'
);

-- Onboarding enums
CREATE TYPE onboarding_status AS ENUM (
  'not_started',
  'in_progress',
  'complete'
);


-- ============================================================================
-- UTILITY: auto-update updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- TABLE: projects
-- ============================================================================

CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  city        VARCHAR(100) NOT NULL,
  country     VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable when auth is implemented
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: buildings
-- ============================================================================

CREATE TABLE buildings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID         NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  name            VARCHAR(200) NOT NULL,
  developer       VARCHAR(200),
  total_floors    INTEGER      CHECK (total_floors > 0),
  completion_year INTEGER      CHECK (completion_year >= 1900),
  amenities       TEXT[]       CHECK (array_length(amenities, 1) >= 1),
  parking         parking_type,
  rules           VARCHAR(2000),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_buildings_project_id ON buildings(project_id);

CREATE TRIGGER buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable when auth is implemented
-- ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: properties
-- ============================================================================

CREATE TABLE properties (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id        UUID            NOT NULL REFERENCES buildings(id) ON DELETE RESTRICT,
  unit_number        VARCHAR(20)     NOT NULL,
  floor              INTEGER         CHECK (floor >= 0),
  bedrooms           INTEGER         CHECK (bedrooms >= 0),
  bathrooms          INTEGER         CHECK (bathrooms >= 1),
  size_sqft          NUMERIC         CHECK (size_sqft > 0),
  view_type          view_type,
  furnishing         furnishing_type,
  condition          condition_type,
  availability_date  DATE,
  unique_features    VARCHAR(1000),
  status             property_status NOT NULL DEFAULT 'draft',
  created_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),

  UNIQUE (building_id, unit_number)
);

CREATE INDEX idx_properties_building_id ON properties(building_id);

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable when auth is implemented
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: rental_terms
-- ============================================================================

CREATE TABLE rental_terms (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           UUID                  NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  asking_price_aed      NUMERIC               CHECK (asking_price_aed > 0),
  min_lease_term        min_lease_term_type,
  payment_schedule      payment_schedule_type,
  security_deposit_aed  NUMERIC               CHECK (security_deposit_aed >= 0),
  included_utilities    TEXT[],
  pet_policy            pet_policy_type,
  early_termination     VARCHAR(1000),
  rera_permit           VARCHAR(50),
  ejari_registration    VARCHAR(50),
  created_at            TIMESTAMPTZ           NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ           NOT NULL DEFAULT now()
);

CREATE TRIGGER rental_terms_updated_at
  BEFORE UPDATE ON rental_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable when auth is implemented
-- ALTER TABLE rental_terms ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: media_assets
-- ============================================================================

CREATE TABLE media_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID         NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  asset_type   asset_type   NOT NULL,
  url          TEXT         NOT NULL,
  status       asset_status NOT NULL DEFAULT 'uploaded',
  sort_order   INTEGER      CHECK (sort_order >= 0),
  uploaded_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_assets_property_id ON media_assets(property_id);

-- RLS: Enable when auth is implemented
-- ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: onboarding_progress
-- ============================================================================

CREATE TABLE onboarding_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           UUID              NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  apartment_total       INTEGER           NOT NULL CHECK (apartment_total >= 0),
  apartment_completed   INTEGER           NOT NULL CHECK (apartment_completed >= 0),
  building_total        INTEGER           NOT NULL CHECK (building_total >= 0),
  building_completed    INTEGER           NOT NULL CHECK (building_completed >= 0),
  terms_total           INTEGER           NOT NULL CHECK (terms_total >= 0),
  terms_completed       INTEGER           NOT NULL CHECK (terms_completed >= 0),
  media_total           INTEGER           NOT NULL CHECK (media_total >= 0),
  media_completed       INTEGER           NOT NULL CHECK (media_completed >= 0),
  readiness_score       NUMERIC           NOT NULL DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 1),
  status                onboarding_status NOT NULL DEFAULT 'not_started',
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT now(),

  CHECK (apartment_completed <= apartment_total),
  CHECK (building_completed <= building_total),
  CHECK (terms_completed <= terms_total),
  CHECK (media_completed <= media_total)
);

CREATE TRIGGER onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable when auth is implemented
-- ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: ai_generated_content
-- ============================================================================

CREATE TABLE ai_generated_content (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID         NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  content_type  content_type NOT NULL,
  content       VARCHAR(10000) NOT NULL,
  version       INTEGER      NOT NULL DEFAULT 1 CHECK (version >= 1),
  is_current    BOOLEAN      NOT NULL DEFAULT true,
  generated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_content_property_current ON ai_generated_content(property_id, is_current)
  WHERE is_current = true;

-- RLS: Enable when auth is implemented
-- ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: tenant_inquiries
-- ============================================================================

CREATE TABLE tenant_inquiries (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id               UUID                 NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  channel                   inquiry_channel      NOT NULL,
  tenant_name               VARCHAR(200),
  tenant_phone              VARCHAR(20),
  tenant_email              VARCHAR(200),
  status                    inquiry_status       NOT NULL DEFAULT 'new',
  qualification_budget      NUMERIC              CHECK (qualification_budget > 0),
  qualification_move_in     DATE,
  qualification_household   INTEGER              CHECK (qualification_household > 0),
  qualification_lease_term  VARCHAR(50),
  qualification_result      qualification_result DEFAULT 'pending',
  conversation_summary      VARCHAR(5000),
  created_at                TIMESTAMPTZ          NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ          NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_property_id ON tenant_inquiries(property_id);
CREATE INDEX idx_inquiries_status ON tenant_inquiries(status);

CREATE TRIGGER tenant_inquiries_updated_at
  BEFORE UPDATE ON tenant_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable when auth is implemented
-- ALTER TABLE tenant_inquiries ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TABLE: viewings
-- ============================================================================

CREATE TABLE viewings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id           UUID           NOT NULL UNIQUE REFERENCES tenant_inquiries(id) ON DELETE CASCADE,
  property_id          UUID           NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  scheduled_date       DATE           NOT NULL,
  scheduled_time       TIME           NOT NULL,
  status               viewing_status NOT NULL DEFAULT 'proposed',
  tenant_name          VARCHAR(200)   NOT NULL,
  tenant_phone         VARCHAR(20),
  owner_notified       BOOLEAN        NOT NULL DEFAULT false,
  owner_notified_at    TIMESTAMPTZ,
  cancellation_reason  VARCHAR(500),
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_viewings_property_id ON viewings(property_id);
CREATE INDEX idx_viewings_no_double_booking ON viewings(property_id, scheduled_date, scheduled_time)
  WHERE status IN ('proposed', 'confirmed');

CREATE TRIGGER viewings_updated_at
  BEFORE UPDATE ON viewings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable when auth is implemented
-- ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;
