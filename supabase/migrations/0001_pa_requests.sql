create table if not exists pa_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null,
  payer text not null,
  cpt_code text not null,
  chart_text text,
  status text not null,
  pa_packet jsonb,
  escalation jsonb,
  traces jsonb,
  created_at timestamptz not null default now()
);

alter table pa_requests enable row level security;

-- Public demo: anyone can read submitted packets and insert new requests.
create policy "public read" on pa_requests for select using (true);
create policy "public insert" on pa_requests for insert with check (true);
