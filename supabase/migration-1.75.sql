-- ============================================================================
-- MIGRATION 1.75: EXPAND SERVICE_TYPE CHECK CONSTRAINT
-- Objective 1.75.3 — Support 8 service offerings in public.projects
-- ============================================================================

alter table public.projects
  drop constraint if exists projects_service_type_check;

alter table public.projects
  add constraint projects_service_type_check check (service_type in
    ('formatting','editing','lit_review','coaching',
     'drafting','data_analysis','figures','defense_deck'));
