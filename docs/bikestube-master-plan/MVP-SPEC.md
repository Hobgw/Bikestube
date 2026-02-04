# MVP Specification — Bikestube v1.0

## Purpose of This Document
This is the source of truth for Claude Code when building the MVP. It defines what to build, what NOT to build, and the acceptance criteria for each feature.

---

## MVP Philosophy

**Build the minimum to validate:**
1. Shops will onboard and keep availability updated
2. Users will search, find, and book repairs
3. Both sides complete transactions and are satisfied

**Explicitly NOT in MVP:**
- Payment processing (shops handle payment directly)
- Mobile apps (responsive web only)
- Multi-language (German only)
- Reviews/ratings (add post-launch)
- Chat/messaging (phone numbers suffice)
- Advanced analytics (basic tracking only)

---

## User Types

### 1. Bike Owner (User)
- Needs a repair
- Wants to find a nearby shop with availability
- Wants to book without calling

### 2. Shop Owner/Manager (Partner)
- Runs a bike repair shop
- Wants more customers, especially off-peak
- Wants fewer phone calls and admin

### 3. Admin (Us)
- Onboards shops
- Monitors platform health
- Handles support escalations

---

## Core User Flows

### Flow 1: User Books a Repair

```
1. User lands on homepage
2. User enters location (address, PLZ, or "use my location")
3. User sees list of nearby shops (sorted by distance)
4. User clicks shop to view profile
5. User sees: services offered, prices, availability calendar
6. User selects service(s)
7. User selects date/time slot
8. User enters contact info (name, email, phone)
9. User confirms booking
10. User receives confirmation email
11. Shop receives notification (email + dashboard)
```

### Flow 2: Shop Manages Bookings

```
1. Shop logs into dashboard
2. Shop sees upcoming bookings (today, this week)
3. Shop can confirm/reject pending bookings
4. Shop can mark bookings as completed
5. Shop can update availability calendar
6. Shop can edit services and prices
7. Shop can view booking history
```

### Flow 3: Shop Onboarding

```
1. Shop receives outreach (email/call)
2. Shop clicks signup link
3. Shop creates account (email, password)
4. Shop enters business details (name, address, phone)
5. Shop adds services with prices
6. Shop sets weekly availability template
7. Shop profile goes live
```

---

## Feature Specifications

### F1: Location-Based Shop Search

**User story:** As a user, I want to find repair shops near me so I can choose a convenient one.

**Requirements:**
- Input: Address, postal code (PLZ), or GPS location
- Output: List of shops within 10km, sorted by distance
- Show: Shop name, distance, rating (placeholder for MVP), services preview
- Map view optional for MVP (list view required)

**Technical:**
- Google Maps Geocoding API for address → coordinates
- Haversine distance calculation for sorting
- Lazy load results (first 10, then more on scroll)

**Acceptance criteria:**
- [ ] User can enter Berlin address and see Berlin shops
- [ ] User can use GPS location
- [ ] Results sorted by distance
- [ ] Response time < 2 seconds

---

### F2: Shop Profile Page

**User story:** As a user, I want to see shop details so I can decide if it's right for me.

**Requirements:**
- Display: Name, address, phone, photos (if available)
- Services: List with prices
- Availability: Calendar showing open slots
- No reviews in MVP (placeholder "Reviews coming soon")

**Acceptance criteria:**
- [ ] Profile loads in < 1 second
- [ ] All shop data displays correctly
- [ ] Calendar shows available slots

---

### F3: Service Selection

**User story:** As a user, I want to select the service I need and see the price.

**Requirements:**
- Services displayed as selectable cards/list
- Each service shows: name, description, price, duration
- User can select multiple services
- Running total displayed

**Standard service categories (suggest to shops):**
1. General inspection / tune-up
2. Flat tire repair
3. Brake adjustment/replacement
4. Gear adjustment/replacement
5. Chain replacement
6. Full service / overhaul
7. E-bike diagnostic
8. E-bike battery check
9. Custom repair (price on inquiry)

**Acceptance criteria:**
- [ ] User can select one or more services
- [ ] Total price updates dynamically
- [ ] Duration estimate shown

---

### F4: Booking Calendar

**User story:** As a user, I want to pick a date and time that works for me.

**Requirements:**
- Display available slots for selected service(s)
- Account for service duration
- Minimum 24-hour advance booking
- Show next 14 days of availability

