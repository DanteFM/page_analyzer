import { describe, expect, it } from "vitest";
import { parseSeo } from "./parse-seo";

describe("parseSeo", () => {
  it("Извлекаем тайтл, заголовок и описание", () => {
    const html = `
      <html>
        <head>
          <title>Заголовок</title>
          <meta name="description" content="Описание страницы">
        </head>
        <body>
          <h1>Заголовок на странице</h1>
        </body>
      </html>
    `;

    expect(parseSeo(html)).toEqual({
      title: "Заголовок",
      h1: "Заголовок на странице",
      description: "Описание страницы",
      canonical: null,
      robots: null,
    })
  });

  it("Возвращаем null для отсутствующих полей", () => {
    const result = parseSeo("<html><head></head><body></body></html>");
    expect(result.title).toBeNull();
    expect(result.h1).toBeNull();
    expect(result.description).toBeNull();
  });

  it("Берём первый тег при наличии дубликатов", () => {
    const html = `
      <html><head>
        <title>Первый</title>
        <title>Второй</title>
      </head></html>
    `;
    expect(parseSeo(html).title).toBe("Первый");
  });
})