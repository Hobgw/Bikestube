"use client";

import { Shop } from "@/types/shop";
import { ShopCard } from "./ShopCard";
import { useState, useEffect } from "react";

interface ShopListProps {
  shops: Shop[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function ShopList({ shops, isLoading }: ShopListProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // Reset display count when shops change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [shops]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          Keine Werkstätten in deiner Nähe gefunden.
        </p>
        <p className="text-gray-400 mt-2">
          Versuche eine andere Adresse oder Postleitzahl.
        </p>
      </div>
    );
  }

  const displayedShops = shops.slice(0, displayCount);
  const hasMore = displayCount < shops.length;

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        {shops.length} Werkstatt{shops.length !== 1 ? "en" : ""} gefunden
      </p>
      <div className="space-y-3">
        {displayedShops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setDisplayCount((c) => c + ITEMS_PER_PAGE)}
            className="px-6 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Mehr laden ({shops.length - displayCount} weitere)
          </button>
        </div>
      )}
    </div>
  );
}
