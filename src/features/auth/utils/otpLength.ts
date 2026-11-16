// Route params are untrusted. Return a safe allocation size before any hooks
// initialize an input array; zero renders the invalid-link recovery state.
export function parseOtpLength(value: unknown): number {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+$/.test(value.trim()))) return 0;
  const length = Number(value);
  return Number.isInteger(length) && length >= 1 && length <= 10 ? length : 0;
}
