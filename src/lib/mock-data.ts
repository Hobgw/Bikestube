import { Shop, Service, Availability, Booking, BlockedDate } from '@/types';

// Mock shops in Berlin for development
export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Rad-Werk Berlin',
    address: 'Kastanienallee 77',
    city: 'Berlin',
    postal_code: '10435',
    latitude: 52.5388,
    longitude: 13.4130,
    phone: '+49 30 12345678',
    email: 'info@rad-werk.de',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Fahrrad-Doktor Kreuzberg',
    address: 'Oranienstraße 185',
    city: 'Berlin',
    postal_code: '10999',
    latitude: 52.5012,
    longitude: 13.4242,
    phone: '+49 30 23456789',
    email: 'service@fahrrad-doktor.de',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'E-Bike Zentrum Mitte',
    address: 'Friedrichstraße 123',
    city: 'Berlin',
    postal_code: '10117',
    latitude: 52.5200,
    longitude: 13.3880,
    phone: '+49 30 34567890',
    email: 'kontakt@ebike-zentrum.de',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
  {
    id: '4',
    name: 'Velociped Werkstatt',
    address: 'Schönhauser Allee 36',
    city: 'Berlin',
    postal_code: '10435',
    latitude: 52.5321,
    longitude: 13.4120,
    phone: '+49 30 45678901',
    email: 'hallo@velociped.de',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '5',
    name: 'Berliner Radhaus',
    address: 'Warschauer Straße 58',
    city: 'Berlin',
    postal_code: '10243',
    latitude: 52.5072,
    longitude: 13.4497,
    phone: '+49 30 56789012',
    email: 'info@berliner-radhaus.de',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
  },
  {
    id: '6',
    name: 'Zweirad Schmidt',
    address: 'Karl-Marx-Straße 92',
    city: 'Berlin',
    postal_code: '12043',
    latitude: 52.4833,
    longitude: 13.4380,
    phone: '+49 30 67890123',
    email: 'werkstatt@zweirad-schmidt.de',
    created_at: '2024-02-05T10:00:00Z',
    updated_at: '2024-02-05T10:00:00Z',
  },
  {
    id: '7',
    name: 'Pedal Power Charlottenburg',
    address: 'Wilmersdorfer Straße 120',
    city: 'Berlin',
    postal_code: '10627',
    latitude: 52.5069,
    longitude: 13.3048,
    phone: '+49 30 78901234',
    email: 'service@pedal-power.de',
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z',
  },
  {
    id: '8',
    name: 'Kettenfett Fahrradwerkstatt',
    address: 'Danziger Straße 77',
    city: 'Berlin',
    postal_code: '10405',
    latitude: 52.5344,
    longitude: 13.4275,
    phone: '+49 30 89012345',
    email: 'kontakt@kettenfett.de',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z',
  },
];

