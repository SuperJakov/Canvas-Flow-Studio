import type { MetadataRoute } from "next";
import { getBaseUrl } from "~/helpers/baseurl";

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = getBaseUrl();
  sitemapUrl.pathname = "/sitemap.xml";
  return {
    rules: {
      allow: "*",
    },
    sitemap: sitemapUrl.toString(),
  };
}
