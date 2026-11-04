// tournamentDates.js: calendar facts about the tournament.

/**
 * Selection Sunday for a given year: the first Sunday on or after March 12.
 * Holds for every tournament from 2021 (Mar 14) through 2026 (Mar 15); the
 * first round always starts the Thursday after it.
 */
export function selectionSunday(year) {
  const date = new Date(year, 2, 12)
  const daysUntilSunday = (7 - date.getDay()) % 7
  date.setDate(date.getDate() + daysUntilSunday)
  return date
}
