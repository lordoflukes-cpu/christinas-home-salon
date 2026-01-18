/**
 * Simple in-memory rate limiter for API routes
 * 
 * Tracks requests by IP address and enforces limits.
 * Used for anti-spam protection on booking and enquiry endpoints.
 */

const recentRequests = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Usually the IP address or client identifier
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = MAX_REQUESTS_PER_WINDOW,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): boolean {
  const now = Date.now();
  const timestamps = recentRequests.get(identifier) || [];
  
  // Remove expired timestamps
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  // Check if limit exceeded
  if (validTimestamps.length >= maxRequests) {
    return false;
  }
  
  // Add current timestamp
  validTimestamps.push(now);
  recentRequests.set(identifier, validTimestamps);
  
  return true;
}

/**
 * Reset rate limiter state
 * 
 * ONLY use this in tests! Clears all tracked requests.
 */
export function resetRateLimiter(): void {
  recentRequests.clear();
}

/**
 * Get current request count for an identifier
 * 
 * @param identifier - The identifier to check
 * @param windowMs - Time window in milliseconds
 * @returns Number of requests in the current window
 */
export function getRequestCount(
  identifier: string,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): number {
  const now = Date.now();
  const timestamps = recentRequests.get(identifier) || [];
  return timestamps.filter(ts => now - ts < windowMs).length;
}
