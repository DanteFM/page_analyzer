import dns from "node:dns/promises";
import { Address4, Address6 } from "ip-address";

const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_REDIRECTS = 5;

export interface SafeFetchResult {
  httpStatus: number;
  html: string;
  responseMs: number;
}

export class SafeFetchError extends Error {
  constructor(
    message: string,
    public code: "blocked_address"
      | "timeout"
      | "too_large"
      | "not_html"
      | "network_error"
  ) {
    super(message);
  }
}

export function isBlockedIp(ip: string): boolean {
  try {
    const v4 = new Address4(ip);

    return (
      v4.isInSubnet(new Address4("127.0.0.0/8")) ||
      v4.isInSubnet(new Address4("10.0.0.0/8")) ||
      v4.isInSubnet(new Address4("172.16.0.0/12")) ||
      v4.isInSubnet(new Address4("192.168.0.0/16")) ||
      v4.isInSubnet(new Address4("169.254.0.0/16")) ||
      v4.isInSubnet(new Address4("0.0.0.0/8"))
    )

  } catch {
    // не IPv4 — пробуем IPv6
  }

  try {
    const v6 = new Address6(ip);
    return (
      v6.isInSubnet(new Address6("::1/128")) ||
      v6.isInSubnet(new Address6("fc00::/7")) ||
      v6.isInSubnet(new Address6("fe80::/10"))
    );
  } catch {
    return true; // не распарсили — считаем небезопасным
  }
}

async function assertHostIsPublic(hostname: string): Promise<void> {
  const records = await dns.lookup(hostname, { all: true });

  if (records.length === 0) {
    throw new SafeFetchError("DNS не вернул ни одного адреса", "blocked_address");
  }

  for (const record of records) {
    if (isBlockedIp(record.address)) {
      throw new SafeFetchError(
        `Адрес ${record.address} находится в закрытом диапазоне`,
        "blocked_address"
      )
    }
  }
}

export async function safeFetch(url: string): Promise<SafeFetchResult> {
  const start = Date.now();
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const parsed = new URL(currentUrl);
    await assertHostIsPublic(parsed.hostname);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { "User-Agent": "PageAnalyzerBot/1.0"},
      });
    } catch (err) {
      if (controller.signal.aborted) {
        throw new SafeFetchError("Превышен таймаут запроса", "timeout");
      }
      throw new SafeFetchError(`Сетевая ошибка: ${String(err)}`, "network_error");
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new SafeFetchError("Редирект без заголовка Location", "network_error");
      }

      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new SafeFetchError(`Неподдерживаемый Content-Type: ${contentType}`, "not_html")
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new SafeFetchError("Пустое тело ответа", "network_error");
    }

    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;
      received += value.length;

      if (received > MAX_BODY_BYTES) {
        throw new SafeFetchError("Тело ответа превышает лимит размера", "too_large");
      }

      chunks.push(value);
    }

    const html = Buffer.concat(chunks).toString("utf-8");

    return {
      httpStatus: response.status,
      html,
      responseMs: Date.now() - start,
    };
  }

  throw new SafeFetchError("Превышено число редиректов", "network_error");
}