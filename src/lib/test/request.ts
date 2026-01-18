/**
 * Test utilities for creating mock NextRequest objects
 * 
 * Used in API route tests to simulate incoming requests.
 */

import { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest for testing API routes
 * 
 * @param url - The request URL (e.g., '/api/booking')
 * @param body - The JSON request body
 * @param headers - Optional additional headers
 * @returns A NextRequest object suitable for testing
 * 
 * @example
 * const request = makeJsonRequest('/api/booking', { clientName: 'Test User' });
 * const response = await POST(request);
 */
export function makeJsonRequest(
  url: string,
  body: Record<string, any>,
  headers?: Record<string, string>
): NextRequest {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  const request = new NextRequest(fullUrl, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(body),
  });

  return request;
}

/**
 * Create a mock GET NextRequest
 */
export function makeGetRequest(
  url: string,
  headers?: Record<string, string>
): NextRequest {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const requestHeaders = new Headers(headers || {});

  const request = new NextRequest(fullUrl, {
    method: 'GET',
    headers: requestHeaders,
  });

  return request;
}
