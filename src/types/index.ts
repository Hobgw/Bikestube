// Data types based on MVP-SPEC.md data model

export interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  // Computed/joined fields for display
  distance_km?: number;
  services?: Service[];
}

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
}

export interface Availability {
  id: string;
  shop_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_active: boolean;
}

export interface BlockedDate {
  id: string;
  shop_id: string;
  date: string; // YYYY-MM-DD format
  reason?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  shop_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  bike_type?: string;
  issue_description?: string;
  scheduled_at: string;
  total_price_cents: number;
  total_duration_minutes: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string;
  price_cents: number; // Snapshot at booking time
  duration_minutes: number; // Snapshot at booking time
}

// Search-related types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SearchParams {
  location: string;
  coordinates?: Coordinates;
  radius_km?: number;
}

export interface ShopSearchResult extends Shop {
  distance_km: number;
  services_preview: string[];
}

// Booking flow types
export interface TimeSlot {
  start: string; // ISO datetime string
  end: string; // ISO datetime string
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayName: string;
  slots: TimeSlot[];
}

export interface SelectedServices {
  services: Service[];
  totalPriceCents: number;
  totalDurationMinutes: number;
}
