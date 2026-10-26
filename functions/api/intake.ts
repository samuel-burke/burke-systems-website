// Cloudflare Pages Function: stores contact form submissions in D1, then sends alerts.
// Needs a D1 binding named DB (Pages project > Settings > Bindings) with migrations/0001_intake.sql applied.
// Email alerts are optional. They need RESEND_API_KEY and INTAKE_NOTIFY_TO set as secrets in the Pages project.
// INTAKE_NOTIFY_FROM defaults to Resend's test sender, which can only mail the Resend account's own address.
// Push alerts are optional too: set NTFY_TOPIC_URL (and NTFY_TOKEN for a protected topic).
import { parseIntake, type Intake } from "../../src/lib/intake";

type D1Database = {
  prepare(query: string): {
    bind(...values: unknown[]): { run(): Promise<unknown> };
  };
};

type Env = {
  DB?: D1Database;
  RESEND_API_KEY?: string;
  INTAKE_NOTIFY_TO?: string;
  INTAKE_NOTIFY_FROM?: string;
  NTFY_TOPIC_URL?: string;
  NTFY_TOKEN?: string;
};

type Context = {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
};

const redirect = (request: Request, path: string) =>
  Response.redirect(new URL(path, request.url).toString(), 303);

const summary = (data: Intake) =>
  [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Business: ${data.business || "(not given)"}`,
    "",
    data.message,
  ].join("\n");

// Posts one alert. Failures are logged, never shown to the visitor: the request is already saved.
async function send(
  label: string,
  fetcher: typeof fetch,
  url: string,
  init: RequestInit,
) {
  try {
    const response = await fetcher(url, { method: "POST", ...init });
    if (!response.ok)
      console.error(
        `intake: ${label} alert failed`,
        response.status,
        await response.text(),
      );
  } catch (error) {
    console.error(`intake: ${label} alert failed`, error);
  }
}

// Sends every alert whose secrets are set.
export async function notify(
  env: Env,
  data: Intake,
  fetcher: typeof fetch = fetch,
) {
  const alerts: Promise<void>[] = [];
  if (env.RESEND_API_KEY && env.INTAKE_NOTIFY_TO)
    alerts.push(
      send("email", fetcher, "https://api.resend.com/emails", {
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            env.INTAKE_NOTIFY_FROM || "Burke Systems <onboarding@resend.dev>",
          to: env.INTAKE_NOTIFY_TO,
          reply_to: data.email,
          subject: `New project request from ${data.name}`,
          text: summary(data),
        }),
      }),
    );
  if (env.NTFY_TOPIC_URL)
    alerts.push(
      send("ntfy", fetcher, env.NTFY_TOPIC_URL, {
        // ntfy headers must be ASCII, so the visitor's name stays in the body.
        headers: {
          Title: "New project request",
          Tags: "inbox_tray",
          ...(env.NTFY_TOKEN && { Authorization: `Bearer ${env.NTFY_TOKEN}` }),
        },
        body: summary(data),
      }),
    );
  await Promise.all(alerts);
}

export async function onRequestPost(context: Context) {
  const { request, env } = context;
  // A body that isn't form data (wrong content type, garbled) would otherwise throw and return a 500.
  const form = await request.formData().catch(() => null);
  if (!form) return redirect(request, "/contact-error");
  const result = parseIntake(form);

  // Pretend spam succeeded so bots don't retry.
  if (!result.ok)
    return redirect(
      request,
      result.error === "spam" ? "/thanks" : "/contact-error",
    );

  if (!env.DB) {
    console.error("intake: no D1 binding named DB");
    return redirect(request, "/contact-error");
  }

  const { name, email, business, message } = result.data;
  try {
    await env.DB.prepare(
      "INSERT INTO intake (name, email, business, message) VALUES (?, ?, ?, ?)",
    )
      .bind(name, email, business, message)
      .run();
  } catch (error) {
    console.error("intake: insert failed", error);
    return redirect(request, "/contact-error");
  }

  const alert = notify(env, result.data);
  if (context.waitUntil) context.waitUntil(alert);
  else await alert;
  return redirect(request, "/thanks");
}
