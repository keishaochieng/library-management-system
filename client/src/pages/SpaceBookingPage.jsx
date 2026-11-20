import { useState } from 'react';

// The library's bookable spaces (a fixed list for now)
const SPACES = [
  'Study Room A',
  'Study Room B',
  'Quiet Zone',
  'Computer Lab',
  'Meeting Room',
];

export default function SpaceBookingPage() {
  const [space, setSpace] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setConfirmation('');

    // Simple validation: the end time must be after the start time
    if (endTime <= startTime) {
      setError('End time must be after the start time.');
      return;
    }
    setError('');

    // The booking would be sent to the API here once a bookings endpoint exists.
    setConfirmation(
      `Booking request for ${space} on ${date}, ${startTime} to ${endTime}, submitted.`,
    );
    setSpace('');
    setDate('');
    setStartTime('');
    setEndTime('');
  }

  return (
    <section className="form-card">
      <h1>Book a space</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Space
          <select value={space} onChange={(e) => setSpace(e.target.value)} required>
            <option value="">Choose a space...</option>
            {SPACES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label>
          Start time
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>
        <label>
          End time
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
        {error && <p className="state error">{error}</p>}
        {confirmation && <p className="state ok">{confirmation}</p>}
        <button type="submit" className="btn">
          Submit booking
        </button>
      </form>
    </section>
  );
}
