create extension if not exists "uuid-ossp";

-- 1. Charities Directory (§ 08)
create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  logo_url text,
  featured boolean default false,
  events jsonb default '[]'::jsonb,
  total_donations_received numeric default 0.0,
  created_at timestamptz default now()
);

-- 2. User Profiles & Subscriptions (§ 03, § 04, § 08)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text check (role in ('subscriber', 'admin')) default 'subscriber',
  subscription_status text check (subscription_status in ('inactive', 'active', 'lapsed', 'cancelled')) default 'active',
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')) default 'monthly',
  subscription_renewal_date date default (current_date + interval '30 days'),
  charity_id uuid references public.charities(id),
  charity_percentage numeric default 10.0 check (charity_percentage >= 10.0),
  created_at timestamptz default now()
);

-- 3. Golf Scores with Strict Date Uniqueness (§ 05)
create table public.golf_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  score_date date not null,
  score int check (score between 1 and 45) not null,
  created_at timestamptz default now(),
  unique(user_id, score_date)
);

-- 4. Draws Engine (§ 06, § 07)
create table public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_date date not null default current_date,
  draw_type text check (draw_type in ('random', 'algorithmic')) default 'random',
  winning_numbers int[] not null,
  jackpot_pool numeric default 0.0,
  pool_4_match numeric default 0.0,
  pool_3_match numeric default 0.0,
  charity_pool numeric default 0.0,
  status text check (status in ('draft_simulation', 'published')) default 'draft_simulation',
  created_at timestamptz default now()
);

-- 5. Winner Verification & Payout Tracking (§ 09)
create table public.draw_winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_tier text check (match_tier in ('5_match', '4_match', '3_match')) not null,
  prize_amount numeric not null,
  proof_screenshot_url text,
  verification_status text check (verification_status in ('pending_upload', 'under_review', 'approved', 'rejected')) default 'pending_upload',
  payout_status text check (payout_status in ('pending', 'paid')) default 'pending',
  created_at timestamptz default now()
);

-- Seed Initial Verified Charities (§ 08.2)
insert into public.charities (name, description, featured, events) values
('Fairway to Future', 'Empowering youth through athletics, academic tutoring, and emotional mentorship.', true, '[{"title": "Spring Youth Open", "date": "2026-05-12"}]'),
('Clean Water Horizons', 'Engineering decentralized solar-powered water filtration for vulnerable communities.', true, '[{"title": "Global Water Walk", "date": "2026-06-20"}]'),
('EcoReforest Alliance', 'Restoring native ecosystems, wildlife corridors, and urban biodiversity reserves.', false, '[]');

-- Setup Supabase Storage for Proof Screenshots (§ 09)
insert into storage.buckets (id, name, public) values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Row Level Security (RLS)
alter table public.charities enable row level security;
alter table public.profiles enable row level security;
alter table public.golf_scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_winners enable row level security;

create policy "Public read charities" on public.charities for select using (true);
create policy "Users read/write own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users read/write own scores" on public.golf_scores for all using (auth.uid() = user_id);
create policy "Public read published draws" on public.draws for select using (status = 'published');
create policy "Users read own winnings" on public.draw_winners for select using (auth.uid() = user_id);
create policy "Users update own proof" on public.draw_winners for update using (auth.uid() = user_id);