// Mock services for each shop
export const mockServices: Service[] = [
  // Shop 1 - Rad-Werk Berlin
  { id: 's1-1', shop_id: '1', name: 'Inspektion / Tune-up', description: 'Komplette Fahrradinspektion mit Einstellung aller Komponenten', price_cents: 4900, duration_minutes: 45, is_active: true, sort_order: 1 },
  { id: 's1-2', shop_id: '1', name: 'Reifenwechsel', description: 'Plattfuß reparieren oder Reifen wechseln', price_cents: 1500, duration_minutes: 20, is_active: true, sort_order: 2 },
  { id: 's1-3', shop_id: '1', name: 'Bremsen einstellen', description: 'Justierung und Einstellung der Bremsen', price_cents: 2500, duration_minutes: 30, is_active: true, sort_order: 3 },

  // Shop 2 - Fahrrad-Doktor Kreuzberg
  { id: 's2-1', shop_id: '2', name: 'Inspektion / Tune-up', description: 'Gründliche Überprüfung aller Komponenten', price_cents: 5500, duration_minutes: 60, is_active: true, sort_order: 1 },
  { id: 's2-2', shop_id: '2', name: 'Kettenwechsel', description: 'Kette wechseln inkl. Einstellung', price_cents: 3500, duration_minutes: 30, is_active: true, sort_order: 2 },
  { id: 's2-3', shop_id: '2', name: 'Schaltung einstellen', description: 'Gangschaltung präzise einstellen', price_cents: 2900, duration_minutes: 25, is_active: true, sort_order: 3 },

  // Shop 3 - E-Bike Zentrum Mitte
  { id: 's3-1', shop_id: '3', name: 'E-Bike Diagnose', description: 'Vollständige elektronische Diagnose', price_cents: 6900, duration_minutes: 45, is_active: true, sort_order: 1 },
  { id: 's3-2', shop_id: '3', name: 'Akku-Check', description: 'Batteriezustand prüfen und Bericht erstellen', price_cents: 3900, duration_minutes: 30, is_active: true, sort_order: 2 },
  { id: 's3-3', shop_id: '3', name: 'Software-Update', description: 'Firmware-Update für Motor und Display', price_cents: 4500, duration_minutes: 30, is_active: true, sort_order: 3 },

  // Shop 4 - Velociped Werkstatt
  { id: 's4-1', shop_id: '4', name: 'Inspektion / Tune-up', description: 'Professionelle Komplettinspektion', price_cents: 4500, duration_minutes: 40, is_active: true, sort_order: 1 },
  { id: 's4-2', shop_id: '4', name: 'Laufrad zentrieren', description: 'Speichen spannen und Laufrad richten', price_cents: 2000, duration_minutes: 25, is_active: true, sort_order: 2 },

  // Shop 5 - Berliner Radhaus
  { id: 's5-1', shop_id: '5', name: 'Komplettservice', description: 'Full Service mit Reinigung', price_cents: 8900, duration_minutes: 90, is_active: true, sort_order: 1 },
  { id: 's5-2', shop_id: '5', name: 'Reifenwechsel', description: 'Schlauch oder Mantel wechseln', price_cents: 1800, duration_minutes: 20, is_active: true, sort_order: 2 },
  { id: 's5-3', shop_id: '5', name: 'Bremsen komplett', description: 'Bremsbeläge und Züge erneuern', price_cents: 4500, duration_minutes: 45, is_active: true, sort_order: 3 },

  // Shop 6 - Zweirad Schmidt
  { id: 's6-1', shop_id: '6', name: 'Inspektion / Tune-up', description: 'Standard-Inspektion', price_cents: 3900, duration_minutes: 35, is_active: true, sort_order: 1 },
  { id: 's6-2', shop_id: '6', name: 'Schaltung einstellen', description: 'Schaltwerk und Umwerfer justieren', price_cents: 2500, duration_minutes: 20, is_active: true, sort_order: 2 },

  // Shop 7 - Pedal Power Charlottenburg
  { id: 's7-1', shop_id: '7', name: 'Inspektion / Tune-up', description: 'Premium Fahrradcheck', price_cents: 5900, duration_minutes: 50, is_active: true, sort_order: 1 },
  { id: 's7-2', shop_id: '7', name: 'Hydraulikbremsen entlüften', description: 'Bremssystem entlüften und prüfen', price_cents: 3500, duration_minutes: 40, is_active: true, sort_order: 2 },
  { id: 's7-3', shop_id: '7', name: 'Tretlager wechseln', description: 'Tretlager austauschen', price_cents: 4900, duration_minutes: 45, is_active: true, sort_order: 3 },

  // Shop 8 - Kettenfett Fahrradwerkstatt
  { id: 's8-1', shop_id: '8', name: 'Inspektion / Tune-up', description: 'Gründlicher Fahrrad-Check', price_cents: 4200, duration_minutes: 40, is_active: true, sort_order: 1 },
  { id: 's8-2', shop_id: '8', name: 'Kettenpflege', description: 'Kette reinigen, schmieren, prüfen', price_cents: 1500, duration_minutes: 15, is_active: true, sort_order: 2 },
  { id: 's8-3', shop_id: '8', name: 'Reifenwechsel', description: 'Plattfuß beheben', price_cents: 1200, duration_minutes: 15, is_active: true, sort_order: 3 },
];

// Helper to get services for a shop
export function getServicesForShop(shopId: string): Service[] {
  return mockServices.filter(s => s.shop_id === shopId && s.is_active);
}

// Berlin center coordinates for default location
export const BERLIN_CENTER = {
  latitude: 52.5200,
  longitude: 13.4050,
};

