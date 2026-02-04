'use client';

import { ShopSearchResult } from '@/types';
import { formatDistance } from '@/lib/geo';
import { formatPrice } from '@/lib/search';

interface ShopCardProps {
  shop: ShopSearchResult;
}

export default function ShopCard({ shop }: ShopCardProps) {
  const cheapestService = shop.services?.reduce((min, s) =>
    s.price_cents < min.price_cents ? s : min
  , shop.services[0]);

  return (
    <a
      href={`/shop/${shop.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all duration-200"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {shop.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {shop.address}, {shop.postal_code} {shop.city}
            </p>

            {/* Distance badge */}
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {formatDistance(shop.distance_km)}
              </span>

              {/* Placeholder rating - MVP */}
              <span className="inline-flex items-center text-sm text-gray-400">
                <svg className="w-4 h-4 mr-1 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Bewertungen bald verfügbar
              </span>
            </div>

            {/* Services preview */}
            {shop.services_preview && shop.services_preview.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {shop.services_preview.map((service, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                  >
                    {service}
                  </span>
                ))}
                {shop.services && shop.services.length > 3 && (
                  <span className="inline-block px-2.5 py-1 text-gray-500 text-xs">
                    +{shop.services.length - 3} weitere
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price indicator */}
          <div className="text-right flex-shrink-0">
            {cheapestService && (
              <div>
                <p className="text-xs text-gray-500 mb-1">ab</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(cheapestService.price_cents)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Phone number hint */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {shop.phone}
          </span>
          <span className="text-sm font-medium text-primary-600 flex items-center">
            Details ansehen
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}
