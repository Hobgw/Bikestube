'use client';

import { Service } from '@/types';
import { formatPrice } from '@/lib/search';
import { formatDuration } from '@/lib/booking';

interface ServiceSelectionProps {
  services: Service[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export default function ServiceSelection({
  services,
  selectedIds,
  onSelectionChange,
}: ServiceSelectionProps) {
  const toggleService = (serviceId: string) => {
    if (selectedIds.includes(serviceId)) {
      onSelectionChange(selectedIds.filter(id => id !== serviceId));
    } else {
      onSelectionChange([...selectedIds, serviceId]);
    }
  };

  const selectedServices = services.filter(s => selectedIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_cents, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Services auswählen
      </h3>

      <div className="space-y-3">
        {services.map(service => {
          const isSelected = selectedIds.includes(service.id);

          return (
            <button
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{service.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 ml-8">
                    {service.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 ml-8">
                    Dauer: ca. {formatDuration(service.duration_minutes)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(service.price_cents)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {selectedIds.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {selectedIds.length} {selectedIds.length === 1 ? 'Service' : 'Services'} ausgewählt
              </p>
              <p className="text-sm text-gray-500">
                Gesamtdauer: ca. {formatDuration(totalDuration)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Gesamtpreis</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedIds.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Bitte wähle mindestens einen Service aus
        </p>
      )}
    </div>
  );
}
