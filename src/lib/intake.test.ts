import { describe, expect, it } from "vitest";
import { parseIntake } from "./intake";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = { name: "Dana", email: "dana@example.com", business: "Dana's Bakery", message: "Invoices take all week." };

describe("parseIntake", () => {
  it("accepts a complete submission and trims it", () => {
    expect(parseIntake(form({ ...valid, name: "  Dana  " }))).toEqual({ ok: true, data: valid });
  });

  it("allows the business name to be blank", () => {
    expect(parseIntake(form({ ...valid, business: "" })).ok).toBe(true);
  });

  it("rejects a missing name, message or bad email", () => {
    expect(parseIntake(form({ ...valid, name: "" }))).toEqual({ ok: false, error: "invalid" });
    expect(parseIntake(form({ ...valid, message: " " }))).toEqual({ ok: false, error: "invalid" });
    expect(parseIntake(form({ ...valid, email: "not-an-email" }))).toEqual({ ok: false, error: "invalid" });
  });

  it("flags the honeypot as spam", () => {
    expect(parseIntake(form({ ...valid, website: "http://spam.example" }))).toEqual({ ok: false, error: "spam" });
  });

  it("caps long fields", () => {
    const result = parseIntake(form({ ...valid, message: "x".repeat(5000) }));
    expect(result.ok && result.data.message.length).toBe(4000);
  });
});
