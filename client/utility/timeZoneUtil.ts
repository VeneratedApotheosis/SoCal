/**
 * Returns the short timezone abbreviation (e.g., "EST", "PDT")
 * @param date The date to evaluate (timezones change between standard/daylight time)
 * @returns A string representing the short timezone name
 */
export const getShortTimeZone = (date: Date = new Date(), userTimeZone: string): string => {
  if (userTimeZone === '') return userTimeZone;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimeZone,
      timeZoneName: 'short',
    });

    // 3. Extract just the 'timeZoneName' part from the formatted result
    const parts = formatter.formatToParts(date);
    const shortTzName = parts.find((part) => part.type === 'timeZoneName')?.value;

    // Return the short name, or fallback to the IANA string if it fails
    return shortTzName || userTimeZone;
  } catch (error) {
    console.error('Failed to parse short timezone:', error);
    return userTimeZone;
  }
};
