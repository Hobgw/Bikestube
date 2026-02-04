'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LocationInput from '@/components/LocationInput';
import SearchResults from '@/components/SearchResults';
import { ShopSearchResult, Coordinates } from '@/types';
import { searchShopsByLocation, geocodeAddress } from '@/lib/search';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [locationInput, setLocationInput] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [results, setResults] = useState<ShopSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Parse URL params on mount
  useEffect(() => {
    const query = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat && lng) {
      const coords = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      };
      setCoordinates(coords);
      setSearchedLocation('Dein Standort');
      performSearch(coords);
    } else if (query) {
      setLocationInput(query);
      handleSearchByAddress(query);
    }
  }, [searchParams]);

  const performSearch = useCallback((coords: Coordinates, pageNum: number = 1) => {
    setIsLoading(true);
    setError(null);

    // Simulate network delay for realistic UX
    setTimeout(() => {
      try {
        const { results: searchResults, total: totalResults, hasMore: more } =
          searchShopsByLocation(coords, 10, pageNum);

        if (pageNum === 1) {
          setResults(searchResults);
        } else {
          setResults(prev => [...prev, ...searchResults]);
        }
        setTotal(totalResults);
        setHasMore(more);
        setPage(pageNum);
      } catch (err) {
        setError('Fehler bei der Suche. Bitte versuche es erneut.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchByAddress = useCallback(async (address: string) => {
    if (!address.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const coords = await geocodeAddress(address);

      if (coords) {
        setCoordinates(coords);
        setSearchedLocation(address);
        performSearch(coords);

        // Update URL
        router.push(`/search?q=${encodeURIComponent(address)}`, { scroll: false });
      } else {
        setError('Standort konnte nicht gefunden werden. Bitte versuche eine andere Adresse oder Postleitzahl.');
        setResults([]);
        setTotal(0);
        setHasMore(false);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Fehler bei der Standortsuche. Bitte versuche es erneut.');
      setIsLoading(false);
      console.error('Geocoding error:', err);
    }
  }, [performSearch, router]);

  const handleSearch = useCallback(() => {
    handleSearchByAddress(locationInput);
  }, [locationInput, handleSearchByAddress]);

  const handleUseMyLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation wird von deinem Browser nicht unterstützt.');
      return;
    }

    setIsGeolocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        setSearchedLocation('Dein Standort');
        setLocationInput('');
        performSearch(coords);
        setIsGeolocating(false);

        // Update URL
        router.push(`/search?lat=${coords.latitude}&lng=${coords.longitude}`, { scroll: false });
      },
      (err) => {
        setIsGeolocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Standortzugriff wurde verweigert. Bitte erlaube den Zugriff in deinen Browsereinstellungen.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Standort konnte nicht ermittelt werden. Bitte versuche es erneut.');
            break;
          case err.TIMEOUT:
            setError('Standortanfrage hat zu lange gedauert. Bitte versuche es erneut.');
            break;
          default:
            setError('Standort konnte nicht ermittelt werden. Bitte gib deine Adresse manuell ein.');
        }
        console.error('Geolocation error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [performSearch, router]);

  const handleLoadMore = useCallback(() => {
    if (coordinates && !isLoading) {
      performSearch(coordinates, page + 1);
    }
  }, [coordinates, isLoading, page, performSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Fahrradwerkstatt finden
          </h1>
          <p className="text-gray-600">
            Finde Werkstätten in deiner Nähe und buche einen Termin
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Location input */}
        <LocationInput
          value={locationInput}
          onChange={setLocationInput}
          onSearch={handleSearch}
          onUseMyLocation={handleUseMyLocation}
          isLoading={isLoading}
          isGeolocating={isGeolocating}
        />

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search results */}
        <div className="mt-6">
          <SearchResults
            results={results}
            total={total}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            searchLocation={searchedLocation}
          />
        </div>

        {/* Initial state - no search yet */}
        {!isLoading && results.length === 0 && !error && !searchedLocation && (
          <div className="mt-8 text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Wo suchst du eine Werkstatt?
            </h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              Gib oben deine Adresse oder Postleitzahl ein, oder verwende deinen aktuellen Standort.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-primary-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
