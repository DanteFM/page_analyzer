import { describe, expect, it } from 'vitest';
import { normalizeUrl } from './normilize-url';

describe('normalizeUrl', () => {
  it('Имя хоста в нижнем регистре', () => {
    expect(normalizeUrl("https://EXAMPLE.com")).toBe("https://example.com/")
  });

  it("Удаляет якори", () => {
    expect(normalizeUrl("https://example.com/page#some-section"))
      .toBe("https://example.com/page")
  });

  it ("Удаление слэша в конце не для главной страницы", () => {
    expect(normalizeUrl("https://example.com/page/")).toBe("https://example.com/page")
  });

  it ("Сохраняем слэш для корневой страницы", () => {
    expect(normalizeUrl("https://example.com")).toBe("https://example.com/")
  });

  it("Пробрасываем ошибку при неподдерживаемом протоколе", () => {
    expect(() => normalizeUrl("ftp://example.com")).toThrow();
  });

  it("Пробрасываем ошибку при некорректном вводе ссылки", () => {
    expect(() => normalizeUrl("Просто строка")).toThrow();
  });
})