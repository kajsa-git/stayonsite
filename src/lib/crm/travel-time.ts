/** Unknown routes never qualify. Compare seconds before rounding the displayed minutes. */
export function withinTravelTime(seconds: number | null | undefined, minutes = 30): boolean {
  return seconds != null && Number.isFinite(seconds) && seconds >= 0 && seconds <= minutes * 60;
}
