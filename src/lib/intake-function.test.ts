// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { notify, onRequestPost } from "../../functions/api/intake";

function post(fields: Record<string, string>) {
  return new Request("https://example.com/api/intake", {
    method: "POST",
    body: new URLSearchParams(fields),
  });
}

function fakeDb() {
  const rows: unknown[][] = [];
  return {
    rows,
    prepare: () => ({
      bind: (...values: unknown[]) => ({ run: async () => rows.push(values) }),
    }),
  };
}

const valid = {
  name: "Dana",
  email: "dana@example.com",
  business: "",
  message: "Invoices take all week.",
};

describe("POST /api/intake", () => {
  it("stores a valid submission and redirects to /thanks", async () => {
    const DB = fakeDb();
    const response = await onRequestPost({ request: post(valid), env: { DB } });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://example.com/thanks");
    expect(DB.rows).toEqual([
      ["Dana", "dana@example.com", "", "Invoices take all week."],
    ]);
  });

  it("sends invalid submissions to the error page without storing them", async () => {
    const DB = fakeDb();
    const response = await onRequestPost({
      request: post({ ...valid, email: "nope" }),
      env: { DB },
    });
    expect(response.headers.get("location")).toBe(
      "https://example.com/contact-error",
    );
    expect(DB.rows).toEqual([]);
  });

  it("drops spam quietly", async () => {
    const DB = fakeDb();
    const response = await onRequestPost({
      request: post({ ...valid, website: "x" }),
      env: { DB },
    });
    expect(response.headers.get("location")).toBe("https://example.com/thanks");
    expect(DB.rows).toEqual([]);
  });

  it("shows the error page when the database isn't bound", async () => {
    const response = await onRequestPost({ request: post(valid), env: {} });
    expect(response.headers.get("location")).toBe(
      "https://example.com/contact-error",
    );
  });
});

describe("intake alerts", () => {
  const secrets = {
    RESEND_API_KEY: "re_test",
    INTAKE_NOTIFY_TO: "owner@example.com",
  };

  it("emails the submission with reply-to set to the visitor", async () => {
    const calls: [string, RequestInit][] = [];
    const fetcher = async (url: string, init: RequestInit) => {
      calls.push([url, init]);
      return new Response("{}");
    };
    await notify(secrets, valid, fetcher as typeof fetch);
    expect(calls).toHaveLength(1);
    const body = JSON.parse(calls[0][1].body as string);
    expect(body.to).toBe("owner@example.com");
    expect(body.reply_to).toBe("dana@example.com");
    expect(body.text).toContain("Invoices take all week.");
  });

  it("pushes to ntfy when a topic is set", async () => {
    const calls: [string, RequestInit][] = [];
    const fetcher = async (url: string, init: RequestInit) => {
      calls.push([url, init]);
      return new Response("{}");
    };
    await notify(
      { NTFY_TOPIC_URL: "https://ntfy.sh/test-topic" },
      valid,
      fetcher as typeof fetch,
    );
    expect(calls.map(([url]) => url)).toEqual(["https://ntfy.sh/test-topic"]);
    expect(calls[0][1].body).toContain("Invoices take all week.");
  });

  it("skips the email when the secrets aren't set", async () => {
    let called = false;
    await notify(
      {},
      valid,
      (async () => ((called = true), new Response())) as typeof fetch,
    );
    expect(called).toBe(false);
  });

  it("still thanks the visitor when the email fails", async () => {
    const DB = fakeDb();
    vi.stubGlobal("fetch", async () => new Response("down", { status: 500 }));
    const response = await onRequestPost({
      request: post(valid),
      env: { DB, ...secrets },
    });
    vi.unstubAllGlobals();
    expect(response.headers.get("location")).toBe("https://example.com/thanks");
    expect(DB.rows).toHaveLength(1);
  });
});
