"use client";

import { useState, useCallback } from "react";
import { LocationInput } from "@/components/LocationInput";
import { ShopList } from "@/components/ShopList";
import { Shop, SearchLocation } from "@/types/shop";
import { mockShops, BERLIN_CENTER } from "@/lib/mock-data";
import { calculateDistance } from "@/lib/distance";

// Maximum search radius in kilometers
const MAX_DISTANCE_KM = 10;

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchShops = useCallback((location: SearchLocation) => {
    setIsLoading(true);
    setError(null);
    setSearchLocation(location);

    // Simulate API delay
    setTimeout(() => {
      // Calculate distances and filter shops within radius
      const shopsWithDistance = mockShops
        .map((shop) => ({
          ...shop,
          distance: calculateDistance(
            location.latitude,
            location.longitude,
            shop.latitude,
            shop.longitude
          ),
        }))
        .filter((shop) => shop.distance <= MAX_DISTANCE_KM)
        .sort((a, b) => a.distance - b.distance);

      setShops(shopsWithDistance);
      setHasSearched(true);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      // For MVP, we simulate geocoding by checking for Berlin postal codes
      // In production, this would call Google Maps Geocoding API
      const plzMatch = query.match(/\b(\d{5})\b/);

      if (plzMatch) {
        // Simulate geocoding for Berlin postal codes (10xxx-14xxx)
        const plz = plzMatch[1];
        if (plz.startsWith("10") || plz.startsWith("12") || plz.startsWith("13") || plz.startsWith("14")) {
          // Use Berlin center with slight variation based on PLZ
          const offset = (parseInt(plz.slice(2)) - 500) / 10000;
          searchShops({
            latitude: BERLIN_CENTER.latitude + offset,
            longitude: BERLIN_CENTER.longitude + offset,
            address: query,
          });
          return;
        }
      }

      // Default: search around Berlin center for any address containing "Berlin"
      if (query.toLowerCase().includes("berlin")) {
        searchShops({
          latitude: BERLIN_CENTER.latitude,
          longitude: BERLIN_CENTER.longitude,
          address: query,
        });
        return;
      }

      // For other addresses, still search but show results (demo mode)
      searchShops({
        latitude: BERLIN_CENTER.latitude,
        longitude: BERLIN_CENTER.longitude,
        address: query,
      });
    },
    [searchShops]
  );

  const handleUseGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation wird von deinem Browser nicht unterstützt.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        searchShops({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Standortzugriff wurde verweigert.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Standort konnte nicht ermittelt werden.");
            break;
          case err.TIMEOUT:
            setError("Standortabfrage hat zu lange gedauert.");
            break;
          default:
            setError("Ein Fehler ist aufgetreten.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [searchShops]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Bikestube
          </h1>
          <p className="text-lg text-gray-600">
            Finde Fahrradwerkstätten in deiner Nähe
          </p>
        </header>

        {/* Search */}
        <section className="mb-8">
          <LocationInput
            onSearch={handleSearch}
            onUseGPS={handleUseGPS}
            isLoading={isLoading}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}
        </section>

        {/* Results */}
        {(hasSearched || isLoading) && (
          <section>
            {searchLocation?.address && (
              <p className="text-gray-600 mb-4">
                Ergebnisse für: <strong>{searchLocation.address}</strong>
              </p>
            )}
            <ShopList shops={shops} isLoading={isLoading} />
          </section>
        )}

        {/* Initial state */}
        {!hasSearched && !isLoading && (
          <section className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚲</div>
            <p className="text-gray-500">
              Gib deine Adresse oder Postleitzahl ein, um Werkstätten zu finden.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
