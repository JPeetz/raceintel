import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raceintel.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${baseUrl}/races`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/festivals`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic: courses
  const { data: courses } = await supabase.from("racecourses").select("id, updated_at").limit(200);
  const coursePages: MetadataRoute.Sitemap = (courses || []).map((c) => ({
    url: `${baseUrl}/courses/${c.id}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Dynamic: today's races
  const today = new Date().toISOString().split("T")[0];
  const { data: races } = await supabase
    .from("races")
    .select("id, updated_at")
    .gte("off_time", `${today}T00:00:00`)
    .lt("off_time", `${today}T23:59:59`)
    .limit(500);

  const racePages: MetadataRoute.Sitemap = (races || []).map((r) => ({
    url: `${baseUrl}/races/${r.id}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...coursePages, ...racePages];
}