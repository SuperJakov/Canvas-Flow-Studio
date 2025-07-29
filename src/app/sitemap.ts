import type { MetadataRoute } from "next";
import { getBaseUrl } from "~/helpers/baseurl";
import { chapters } from "./docs/chapters";

type SitemapEntry = MetadataRoute.Sitemap[number];

const ROOT_ROUTES = ["/", "/pricing", "/changelog"] as const;
const PRIORITY_OVERRIDES: Record<string, number> = {
  "/": 1,
  "/docs/getting-started/introduction": 0.8,
  "/pricing": 0.7,
  "/changelog": 0.6,
};

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

const CHANGE_FREQUENCY_OVERRIDES: Record<string, ChangeFrequency> = {
  "/changelog": "daily",
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

  const changeFrequency: ChangeFrequency =
    CHANGE_FREQUENCY_OVERRIDES[pathRoute] ?? "weekly";

  return {
    url: fullUrl,
    lastModified,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rootEntries = await Promise.all(
    ROOT_ROUTES.map((route) => generateSitemapEntry(route)),
  );

  const docRoutes = chapters.flatMap((chapter) =>
    chapter.sections.map((section) => `/docs/${chapter.slug}/${section.slug}`),
  );

  const docEntries = await Promise.all(
    docRoutes.map((route) => generateSitemapEntry(route)),
  );

  return [...rootEntries, ...docEntries];
}
