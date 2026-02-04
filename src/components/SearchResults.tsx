'use client';

import { ShopSearchResult } from '@/types';
import ShopCard from './ShopCard';

interface SearchResultsProps {
  results: ShopSearchResult[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  searchLocation?: string;
}

export default function SearchResults({
  results,
  total,
  hasMore,
  isLoading,
  onLoadMore,
  searchLocation,
}: SearchResultsProps) {
  if (isLoading && results.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-12 h-12 mx-auto text-primary-500 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-4 text-gray-600">Suche Werkstätten in deiner Nähe...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Keine Werkstätten gefunden
        </h3>
        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
          {searchLocation
            ? `Leider gibt es keine Werkstätten in der Nähe von "${searchLocation}" innerhalb von 10 km.`
            : 'Gib einen Standort ein, um Werkstätten in deiner Nähe zu finden.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">{total}</span>{' '}
          {total === 1 ? 'Werkstatt' : 'Werkstätten'} gefunden
          {searchLocation && (
            <span className="text-gray-500"> in der Nähe von &quot;{searchLocation}&quot;</span>
          )}
        </p>
        <p className="text-sm text-gray-500">
          Sortiert nach Entfernung
        </p>
      </div>

      {/* Results list */}
      <div className="space-y-4">
        {results.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Wird geladen...
              </span>
            ) : (
              'Mehr Werkstätten laden'
            )}
          </button>
        </div>
      )}

      {/* End of results */}
      {!hasMore && results.length > 0 && (
        <p className="mt-6 text-center text-sm text-gray-500">
          Alle Werkstätten innerhalb von 10 km werden angezeigt
        </p>
      )}
    </div>
  );
}