// Mock availability templates for shops (weekly schedule)
// Most shops: Mon-Fri 9-18, Sat 10-14
export const mockAvailability: Availability[] = [
  // Shop 1 - Rad-Werk Berlin (Mon-Fri 9-18, Sat 10-14)
  { id: 'a1-1', shop_id: '1', day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a1-2', shop_id: '1', day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a1-3', shop_id: '1', day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a1-4', shop_id: '1', day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a1-5', shop_id: '1', day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a1-6', shop_id: '1', day_of_week: 6, start_time: '10:00', end_time: '14:00', is_active: true },

  // Shop 2 - Fahrrad-Doktor Kreuzberg (Mon-Sat 10-19)
  { id: 'a2-1', shop_id: '2', day_of_week: 1, start_time: '10:00', end_time: '19:00', is_active: true },
  { id: 'a2-2', shop_id: '2', day_of_week: 2, start_time: '10:00', end_time: '19:00', is_active: true },
  { id: 'a2-3', shop_id: '2', day_of_week: 3, start_time: '10:00', end_time: '19:00', is_active: true },
  { id: 'a2-4', shop_id: '2', day_of_week: 4, start_time: '10:00', end_time: '19:00', is_active: true },
  { id: 'a2-5', shop_id: '2', day_of_week: 5, start_time: '10:00', end_time: '19:00', is_active: true },
  { id: 'a2-6', shop_id: '2', day_of_week: 6, start_time: '10:00', end_time: '16:00', is_active: true },

  // Shop 3 - E-Bike Zentrum Mitte (Mon-Fri 8-17)
  { id: 'a3-1', shop_id: '3', day_of_week: 1, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a3-2', shop_id: '3', day_of_week: 2, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a3-3', shop_id: '3', day_of_week: 3, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a3-4', shop_id: '3', day_of_week: 4, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a3-5', shop_id: '3', day_of_week: 5, start_time: '08:00', end_time: '17:00', is_active: true },

  // Shop 4 - Velociped Werkstatt (Tue-Sat 9-18)
  { id: 'a4-1', shop_id: '4', day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a4-2', shop_id: '4', day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a4-3', shop_id: '4', day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a4-4', shop_id: '4', day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a4-5', shop_id: '4', day_of_week: 6, start_time: '09:00', end_time: '15:00', is_active: true },

  // Shop 5 - Berliner Radhaus (Mon-Fri 9-18, Sat 10-14)
  { id: 'a5-1', shop_id: '5', day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a5-2', shop_id: '5', day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a5-3', shop_id: '5', day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a5-4', shop_id: '5', day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a5-5', shop_id: '5', day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
  { id: 'a5-6', shop_id: '5', day_of_week: 6, start_time: '10:00', end_time: '14:00', is_active: true },

  // Shop 6 - Zweirad Schmidt (Mon-Fri 8-17)
  { id: 'a6-1', shop_id: '6', day_of_week: 1, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a6-2', shop_id: '6', day_of_week: 2, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a6-3', shop_id: '6', day_of_week: 3, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a6-4', shop_id: '6', day_of_week: 4, start_time: '08:00', end_time: '17:00', is_active: true },
  { id: 'a6-5', shop_id: '6', day_of_week: 5, start_time: '08:00', end_time: '17:00', is_active: true },

  // Shop 7 - Pedal Power Charlottenburg (Mon-Sat 9-19)
  { id: 'a7-1', shop_id: '7', day_of_week: 1, start_time: '09:00', end_time: '19:00', is_active: true },
  { id: 'a7-2', shop_id: '7', day_of_week: 2, start_time: '09:00', end_time: '19:00', is_active: true },
  { id: 'a7-3', shop_id: '7', day_of_week: 3, start_time: '09:00', end_time: '19:00', is_active: true },
  { id: 'a7-4', shop_id: '7', day_of_week: 4, start_time: '09:00', end_time: '19:00', is_active: true },
  { id: 'a7-5', shop_id: '7', day_of_week: 5, start_time: '09:00', end_time: '19:00', is_active: true },
  { id: 'a7-6', shop_id: '7', day_of_week: 6, start_time: '10:00', end_time: '16:00', is_active: true },

  // Shop 8 - Kettenfett Fahrradwerkstatt (Wed-Sun 11-19)
  { id: 'a8-1', shop_id: '8', day_of_week: 3, start_time: '11:00', end_time: '19:00', is_active: true },
  { id: 'a8-2', shop_id: '8', day_of_week: 4, start_time: '11:00', end_time: '19:00', is_active: true },
  { id: 'a8-3', shop_id: '8', day_of_week: 5, start_time: '11:00', end_time: '19:00', is_active: true },
  { id: 'a8-4', shop_id: '8', day_of_week: 6, start_time: '11:00', end_time: '17:00', is_active: true },
  { id: 'a8-5', shop_id: '8', day_of_week: 0, start_time: '12:00', end_time: '17:00', is_active: true },
];

// Helper to get availability for a shop
export function getAvailabilityForShop(shopId: string): Availability[] {
  return mockAvailability.filter(a => a.shop_id === shopId && a.is_active);
}

// Mock blocked dates (holidays, vacations, etc.)
export const mockBlockedDates: BlockedDate[] = [
  // Some example blocked dates
];

// Helper to get blocked dates for a shop
export function getBlockedDatesForShop(shopId: string): BlockedDate[] {
  return mockBlockedDates.filter(b => b.shop_id === shopId);
}

// Mock existing bookings (to check for conflicts)
export const mockBookings: Booking[] = [
  // Some example bookings to show slots as taken
  {
    id: 'b1',
    shop_id: '1',
    user_name: 'Max Mustermann',
    user_email: 'max@example.com',
    user_phone: '+49 170 1234567',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00:00Z',
    total_price_cents: 4900,
    total_duration_minutes: 45,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2',
    shop_id: '1',
    user_name: 'Anna Schmidt',
    user_email: 'anna@example.com',
    user_phone: '+49 171 2345678',
    scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T14:00:00Z',
    total_price_cents: 1500,
    total_duration_minutes: 20,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper to get bookings for a shop
export function getBookingsForShop(shopId: string): Booking[] {
  return mockBookings.filter(b => b.shop_id === shopId && (b.status === 'pending' || b.status === 'confirmed'));
}

// Helper to get shop by ID
export function getShopById(shopId: string): Shop | undefined {
  return mockShops.find(s => s.id === shopId);
}
