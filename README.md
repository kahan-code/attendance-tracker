# Attendance Leave Tracker

A clean, responsive attendance tracker that stores class and leave data in Supabase.

## Features
- Email/password authentication (Supabase Auth)
- Attendance data isolated per signed-in user
- Add, edit, and remove classes
- Track max leaves and leaves taken per class
- Add, edit, and remove leave dates
- One-click mark leave for the selected class
- Summary stats for classes, taken leaves, and remaining leaves
- Toggleable leaves table
- Reset all class data

## Tech Stack
- HTML, CSS, vanilla JavaScript
- Supabase JavaScript client (browser ESM CDN)

## Supabase Configuration
The app is already configured in [app.js](app.js) with:
- URL: `https://hwdwhrtsjhpbjcfzjcky.supabase.co`
- Publishable key: `sb_publishable_Znet58KwaxCwGcgxxabHbw_bsf6eoY0`

## Required Table
Create a table named `classes` with columns:
- `id` (uuid or bigint primary key)
- `user_id` (uuid, references auth.users.id)
- `name` (text)
- `max` (integer)
- `taken` (integer)
- `dates` (text[])

Example SQL:

```sql
create table if not exists public.classes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  max integer not null default 0,
  taken integer not null default 0,
  dates text[] not null default '{}'
);

create index if not exists classes_user_id_idx on public.classes(user_id);
```

## RLS Note
If Row Level Security is enabled, add policies allowing the operations used by the app:
- `select`
- `insert`
- `update`
- `delete`

Recommended policy setup:

```sql
alter table public.classes enable row level security;

create policy "Users can view their own classes"
on public.classes
for select
using (auth.uid() = user_id);

create policy "Users can insert their own classes"
on public.classes
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own classes"
on public.classes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own classes"
on public.classes
for delete
using (auth.uid() = user_id);
```

## Run
Open [index.html](index.html) in a browser.
