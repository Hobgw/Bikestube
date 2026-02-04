import { Coordinates, ShopSearchResult } from '@/types';
import { mockShops, getServicesForShop } from './mock-data';
import { calculateHaversineDistance } from './geo';

const DEFAULT_RADIUS_KM = 10;
const RESULTS_PER_PAGE = 10;

/**
 * Search for shops near given coordinates
 * Returns shops within radius, sorted by distance
 */
export function searchShopsByLocation(
  coordinates: Coordinates,
  radiusKm: number = DEFAULT_RADIUS_KM,
  page: number = 1
): { results: ShopSearchResult[]; total: number; hasMore: boolean } {
  // Calculate distance for all shops
  const shopsWithDistance = mockShops.map(shop => {
    const distance_km = calculateHaversineDistance(coordinates, {
      latitude: shop.latitude,
      longitude: shop.longitude,
    });

    const services = getServicesForShop(shop.id);
    const services_preview = services.slice(0, 3).map(s => s.name);

    return {
      ...shop,
      distance_km,
      services_preview,
      services,
    } as ShopSearchResult;
  });

  // Filter by radius and sort by distance
  const filteredShops = shopsWithDistance
    .filter(shop => shop.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);

  // Pagination
  const start = (page - 1) * RESULTS_PER_PAGE;
  const end = start + RESULTS_PER_PAGE;
  const paginatedResults = filteredShops.slice(start, end);

  return {
    results: paginatedResults,
    total: filteredShops.length,
    hasMore: end < filteredShops.length,
  };
}

/**
 * Mock geocoding - convert address/PLZ to coordinates
 * In production, this would call Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  // Normalize input
  const normalized = address.toLowerCase().trim();

  // Mock geocoding for Berlin addresses/postal codes
  const berlinLocations: Record<string, Coordinates> = {
    // Postal codes
    '10115': { latitude: 52.5328, longitude: 13.3890 },
    '10117': { latitude: 52.5163, longitude: 13.3889 },
    '10178': { latitude: 52.5219, longitude: 13.4130 },
    '10243': { latitude: 52.5103, longitude: 13.4549 },
    '10245': { latitude: 52.5081, longitude: 13.4629 },
    '10247': { latitude: 52.5145, longitude: 13.4635 },
    '10249': { latitude: 52.5252, longitude: 13.4482 },
    '10405': { latitude: 52.5332, longitude: 13.4226 },
    '10435': { latitude: 52.5386, longitude: 13.4133 },
    '10437': { latitude: 52.5459, longitude: 13.4131 },
    '10439': { latitude: 52.5510, longitude: 13.4110 },
    '10551': { latitude: 52.5319, longitude: 13.3434 },
    '10553': { latitude: 52.5253, longitude: 13.3368 },
    '10555': { latitude: 52.5196, longitude: 13.3364 },
    '10557': { latitude: 52.5206, longitude: 13.3580 },
    '10559': { latitude: 52.5316, longitude: 13.3530 },
    '10623': { latitude: 52.5065, longitude: 13.3211 },
    '10625': { latitude: 52.5090, longitude: 13.3095 },
    '10627': { latitude: 52.5061, longitude: 13.3047 },
    '10629': { latitude: 52.5012, longitude: 13.3069 },
    '10707': { latitude: 52.4918, longitude: 13.3167 },
    '10709': { latitude: 52.4882, longitude: 13.3070 },
    '10711': { latitude: 52.4860, longitude: 13.2890 },
    '10713': { latitude: 52.4785, longitude: 13.3160 },
    '10715': { latitude: 52.4728, longitude: 13.3290 },
    '10717': { latitude: 52.4833, longitude: 13.3290 },
    '10719': { latitude: 52.4951, longitude: 13.3290 },
    '10789': { latitude: 52.5038, longitude: 13.3410 },
    '10823': { latitude: 52.4868, longitude: 13.3538 },
    '10825': { latitude: 52.4832, longitude: 13.3464 },
    '10827': { latitude: 52.4845, longitude: 13.3568 },
    '10829': { latitude: 52.4811, longitude: 13.3629 },
    '10961': { latitude: 52.4872, longitude: 13.3929 },
    '10963': { latitude: 52.4965, longitude: 13.3825 },
    '10965': { latitude: 52.4844, longitude: 13.3841 },
    '10967': { latitude: 52.4889, longitude: 13.4104 },
    '10969': { latitude: 52.5008, longitude: 13.4039 },
    '10997': { latitude: 52.4978, longitude: 13.4310 },
    '10999': { latitude: 52.4969, longitude: 13.4190 },
    '12043': { latitude: 52.4820, longitude: 13.4340 },
    '12045': { latitude: 52.4875, longitude: 13.4430 },
    '12047': { latitude: 52.4930, longitude: 13.4315 },
    '12049': { latitude: 52.4766, longitude: 13.4203 },
    '12051': { latitude: 52.4730, longitude: 13.4350 },
    '12053': { latitude: 52.4780, longitude: 13.4190 },
    '12055': { latitude: 52.4740, longitude: 13.4470 },
    '12057': { latitude: 52.4640, longitude: 13.4540 },
    '12059': { latitude: 52.4690, longitude: 13.4670 },
    // Common area names
    'mitte': { latitude: 52.5200, longitude: 13.4050 },
    'berlin mitte': { latitude: 52.5200, longitude: 13.4050 },
    'prenzlauer berg': { latitude: 52.5420, longitude: 13.4280 },
    'kreuzberg': { latitude: 52.4970, longitude: 13.4080 },
    'friedrichshain': { latitude: 52.5150, longitude: 13.4540 },
    'neukölln': { latitude: 52.4790, longitude: 13.4420 },
    'charlottenburg': { latitude: 52.5160, longitude: 13.3040 },
    'wedding': { latitude: 52.5510, longitude: 13.3590 },
    'moabit': { latitude: 52.5310, longitude: 13.3410 },
    'schöneberg': { latitude: 52.4840, longitude: 13.3470 },
    'tempelhof': { latitude: 52.4670, longitude: 13.4030 },
    'alexanderplatz': { latitude: 52.5219, longitude: 13.4132 },
    'potsdamer platz': { latitude: 52.5096, longitude: 13.3761 },
    'berlin': { latitude: 52.5200, longitude: 13.4050 },
  };

  // Try exact match first
  if (berlinLocations[normalized]) {
    return berlinLocations[normalized];
  }

  // Try to find partial match
  for (const [key, coords] of Object.entries(berlinLocations)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // Default to Berlin center if input contains "berlin"
  if (normalized.includes('berlin')) {
    return berlinLocations['berlin'];
  }

  // If it looks like a German postal code (5 digits), default to Berlin center
  if (/^\d{5}$/.test(normalized)) {
    return berlinLocations['berlin'];
  }

  return null;
}

/**
 * Format price from cents to Euro string
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
