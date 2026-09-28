import * as cheerio from "cheerio";

export interface SeoData {
  title: string | null;
  h1: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
}

export function parseSeo(html: string): SeoData {
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim() || null;
  const h1 = $("h1").first().text().trim() || null;
  const description = $("meta[name='description']").attr("content")?.trim() || null;
  const canonical = $("link[rel='canonical']").attr("href")?.trim() || null;
  const robots = $("meta[name='robots']").attr("content")?.trim() || null;

  return { title, h1, description, canonical, robots};
}