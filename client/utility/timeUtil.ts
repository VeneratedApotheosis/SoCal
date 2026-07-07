
export function applyTimeString(base: Date | undefined, timeStr: string): Date | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  if (meridiem === 'AM') {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }
  const d = new Date(base || Date.now());
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function applyDateString(base: Date | undefined, dateStr: string): Date | null {
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) return null;
  const month = parseInt(match[1], 10) - 1;
  const day = parseInt(match[2], 10);
  let year = match[3] ? parseInt(match[3], 10) : new Date(base || Date.now()).getFullYear();
  if (year < 100) year += 2000;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const d = new Date(base || Date.now());
  d.setFullYear(year, month, day);
  return d;
}

export function formatTo12Hour(date: Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${meridiem}`;
}

export function formatDateShort(date: Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}
