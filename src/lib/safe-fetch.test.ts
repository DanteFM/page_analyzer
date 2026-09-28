import { describe, expect, it } from "vitest";
import { isBlockedIp } from "./safe-fetch";

describe("isBlockedIp", () => {
  it("Блокирует loopback-адрес", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
  });

  it("Блокирует адрес облачных метаданных", () => {
    expect(isBlockedIp("169.254.169.254")).toBe(true);
  });

  it("Блокирует приватный диапазон 192.168.x.x", () => {
    expect(isBlockedIp("192.168.1.1")).toBe(true);
  });

  it("Пропускает публичный адрес", () => {
    expect(isBlockedIp("8.8.8.8")).toBe(false);
  });

  it("Блокирует IPv6 loopback", () => {
    expect(isBlockedIp("::1")).toBe(true);
  });
});