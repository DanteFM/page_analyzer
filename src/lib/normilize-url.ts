export function normalizeUrl(input: string): string {
  const url = new URL(input.trim());

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Неподдерживаемый протокол.")
  }

  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}