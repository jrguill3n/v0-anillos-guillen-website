import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://anillosguillen.com"

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/catalogo`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: new Date(),
    },
  ]

  // Dynamic ring routes
  try {
    const supabase = await createClient()
    const { data: rings, error } = await supabase
      .from("rings")
      .select("slug, updated_at")
      .eq("is_active", true)

    if (error || !rings) {
      console.error("Error fetching rings for sitemap:", error)
      return staticRoutes
    }

    const dynamicRoutes: MetadataRoute.Sitemap = rings.map((ring) => ({
      url: `${baseUrl}/catalogo/${ring.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      lastModified: ring.updated_at ? new Date(ring.updated_at) : new Date(),
    }))

    return [...staticRoutes, ...dynamicRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticRoutes
  }
}
