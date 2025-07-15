/**
 * Determine the base URL from environment.
 * Uses VERCEL_URL when available, otherwise falls back to BASE_URL.
 * @throws if neither VERCEL_URL nor BASE_URL is set.
 */
export function getBaseUrl(): URL {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`);
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Environment variable BASE_URL is not set.");
  }

  return new URL(baseUrl);
}
