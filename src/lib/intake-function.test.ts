// @vitest-environment node
import { describe, expect, it } from "vitest";
import { onRequestPost } from "../../functions/api/intake";

function post(fields: Record<string, string>) {
  return new Request("https://example.com/api/intake", { method: "POST", body: new URLSearchParams(fields) });
}

function fakeDb() {
  const rows: unknown[][] = [];
  return { rows, prepare: () => ({ bind: (...values: unknown[]) => ({ run: async () => rows.push(values) }) }) };
}

const valid = { name: "Dana", email: "dana@example.com", business: "", message: "Invoices take all week." };

describe("POST /api/intake", () => {
  it("stores a valid submission and redirects to /thanks", async () => {
    const DB = fakeDb();
    const response = await onRequestPost({ request: post(valid), env: { DB } });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://example.com/thanks");
    expect(DB.rows).toEqual([["Dana", "dana@example.com", "", "Invoices take all week."]]);
  });

  it("sends invalid submissions to the error page without storing them", async () => {
    const DB = fakeDb();
    const response = await onRequestPost({ request: post({ ...valid, email: "nope" }), env: { DB } });
    expect(response.headers.get("location")).toBe("https://example.com/contact-error");
    expect(DB.rows).toEqual([]);
  });

  it("drops spam quietly", async () => {
    const DB = fakeDb();
    const response = await onRequestPost({ request: post({ ...valid, website: "x" }), env: { DB } });
    expect(response.headers.get("location")).toBe("https://example.com/thanks");
    expect(DB.rows).toEqual([]);
  });

  it("shows the error page when the database isn't bound", async () => {
    const response = await onRequestPost({ request: post(valid), env: {} });
    expect(response.headers.get("location")).toBe("https://example.com/contact-error");
  });
});
