# Infinity Events - Event Management Implementation

## � Project Plan

### Phase 1: Database Foundation (Step 2)
**Goal**: Create exactly 3 basic models.
- **Decoration**: `name`, `price`, `image`, `description`.
- **Booking**: `user`, `event_type`, `event_date`, `guests`, `budget`, `status`.
- **User**: `email`, `password`, `role` (USER / ADMIN).

**Status**: Backend models, serializers, and views are implemented and ready for API testing.

---

### Phase 2: User Dashboard (Step 3)
**Goal**: Create a simplified dashboard with 3 cards.
- **Cards**: Corporate Event, Private Party, Decoration.
- **Action**: Clicking "Decoration" fetches all records from the database and displays them.
- **Action**: Clicking "Select" on a decoration redirects to the booking form with that ID.

---

### Phase 3: Booking Form (Step 4)
**Goal**: Implement a single-page booking form.
- **Fields**: Event Type, Event Date, Guest Count, Budget.
- **Auto-filled**: Selected Decoration.
- **Outcome**: Save booking in DB with "Pending" status.

---

### Phase 4: Admin Dashboard (Step 5)
**Goal**: Simple admin overview.
- **Features**: View all bookings, view details.
- **Status Control**: Approve or Reject bookings.

---

## 🛠 Current Backend State
- **API: Register**: `POST /api/register/`
- **API: Login**: `POST /api/login/`
- **API: Decorations**: `GET /api/decorations/`
- **API: Bookings**: `GET/POST /api/bookings/`
- **API: Admin Status**: `PATCH /api/admin/bookings/<id>/status/`
