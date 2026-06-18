-- ====================================================================
-- GOBSOR ARENA - SUPABASE BACKEND SCHEMA SETUP SQL
-- Run this in your Supabase SQL Editor (https://supabase.com)
-- ====================================================================

-- 1. Create Profile / Auth table sync
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location_preference TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Setup profile policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Venues / Pitch grounds table
CREATE TABLE IF NOT EXISTS public.venues (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('5-aside', '7-aside', '11-aside')),
  location TEXT NOT NULL,
  next_slot TEXT,
  image TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  reviews_count BIGINT DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read venues, but only admins to edit/insert/delete
CREATE POLICY "Allow read access to venues for all" 
  ON public.venues FOR SELECT USING (true);

CREATE POLICY "Allow write access to venues for admins" 
  ON public.venues FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- 3. Create Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  venue_id BIGINT REFERENCES public.venues(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  venue_location TEXT NOT NULL,
  venue_size TEXT NOT NULL,
  venue_image TEXT NOT NULL,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  player_name TEXT NOT NULL,
  player_phone TEXT NOT NULL,
  extras JSONB DEFAULT '{"bibs": false, "ballHire": false, "referee": false}'::jsonb,
  total_price NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow read access to logins / public (for matching booked slots check)
CREATE POLICY "Allow read access to bookings" 
  ON public.bookings FOR SELECT USING (true);

-- Allow booking insertions for anyone
CREATE POLICY "Allow inserting bookings" 
  ON public.bookings FOR INSERT WITH CHECK (true);

-- Allow admin control over bookings (refund/delete)
CREATE POLICY "Allow deletion of bookings for admins" 
  ON public.bookings FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- 4. Create Community Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_location TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_phone TEXT NOT NULL,
  spots_needed BIGINT DEFAULT 14,
  spots_filled BIGINT DEFAULT 1,
  players_list TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to matches" 
  ON public.matches FOR SELECT USING (true);

CREATE POLICY "Allow inserting matches" 
  ON public.matches FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updating match rosters" 
  ON public.matches FOR UPDATE USING (true);

CREATE POLICY "Allow admin to remove matches" 
  ON public.matches FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- 5. Trigger to automatically create a profile after Supabase Auth User signUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email contains 'admin' to auto-assign admin role for testing ease
  INSERT INTO public.profiles (id, name, phone, email, location_preference, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New Athlete'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'locationPreference', ''),
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'admin' OR new.email LIKE '%admin%' THEN 'admin'::text
      ELSE 'player'::text
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed initial pitches
INSERT INTO public.venues (id, name, price, size, location, next_slot, image, rating, reviews_count, amenities, contact_phone, description)
VALUES 
  (1, 'Heliomart Artificial Turf', 45, '7-aside', 'Wadajir, Mogadishu', 'Today at 6:00 PM', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=850', 4.9, 142, '{"Floodlights", "Locker Room", "Safaricom 4G", "Shaded Benches", "Cafe"}', '+252 61 555 1111', 'Mogadishu’s premier high-grade artificial turf pitches featuring night-lit floodlights, premium drainage, and convenient on-site parking.'),
  (2, 'Daar Salaam Sports Complex', 55, '11-aside', 'Yaqshid, Mogadishu', 'Tomorrow at 4:30 PM', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=850', 4.8, 98, '{"FIFA Grade turf", "Showers", "Prayer Room", "Ambulance Station"}', '+252 61 555 2222', 'Full-sized professional 11-a-side pitch with FIFA-certified third-generation synthetic turf. Ideal for club leagues and tournaments.'),
  (3, 'Elite Pitch Arena', 35, '5-aside', 'Hoddan, Mogadishu', 'Today at 8:00 PM', 'https://images.unsplash.com/photo-1431324155629-1a6edd1dec1d?w=850', 4.7, 76, '{"Snack Bar", "Bibs & Footballs Included", "Free WiFi"}', '+252 61 555 3333', 'Perfect 5-a-side cage pitches with premium shock absorption carpets. Excellent for intense quick-paced friendly matches.')
ON CONFLICT (id) DO NOTHING;
