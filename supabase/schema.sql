-- Estrutura inicial para o painel separado do site público.
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  whatsapp text not null default '5569984496963',
  instagram text,
  address text,
  opening_hours text,
  logo_url text,
  primary_color text default '#ffd400',
  secondary_color text default '#e52520',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  sort_order integer default 0,
  active boolean default true
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists addons (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0,
  active boolean default true
);

alter table companies enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table addons enable row level security;

-- Public site: leitura somente de empresas/produtos ativos.
create policy "public read active companies" on companies for select using (active = true);
create policy "public read active categories" on categories for select using (active = true);
create policy "public read active products" on products for select using (active = true);
create policy "public read active addons" on addons for select using (active = true);

-- Para produção, as policies de escrita devem ser criadas após cadastrar o
-- usuário administrativo e vincular o usuário à company_id. Nunca coloque
-- service_role key no frontend.
