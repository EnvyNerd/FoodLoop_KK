/**
 * Convert 24-hour time string (e.g. "19:30") to 12-hour format (e.g. "7:30 PM").
 * @param {string} time24 - Time in "HH:MM" 24-hour format
 * @returns {string} Time in "H:MM AM/PM" 12-hour format
 */
export function formatTime12h(time24) {
  if (!time24 || typeof time24 !== 'string') return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Format a pickup window from 24h start/end to "7:30–8:30 PM" style.
 * @param {string} start - pickupStart in "HH:MM" 24h
 * @param {string} end - pickupEnd in "HH:MM" 24h
 * @returns {string} e.g. "7:30–8:30 PM" or "9:00–10:00 PM"
 */
export function formatPickupWindow(start, end) {
  if (!start || !end) return '';
  const start12 = formatTime12h(start);
  const end12 = formatTime12h(end);
  if (!start12 || !end12) return '';
  const startAMPM = start12.slice(-2);
  const endAMPM = end12.slice(-2);
  if (startAMPM === endAMPM) {
    return `${start12.replace(/ [AP]M/, '')}\u2013${end12}`;
  }
  return `${start12}\u2013${end12}`;
}
