import { createClient } from '@supabase/supabase-js';
import { Venue, Booking, MatchPost } from '../types';

// Read config from import.meta as any
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// Safely evaluate configuration status
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

// Lazy initialize client to avoid module load crashes on missing secrets
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * DB Helper Functions
 */

export interface Profile {
  id: string; // Auth UUID
  name: string;
  phone: string;
  email: string;
  location_preference?: string;
  role: 'player' | 'admin';
  created_at?: string;
}

// Global hook to notify components of config changes
export function getSupabaseConfigStatus() {
  return {
    configured: isSupabaseConfigured,
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  };
}

/**
 * Venues / Pitch Queries
 */
export async function fetchVenuesFromSupabase(): Promise<Venue[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Error downloading venues from Supabase, pulling defaults:', error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    // Map table column names from snake_case to camelCase React properties
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      size: item.size,
      location: item.location,
      nextSlot: item.next_slot,
      image: item.image,
      rating: Number(item.rating || 5.0),
      reviewsCount: Number(item.reviews_count || 0),
      amenities: item.amenities || [],
      contactPhone: item.contact_phone,
      description: item.description
    }));
  } catch (err) {
    console.error('Supabase fetchVenues exception:', err);
    return null;
  }
}

export async function insertVenueToSupabase(venue: Venue): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('venues')
      .upsert({
        id: venue.id,
        name: venue.name,
        price: venue.price,
        size: venue.size,
        location: venue.location,
        next_slot: venue.nextSlot,
        image: venue.image,
        rating: venue.rating,
        reviews_count: venue.reviewsCount,
        amenities: venue.amenities,
        contact_phone: venue.contactPhone,
        description: venue.description
      });
    return !error;
  } catch (err) {
    console.error('Supabase insertVenue exception:', err);
    return false;
  }
}

export async function deleteVenueFromSupabase(venueId: number): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', venueId);
    return !error;
  } catch (err) {
    console.error('Supabase deleteVenue exception:', err);
    return false;
  }
}

/**
 * Bookings Queries
 */
export async function fetchBookingsFromSupabase(): Promise<Booking[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching bookings from Supabase:', error);
      return null;
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      venueId: Number(item.venue_id),
      venueName: item.venue_name,
      venueLocation: item.venue_location,
      venueSize: item.venue_size,
      venueImage: item.venue_image,
      date: item.date,
      slot: item.slot,
      playerName: item.player_name,
      playerPhone: item.player_phone,
      extras: item.extras || { bibs: false, ballHire: false, referee: false },
      totalPrice: Number(item.total_price),
      paymentMethod: item.payment_method,
      createdAt: item.created_at
    }));
  } catch (err) {
    console.error('Supabase fetchBookings exception:', err);
    return null;
  }
}

export async function insertBookingToSupabase(booking: Booking): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('bookings')
      .insert({
        id: booking.id,
        venue_id: booking.venueId,
        venue_name: booking.venueName,
        venue_location: booking.venueLocation,
        venue_size: booking.venueSize,
        venue_image: booking.venueImage,
        date: booking.date,
        slot: booking.slot,
        player_name: booking.playerName,
        player_phone: booking.playerPhone,
        extras: booking.extras,
        total_price: booking.totalPrice,
        payment_method: booking.paymentMethod,
        created_at: booking.createdAt
      });
    return !error;
  } catch (err) {
    console.error('Supabase insertBooking exception:', err);
    return false;
  }
}

export async function deleteBookingFromSupabase(bookingId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
    return !error;
  } catch (err) {
    console.error('Supabase deleteBooking exception:', err);
    return false;
  }
}

/**
 * Community Matches Post Queries
 */
export async function fetchMatchesFromSupabase(): Promise<MatchPost[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.warn('Error loading matches from Supabase:', error);
      return null;
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      venueName: item.venue_name,
      venueLocation: item.venue_location,
      date: item.date,
      timeSlot: item.time_slot,
      creatorName: item.creator_name,
      creatorPhone: item.creator_phone,
      spotsNeeded: Number(item.spots_needed),
      spotsFilled: Number(item.spots_filled),
      playersList: item.players_list || []
    }));
  } catch (err) {
    console.error('Supabase fetchMatches exception:', err);
    return null;
  }
}

export async function insertMatchToSupabase(match: MatchPost): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('matches')
      .upsert({
        id: match.id,
        title: match.title,
        venue_name: match.venueName,
        venue_location: match.venueLocation,
        date: match.date,
        time_slot: match.timeSlot,
        creator_name: match.creatorName,
        creator_phone: match.creatorPhone,
        spots_needed: match.spotsNeeded,
        spots_filled: match.spotsFilled,
        players_list: match.playersList
      });
    return !error;
  } catch (err) {
    console.error('Supabase insertMatch exception:', err);
    return false;
  }
}

export async function joinMatchInSupabase(matchId: string, updatedSpotsFilled: number, updatedPlayersList: string[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('matches')
      .update({
        spots_filled: updatedSpotsFilled,
        players_list: updatedPlayersList
      })
      .eq('id', matchId);
    return !error;
  } catch (err) {
    console.error('Supabase joinMatch exception:', err);
    return false;
  }
}
