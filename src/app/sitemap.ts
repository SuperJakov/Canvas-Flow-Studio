import type { MetadataRoute } from "next";
import { getBaseUrl } from "~/helpers/baseurl";

type SitemapEntry = MetadataRoute.Sitemap[number];

const ROOT_ROUTES = ["/", "/pricing"] as const;
const PRIORITY_OVERRIDES: Record<string, number> = {
  "/": 1,
  "/pricing": 0.7,
};

/**
 * Generate metadata for a given path
 * @param pathRoute e.g. "/about"
 */
async function generateSitemapEntry(pathRoute: string): Promise<SitemapEntry> {
  const baseUrl = getBaseUrl();
  const fullUrl = new URL(pathRoute, baseUrl).toString();

  // Optionally, read file system to compute last modified date
  // Here we default to now, but you can customize to check file timestamps:
  const lastModified = new Date();

  const priority = PRIORITY_OVERRIDES[pathRoute] ?? 0.5;

  return {
    url: fullUrl,
    lastModified,
    changeFrequency: "weekly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(
    ROOT_ROUTES.map((route) => generateSitemapEntry(route)),
  );

  return entries;
}
