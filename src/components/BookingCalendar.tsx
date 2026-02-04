'use client';

import { useState, useMemo } from 'react';
import { DayAvailability, TimeSlot } from '@/types';
import { formatDateDisplay, formatTime } from '@/lib/booking';

interface BookingCalendarProps {
  availability: DayAvailability[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  disabled?: boolean;
}

export default function BookingCalendar({
  availability,
  selectedSlot,
  onSlotSelect,
  disabled = false,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    availability.find(d => d.slots.some(s => s.available))?.date || null
  );

  // Get slots for selected date
  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    const day = availability.find(d => d.date === selectedDate);
    return day?.slots || [];
  }, [selectedDate, availability]);

  // Group available slots by date for the date picker
  const datesWithAvailability = useMemo(() => {
    return availability.map(day => ({
      date: day.date,
      dayName: day.dayName,
      hasAvailableSlots: day.slots.some(s => s.available),
      availableCount: day.slots.filter(s => s.available).length,
    }));
  }, [availability]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Termin wählen
      </h3>

      {/* Date picker - horizontal scroll */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">Datum auswählen</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {datesWithAvailability.map(day => {
            const isSelected = selectedDate === day.date;
            const date = new Date(day.date);
            const dayNum = date.getDate();
            const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
            const month = monthNames[date.getMonth()];

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                disabled={disabled || !day.hasAvailableSlots}
                className={`flex-shrink-0 w-16 py-3 px-2 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : day.hasAvailableSlots
                    ? 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                    : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                aria-pressed={isSelected}
                aria-label={`${day.dayName}, ${dayNum}. ${month}, ${day.availableCount} freie Termine`}
              >
                <div className="text-xs font-medium uppercase">
                  {day.dayName.substring(0, 2)}
                </div>
                <div className="text-xl font-bold mt-0.5">{dayNum}</div>
                <div className="text-xs text-gray-500">{month}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots for selected date */}
      {selectedDate && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Uhrzeit auswählen - {formatDateDisplay(selectedDate)}
          </p>

          {selectedDaySlots.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Keine Termine an diesem Tag verfügbar</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {selectedDaySlots.map((slot, idx) => {
                const isSelected = selectedSlot?.start === slot.start;
                const timeStr = formatTime(slot.start);

                return (
                  <button
                    key={idx}
                    onClick={() => slot.available && onSlotSelect(slot)}
                    disabled={disabled || !slot.available}
                    className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : slot.available
                        ? 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 text-gray-900'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`${timeStr} Uhr${!slot.available ? ', nicht verfügbar' : ''}`}
                  >
                    {timeStr}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-gray-200 bg-white"></div>
              <span>Verfügbar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-gray-100 bg-gray-50"></div>
              <span>Belegt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-primary-500"></div>
              <span>Ausgewählt</span>
            </div>
          </div>
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Bitte wähle zuerst ein Datum aus</p>
        </div>
      )}
    </div>
  );
}
