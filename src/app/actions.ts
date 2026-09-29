"use server";

import { db } from "@/db";
import { sites, checks } from "@/db/schema";
import { and, eq, desc, gte, count } from "drizzle-orm";
import { normalizeUrl } from "@/lib/normilize-url";
import { safeFetch, SafeFetchError } from "@/lib/safe-fetch";
import { parseSeo } from "@/lib/parse-seo";
import { getOwnerId } from "@/lib/get-owner-id";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export type CheckUrlResult = { success: true; siteId: string; checkId: string } 
  | { success: false; message: string };

const MAX_CHECKS_PER_HOUR = 5;

export async function checkUrl(rawUrl: string): Promise<CheckUrlResult> {
  const ownerId = await getOwnerId();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [{ value: recentCount }] = await db
  .select({ value: count() })
  .from(checks)
  .innerJoin(sites, eq(checks.siteId, sites.id))
  .where(and(eq(sites.ownerId, ownerId), gte(checks.createdAt, hourAgo)));

  if (recentCount >= MAX_CHECKS_PER_HOUR) {
    return {
      success: false,
      message: "Превышен лимит проверок в час. Попробуй позже.",
    };
  }

  let url: string;
  
  try {
    url = normalizeUrl(rawUrl);
  } catch {
    return { success: false, message: "Некорректный URL" }
  }

  // находим или создаем запись сайта для юзера
  // onConflictDoNothing - ничего не делаем, если запись уже есть
  await db.insert(sites).values({ ownerId, url }).onConflictDoNothing({ target: [sites.ownerId, sites.url] });

  // берём сайт вручную, т.к. при конфликте может не вернуться
  const [site] = await db.select().from(sites).where(and(eq(sites.ownerId, ownerId), eq(sites.url, url)));

  try {
    const { httpStatus, html, responseMs } = await safeFetch(url);
    const seo = parseSeo(html);

    const [check] = await db
      .insert(checks)
      .values({
        siteId: site.id,
        status: "done",
        httpStatus,
        responseMs,
        title: seo.title,
        h1: seo.h1,
        description: seo.description,
        details: { canonical: seo.canonical, robots: seo.robots }
      })
      .returning();

    revalidatePath('/');
    return { success: true, siteId: site.id, checkId: check.id };
  } catch (err) {
    const message = err instanceof SafeFetchError ? err.message : "Неизвестная ошибка";

    const [check] = await db
      .insert(checks)
      .values({
        siteId: site.id,
        status: "failed",
        error: message,
      })
      .returning();
    
    revalidatePath('/');
    return { success: true, siteId: site.id, checkId: check.id };
  }
}

export async function getSitesWithLastCheck() {
  const ownerId = await getOwnerId();

  const ownerSites = await db.select().from(sites).where(eq(sites.ownerId, ownerId)).orderBy(desc(sites.createdAt));

  const withChecks = await Promise.all(
    ownerSites.map(async (site) => {
      const [lastCheck] = await db
        .select()
        .from(checks)
        .where(eq(checks.siteId, site.id))
        .orderBy(desc(checks.createdAt))
        .limit(1);
      
      return { site, lastCheck: lastCheck ?? null };
    })
  );

  return withChecks;
}

export async function getSiteWithChecks(siteId: string) {
  const ownerId = await getOwnerId();

  const [site] = await db
    .select()
    .from(sites)
    // 2 проверки и id сайта и id владельца, чтобы видеть только свои проверки
    .where(and(eq(sites.id, siteId), eq(sites.ownerId, ownerId)))

  if (!site) {
    notFound();
  }

  const siteChecks = await db
    .select()
    .from(checks)
    .where(eq(checks.siteId, site.id))
    .orderBy(desc(checks.createdAt))

  return { site, checks: siteChecks };
}