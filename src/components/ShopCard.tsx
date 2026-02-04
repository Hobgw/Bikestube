import { Shop } from "@/types/shop";
import { formatDistance } from "@/lib/distance";
import Link from "next/link";

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link
      href={`/shop/${shop.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {shop.name}
          </h3>
          <p className="text-gray-600 mt-1">
            {shop.address}, {shop.postalCode} {shop.city}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {shop.servicesPreview.slice(0, 3).map((service) => (
              <span
                key={service}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          {shop.distance !== undefined && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-medium rounded-full text-sm">
              {formatDistance(shop.distance)}
            </span>
          )}
          <div className="mt-2 text-gray-400 text-sm">
            Bewertungen bald verfügbar
          </div>
        </div>
      </div>
    </Link>
  );
}
