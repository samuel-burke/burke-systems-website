// Integration tests: real HTTP requests to the Pages Functions running in Wrangler (workerd),
// writing to a real local D1 database built from migrations/. Nothing here touches Cloudflare.
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import { expect, test } from "@playwright/test";
import { INTAKE_LIMITS } from "../../src/lib/intake.ts";
import { query } from "../support/wrangler.ts";

test.skip(
  !!process.env.PLAYWRIGHT_BASE_URL,
  "writes data; local test server only",
);

type Row = {
  name: string;
  email: string;
  business: string;
  message: string;
  status: string;
};

// Each test uses its own email address, so rows from other tests never get in the way.
let counter = 0;
const uniqueEmail = () => `visitor-${Date.now()}-${counter++}@example.com`;
const rowsFor = (email: string) =>
  query<Row>(
    `SELECT name, email, business, message, status FROM intake WHERE email = '${email}'`,
  );

// start-server.ts binds NTFY_TOPIC_URL to this receiver. It runs for the whole file so
// every stored request's alert has somewhere to go.
let receiver: Server;
const received: { headers: IncomingHttpHeaders; body: string }[] = [];

test.beforeAll(async () => {
  receiver = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received.push({ headers: req.headers, body });
      res.end("{}");
    });
  });
  await new Promise<void>((resolve) =>
    receiver.listen(8799, "127.0.0.1", resolve),
  );
});

test.afterAll(
  () => new Promise<void>((resolve) => receiver.close(() => resolve())),
);

function form(fields: Record<string, string>) {
  return { form: fields, maxRedirects: 0 };
}

test.describe("POST /api/intake", () => {
  test("stores a valid request and sends the visitor to /thanks", async ({
    request,
  }) => {
    const email = uniqueEmail();
    const response = await request.post(
      "/api/intake",
      form({ name: " Dana ", email, business: "", message: "Orders by hand." }),
    );
    expect(response.status()).toBe(303);
    expect(response.headers().location).toMatch(/\/thanks$/);
    expect(rowsFor(email)).toEqual([
      {
        name: "Dana",
        email,
        business: "",
        message: "Orders by hand.",
        status: "new",
      },
    ]);
  });

  for (const [label, fields] of [
    ["a bad email", { name: "Dana", email: "not-an-email", message: "Hi" }],
    ["a missing name", { name: "", email: "x@example.com", message: "Hi" }],
    [
      "a blank message",
      { name: "Dana", email: "x@example.com", message: "   " },
    ],
  ] as const) {
    test(`rejects ${label} without storing it`, async ({ request }) => {
      const before = query<{ n: number }>("SELECT COUNT(*) AS n FROM intake")[0]
        .n;
      const response = await request.post("/api/intake", form(fields));
      expect(response.status()).toBe(303);
      expect(response.headers().location).toMatch(/\/contact-error$/);
      expect(
        query<{ n: number }>("SELECT COUNT(*) AS n FROM intake")[0].n,
      ).toBe(before);
    });
  }

  test("thanks a bot that fills the honeypot but stores nothing", async ({
    request,
  }) => {
    const email = uniqueEmail();
    const response = await request.post(
      "/api/intake",
      form({
        name: "Bot",
        email,
        message: "Buy now",
        website: "http://spam.example",
      }),
    );
    expect(response.headers().location).toMatch(/\/thanks$/);
    expect(rowsFor(email)).toEqual([]);
  });

  test("caps every field at its limit before storing", async ({ request }) => {
    const email = uniqueEmail();
    await request.post(
      "/api/intake",
      form({
        name: "n".repeat(500),
        email,
        business: "b".repeat(500),
        message: "m".repeat(10_000),
      }),
    );
    const [row] = rowsFor(email);
    expect(row.name).toHaveLength(INTAKE_LIMITS.name);
    expect(row.business).toHaveLength(INTAKE_LIMITS.business);
    expect(row.message).toHaveLength(INTAKE_LIMITS.message);
  });

  test("stores SQL and HTML in a message as plain text", async ({
    request,
  }) => {
    const email = uniqueEmail();
    const message = "'); DROP TABLE intake; -- <script>alert(1)</script>";
    const response = await request.post(
      "/api/intake",
      form({ name: "Robert", email, message }),
    );
    expect(response.headers().location).toMatch(/\/thanks$/);
    expect(rowsFor(email)[0].message).toBe(message);
    // The table is still there.
    expect(query("SELECT COUNT(*) AS n FROM intake")).toHaveLength(1);
  });

  test("sends a body that isn't form data to the error page, not a server error", async ({
    request,
  }) => {
    const response = await request.post("/api/intake", {
      data: { name: "Dana", email: uniqueEmail(), message: "Hi" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(303);
    expect(response.headers().location).toMatch(/\/contact-error$/);
  });

  test("does not accept GET", async ({ request }) => {
    const response = await request.get(
      "/api/intake?name=Dana&email=x@example.com&message=Hi",
    );
    expect(response.status()).toBe(404);
  });
});

test.describe("intake alerts", () => {
  test("pushes a summary of a stored request to ntfy", async ({ request }) => {
    const email = uniqueEmail();
    await request.post(
      "/api/intake",
      form({
        name: "Dana",
        email,
        business: "Dana's Bakery",
        message: "Invoices take all week.",
      }),
    );
    await expect
      .poll(() => received.find((alert) => alert.body.includes(email)))
      .toBeTruthy();
    const alert = received.find((a) => a.body.includes(email))!;
    expect(alert.headers.title).toBe("New project request");
    expect(alert.body).toContain("Business: Dana's Bakery");
    expect(alert.body).toContain("Invoices take all week.");
  });
});

test.describe("pages.dev redirect", () => {
  test("sends the production pages.dev host to burke.systems", async ({
    request,
  }) => {
    const response = await request.get("/thanks?x=1", {
      headers: { host: "burke-systems-website.pages.dev" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(301);
    expect(new URL(response.headers().location).host).toBe("burke.systems");
    expect(
      new URL(response.headers().location).pathname +
        new URL(response.headers().location).search,
    ).toBe("/thanks?x=1");
  });

  test("leaves branch previews alone", async ({ request }) => {
    const response = await request.get("/", {
      headers: { host: "dev.burke-systems-website.pages.dev" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(200);
  });
});
