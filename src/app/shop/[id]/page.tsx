'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shop, Service, TimeSlot, DayAvailability } from '@/types';
import { getShopById, getServicesForShop } from '@/lib/mock-data';
import { getAvailableSlots, formatTime, formatDuration } from '@/lib/booking';
import { formatPrice } from '@/lib/search';
import ServiceSelection from '@/components/ServiceSelection';
import BookingCalendar from '@/components/BookingCalendar';

type BookingStep = 'services' | 'datetime' | 'confirm';

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  const [isLoading, setIsLoading] = useState(true);

  // Load shop data
  useEffect(() => {
    const loadShop = () => {
      const shopData = getShopById(shopId);
      if (shopData) {
        setShop(shopData);
        setServices(getServicesForShop(shopId));
      }
      setIsLoading(false);
    };

    loadShop();
  }, [shopId]);

  // Calculate totals
  const selectedServices = useMemo(() => {
    return services.filter(s => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price_cents, 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  }, [selectedServices]);

  // Get available slots based on total duration
  const availability: DayAvailability[] = useMemo(() => {
    if (!shopId || totalDuration === 0) return [];
    return getAvailableSlots(shopId, totalDuration);
  }, [shopId, totalDuration]);

  // Navigation handlers
  const handleContinueToDateTime = () => {
    if (selectedServiceIds.length > 0) {
      setCurrentStep('datetime');
    }
  };

  const handleContinueToConfirm = () => {
    if (selectedSlot) {
      setCurrentStep('confirm');
    }
  };

  const handleBack = () => {
    if (currentStep === 'datetime') {
      setCurrentStep('services');
    } else if (currentStep === 'confirm') {
      setCurrentStep('datetime');
    }
  };

  const handleBookingConfirm = () => {
    // In MVP, just show success and redirect
    alert('Buchung erfolgreich! Du erhältst eine Bestätigung per E-Mail.');
    router.push('/search');
  };

  if (isLoading) {
    return (
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
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Werkstatt nicht gefunden</h1>
          <p className="text-gray-600 mb-4">Die gesuchte Werkstatt existiert nicht.</p>
          <a
            href="/search"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
          >
            Zurück zur Suche
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/search"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Suche
          </a>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{shop.name}</h1>
              <p className="mt-1 text-gray-600">
                {shop.address}, {shop.postal_code} {shop.city}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <a
                  href={`tel:${shop.phone}`}
                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {shop.phone}
                </a>
                <a
                  href={`mailto:${shop.email}`}
                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  E-Mail senden
                </a>
              </div>
            </div>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm">Bewertungen bald verfügbar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { key: 'services', label: '1. Services' },
              { key: 'datetime', label: '2. Termin' },
              { key: 'confirm', label: '3. Bestätigung' },
            ].map((step, idx) => (
              <div
                key={step.key}
                className={`flex items-center ${idx < 2 ? 'flex-1' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep === step.key
                      ? 'bg-primary-500 text-white'
                      : ['services'].indexOf(currentStep) < ['services', 'datetime', 'confirm'].indexOf(step.key)
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-primary-100 text-primary-700'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep === step.key ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {idx < 2 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                    <div
                      className={`h-full bg-primary-500 transition-all ${
                        ['services', 'datetime', 'confirm'].indexOf(currentStep) > idx ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Step 1: Service Selection */}
              {currentStep === 'services' && (
                <>
                  <ServiceSelection
                    services={services}
                    selectedIds={selectedServiceIds}
                    onSelectionChange={setSelectedServiceIds}
                  />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleContinueToDateTime}
                      disabled={selectedServiceIds.length === 0}
                      className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Weiter zur Terminauswahl
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Date/Time Selection */}
              {currentStep === 'datetime' && (
                <>
                  <BookingCalendar
                    availability={availability}
                    selectedSlot={selectedSlot}
                    onSlotSelect={setSelectedSlot}
                  />
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Zurück
                    </button>
                    <button
                      onClick={handleContinueToConfirm}
                      disabled={!selectedSlot}
                      className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Weiter zur Bestätigung
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 'confirm' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Buchung bestätigen
                  </h3>

                  {/* Booking summary */}
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Werkstatt</h4>
                      <p className="font-semibold text-gray-900">{shop.name}</p>
                      <p className="text-sm text-gray-600">{shop.address}, {shop.postal_code} {shop.city}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ausgewählte Services</h4>
                      <ul className="space-y-1">
                        {selectedServices.map(service => (
                          <li key={service.id} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span className="text-gray-600">{formatPrice(service.price_cents)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-semibold">
                        <span>Gesamt</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    {selectedSlot && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Termin</h4>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedSlot.start).toLocaleDateString('de-DE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(selectedSlot.start)} Uhr - {formatTime(selectedSlot.end)} Uhr
                          ({formatDuration(totalDuration)})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact form - simplified for MVP */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-700">Deine Kontaktdaten</h4>
                    <div>
                      <label htmlFor="name" className="block text-sm text-gray-600 mb-1">Name *</label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Max Mustermann"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm text-gray-600 mb-1">E-Mail *</label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="max@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">Telefon *</label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+49 170 1234567"
                      />
                    </div>
                    <div>
                      <label htmlFor="bike" className="block text-sm text-gray-600 mb-1">Fahrradtyp (optional)</label>
                      <input
                        type="text"
                        id="bike"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="z.B. Stadtrad, E-Bike, Rennrad..."
                      />
                    </div>
                    <div>
                      <label htmlFor="notes" className="block text-sm text-gray-600 mb-1">Problembeschreibung (optional)</label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Beschreibe kurz das Problem mit deinem Fahrrad..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Zurück
                    </button>
                    <button
                      onClick={handleBookingConfirm}
                      className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Buchung bestätigen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Zusammenfassung</h3>

              {selectedServiceIds.length === 0 ? (
                <p className="text-sm text-gray-500">Noch keine Services ausgewählt</p>
              ) : (
                <>
                  <ul className="space-y-2 mb-4">
                    {selectedServices.map(service => (
                      <li key={service.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{service.name}</span>
                        <span className="text-gray-900 font-medium">{formatPrice(service.price_cents)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dauer</span>
                      <span className="text-gray-900">{formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Gesamtpreis</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {selectedSlot && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Termin</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedSlot.start).toLocaleDateString('de-DE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                        , {formatTime(selectedSlot.start)} Uhr
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
