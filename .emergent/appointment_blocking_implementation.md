# Appointment Slot Duration Blocking - Implementation Summary

## Overview
Implemented appointment time slot blocking to prevent overlapping appointments. When a patient books an appointment at a specific time, the system now blocks the time slot for a 20-minute duration, ensuring doctors have adequate time with each patient.

## Changes Made

### Backend Changes (`backend/server.py`)

#### 1. **Added Appointment Duration Constant**
```python
APPOINTMENT_DURATION_MINUTES = 20
```
- Defines the minimum time needed per patient (20 minutes)
- Can be easily adjusted if needed

#### 2. **Helper Functions**
- **`parse_time(time_str)`**: Converts time string (HH:MM) to datetime object for calculations
- **`time_ranges_overlap()`**: Checks if two time ranges overlap
- **`check_appointment_conflict()`**: Main validation function that:
  - Finds all existing appointments for the same doctor and date
  - Excludes cancelled appointments
  - Checks if the requested time slot conflicts with any existing appointment (considering the 20-minute buffer)

#### 3. **Updated `/appointments` POST Endpoint**
- Now validates appointment time before booking
- Returns a clear error message if time slot is unavailable:
  ```
  "This time slot is not available. The doctor needs at least 20 minutes per patient. 
   Please choose a different time."
  ```

#### 4. **New `/appointments/booked-slots` GET Endpoint**
- Allows frontend to fetch all booked time slots for a specific doctor and date
- Returns:
  ```json
  {
    "booked_times": ["09:00", "10:00", "14:30"],
    "duration_minutes": 20
  }
  ```

### Frontend Changes (`frontend/src/pages/UserDashboard.jsx`)

#### 1. **New State Variables**
```javascript
const [bookedSlots, setBookedSlots] = useState([]);
const [selectedDoctor, setSelectedDoctor] = useState('');
const [selectedDate, setSelectedDate] = useState('');
```

#### 2. **Auto-Fetch Booked Slots**
- Added `useEffect` hook that automatically fetches booked slots when user selects:
  - A doctor
  - A date
- Calls `fetchBookedSlots()` API endpoint

#### 3. **Time Slot Validation Helper**
```javascript
isTimeSlotAvailable(selectedTime)
```
- Client-side validation to check if a selected time overlaps with booked slots
- Considers the 20-minute duration buffer

#### 4. **Enhanced UI**
- **Doctor Selection**: Added `onValueChange` handler to track selected doctor
- **Date Selection**: Added `onChange` handler to track selected date
- **Visual Indicator**: When doctor + date are selected and there are booked slots:
  - Displays a yellow alert box showing all booked time ranges
  - Shows each booked slot as: `12:00 - 12:20`
  - Clearly indicates the 20-minute blocking duration
  
#### 5. **Improved Error Handling**
- Displays backend error messages to users
- Shows errors for 5 seconds (instead of default)
- Resets form state after successful booking

## How It Works

### Booking Flow:
1. **User selects a doctor** → `selectedDoctor` state updates
2. **User selects a date** → `selectedDate` state updates
3. **Frontend automatically fetches booked slots** for that doctor/date combination
4. **UI displays booked time ranges** (e.g., "12:00 - 12:20")
5. **User selects a time** and submits the form
6. **Backend validates**:
   - Parses the requested time
   - Calculates end time (requested time + 20 minutes)
   - Checks all existing appointments for overlaps
   - If overlap exists → Returns 400 error with message
   - If no overlap → Books the appointment

### Example Scenario:
```
Existing appointment: 12:00
Blocked time range: 12:00 - 12:20

User attempts to book:
- 11:50 ❌ (overlaps: 11:50-12:10 conflicts with 12:00-12:20)
- 12:00 ❌ (exact same time)
- 12:10 ❌ (overlaps: 12:10-12:30 conflicts with 12:00-12:20)
- 12:20 ✅ (no overlap: 12:20-12:40 doesn't conflict)
- 11:40 ✅ (no overlap: 11:40-12:00 doesn't conflict)
```

## Benefits

1. **Prevents Double-Booking**: Backend validation ensures no overlapping appointments
2. **Better UX**: Users see booked slots before attempting to book
3. **Clear Communication**: Error messages explain why a slot is unavailable
4. **Flexible**: Easy to change `APPOINTMENT_DURATION_MINUTES` if needed
5. **Respects Doctor's Time**: Ensures minimum 20 minutes per patient

## Testing Recommendations

1. **Test overlapping bookings**:
   - Book at 12:00
   - Try booking at 12:10 (should fail)
   - Try booking at 12:20 (should succeed)

2. **Test UI indicators**:
   - Select a doctor with existing appointments
   - Select a date with bookings
   - Verify booked slots display correctly

3. **Test cancelled appointments**:
   - Cancelled appointments should NOT block time slots
   - Verify system excludes cancelled appointments from conflict checks

## Configuration

To change appointment duration, modify:
```python
# backend/server.py
APPOINTMENT_DURATION_MINUTES = 30  # Change from 20 to 30 minutes
```

No frontend changes needed - it automatically uses the backend's duration value.