**Technical:**
- Shop sets weekly template (e.g., Mon-Fri 9-18, Sat 10-14)
- Shop can block specific dates
- Slot duration based on service selection

**Acceptance criteria:**
- [ ] Only available slots shown
- [ ] Slots account for service duration
- [ ] User cannot book in the past
- [ ] User cannot double-book existing appointments

---

### F5: Booking Confirmation

**User story:** As a user, I want to confirm my booking and receive confirmation.

**Requirements:**
- Booking summary: shop, services, date/time, price
- User inputs: name, email, phone (required)
- Optional: bike type, issue description
- Confirm button creates booking
- Confirmation email sent to user
- Notification sent to shop

**Acceptance criteria:**
- [ ] Booking saved to database
- [ ] Confirmation email sent within 1 minute
- [ ] Shop notified within 1 minute

---

### F6: Shop Dashboard

**User story:** As a shop, I want to manage my bookings and availability.

**Requirements:**
- Login with email/password
- Dashboard home: today's bookings, upcoming bookings
- Booking management: confirm, reject, complete, cancel
- Calendar management: set availability template, block dates
- Service management: add/edit/remove services with prices
- Profile management: update business info, photos

**Acceptance criteria:**
- [ ] Shop can log in
- [ ] Shop sees all their bookings
- [ ] Shop can confirm/reject bookings
- [ ] Shop can update availability
- [ ] Shop can edit services and prices

---

### F7: Email Notifications

**User story:** As a user/shop, I want to receive email notifications about bookings.

**Required emails:**
1. **User: Booking confirmation** — Sent immediately after booking
2. **User: Booking reminder** — 24 hours before appointment
3. **Shop: New booking alert** — Sent immediately when user books
4. **User: Booking cancelled** — If shop cancels
5. **Shop: Booking cancelled** — If user cancels

**Technical:**
- Use Resend, SendGrid, or similar
- Transactional email templates
- Include calendar invite (.ics) attachment

**Acceptance criteria:**
- [ ] All 5 email types send correctly
- [ ] Emails render properly on mobile
- [ ] Calendar invite works in common email clients

---

## Data Model (Simplified)

```
Shop
├── id (uuid)
├── name (string)
├── address (string)
├── city (string)
├── postal_code (string)
├── latitude (float)
├── longitude (float)
├── phone (string)
├── email (string)
├── password_hash (string)
├── created_at (timestamp)
└── updated_at (timestamp)

Service
├── id (uuid)
├── shop_id (fk)
├── name (string)
├── description (text)
├── price_cents (integer)
├── duration_minutes (integer)
├── is_active (boolean)
└── sort_order (integer)

Availability
├── id (uuid)
├── shop_id (fk)
├── day_of_week (integer 0-6)
├── start_time (time)
├── end_time (time)
└── is_active (boolean)

BlockedDate
├── id (uuid)
├── shop_id (fk)
├── date (date)
└── reason (string, optional)

Booking
├── id (uuid)
├── shop_id (fk)
├── user_name (string)
├── user_email (string)
├── user_phone (string)
├── bike_type (string, optional)
├── issue_description (text, optional)
├── scheduled_at (timestamp)
├── total_price_cents (integer)
├── total_duration_minutes (integer)
├── status (enum: pending, confirmed, completed, cancelled)
├── created_at (timestamp)
└── updated_at (timestamp)

BookingService
├── id (uuid)
├── booking_id (fk)
├── service_id (fk)
├── price_cents (integer, snapshot)
└── duration_minutes (integer, snapshot)
```

---

## Non-Functional Requirements

### Performance
- Page load: < 2 seconds on 3G
- API response: < 500ms
- Support 100 concurrent users (MVP)

### Security
- HTTPS everywhere
- Password hashing (bcrypt)
- CSRF protection
- SQL injection prevention
- Rate limiting on auth endpoints

### Accessibility
- Semantic HTML
- Keyboard navigable
- WCAG 2.1 AA (stretch goal)

### SEO
- Server-side rendering for shop pages
- Meta tags for shop profiles
- Sitemap generation
- Schema.org markup for local business

---

## Out of Scope (Future Features)

- Payment processing
- In-app messaging
- Reviews and ratings
- Mobile apps (iOS/Android)
- Multi-language support
- Shop subscription tiers
- Analytics dashboard
- API for third-party integration
- Loyalty/referral programs
