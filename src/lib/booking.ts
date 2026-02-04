import { DayAvailability, TimeSlot, Booking, Availability } from '@/types';
import { getAvailabilityForShop, getBlockedDatesForShop, getBookingsForShop } from './mock-data';

const SLOT_INTERVAL_MINUTES = 30; // 30-minute slot intervals
const MIN_ADVANCE_HOURS = 24; // Minimum 24 hours in advance
const DAYS_TO_SHOW = 14; // Show next 14 days

const DAY_NAMES_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const DAY_NAMES_SHORT_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/**
 * Get available time slots for a shop for the next 14 days
 */
export function getAvailableSlots(
  shopId: string,
  durationMinutes: number
): DayAvailability[] {
  const availability = getAvailabilityForShop(shopId);
  const blockedDates = getBlockedDatesForShop(shopId);
  const existingBookings = getBookingsForShop(shopId);

  const result: DayAvailability[] = [];
  const now = new Date();
  const minBookingTime = new Date(now.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);

  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dateStr = formatDateISO(date);
    const dayOfWeek = date.getDay();

    // Check if date is blocked
    const isBlocked = blockedDates.some(b => b.date === dateStr);
    if (isBlocked) {
      result.push({
        date: dateStr,
        dayName: DAY_NAMES_DE[dayOfWeek],
        slots: [],
      });
      continue;
    }

    // Get availability template for this day
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek);
    if (!dayAvailability) {
      result.push({
        date: dateStr,
        dayName: DAY_NAMES_DE[dayOfWeek],
        slots: [],
      });
      continue;
    }

    // Generate slots for this day
    const slots = generateSlotsForDay(
      date,
      dayAvailability,
      durationMinutes,
      existingBookings,
      minBookingTime
    );

    result.push({
      date: dateStr,
      dayName: DAY_NAMES_DE[dayOfWeek],
      slots,
    });
  }

  return result;
}

/**
 * Generate time slots for a specific day
 */
function generateSlotsForDay(
  date: Date,
  availability: Availability,
  durationMinutes: number,
  existingBookings: Booking[],
  minBookingTime: Date
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  const [startHour, startMinute] = availability.start_time.split(':').map(Number);
  const [endHour, endMinute] = availability.end_time.split(':').map(Number);

  const dayStart = new Date(date);
  dayStart.setHours(startHour, startMinute, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMinute, 0, 0);

  // Generate slots at SLOT_INTERVAL_MINUTES intervals
  let currentSlotStart = new Date(dayStart);

  while (currentSlotStart < dayEnd) {
    const slotEnd = new Date(currentSlotStart.getTime() + durationMinutes * 60 * 1000);

    // Check if slot fits within business hours
    if (slotEnd > dayEnd) {
      break;
    }

    // Check if slot is in the past or within minimum advance time
    const isAvailable = currentSlotStart >= minBookingTime &&
      !hasConflict(currentSlotStart, slotEnd, existingBookings);

    slots.push({
      start: currentSlotStart.toISOString(),
      end: slotEnd.toISOString(),
      available: isAvailable,
    });

    // Move to next slot
    currentSlotStart = new Date(currentSlotStart.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000);
  }

  return slots;
}

/**
 * Check if a time slot conflicts with existing bookings
 */
function hasConflict(start: Date, end: Date, bookings: Booking[]): boolean {
  for (const booking of bookings) {
    const bookingStart = new Date(booking.scheduled_at);
    const bookingEnd = new Date(bookingStart.getTime() + booking.total_duration_minutes * 60 * 1000);

    // Check for overlap
    if (start < bookingEnd && end > bookingStart) {
      return true;
    }
  }
  return false;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (German format)
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = DAY_NAMES_SHORT_DE[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayName}, ${day}.${month}.`;
}

/**
 * Format time from ISO string (HH:MM)
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} Min.`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} Std.`;
  }
  return `${hours} Std. ${remainingMinutes} Min.`;
}
