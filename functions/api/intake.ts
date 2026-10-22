// Cloudflare Pages Function: stores contact form submissions in D1, then emails an alert.
// Needs a D1 binding named DB (Pages project > Settings > Bindings) with migrations/0001_intake.sql applied.
// Email alerts are optional. They need RESEND_API_KEY and INTAKE_NOTIFY_TO set as secrets in the Pages project.
// INTAKE_NOTIFY_FROM defaults to Resend's test sender, which can only mail the Resend account's own address.
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
};

type Context = {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
};

const redirect = (request: Request, path: string) =>
  Response.redirect(new URL(path, request.url).toString(), 303);

// Sends the alert. Failures are logged, never shown to the visitor: the request is already saved.
export async function notify(
  env: Env,
  data: Intake,
  fetcher: typeof fetch = fetch,
) {
  if (!env.RESEND_API_KEY || !env.INTAKE_NOTIFY_TO) return;
  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Business: ${data.business || "(not given)"}`,
    "",
    data.message,
  ].join("\n");
  try {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.INTAKE_NOTIFY_FROM || "Burke Systems <onboarding@resend.dev>",
        to: env.INTAKE_NOTIFY_TO,
        reply_to: data.email,
        subject: `New project request from ${data.name}`,
        text,
      }),
    });
    if (!response.ok)
      console.error(
        "intake: alert email failed",
        response.status,
        await response.text(),
      );
  } catch (error) {
    console.error("intake: alert email failed", error);
  }
}

export async function onRequestPost(context: Context) {
  const { request, env } = context;
  const result = parseIntake(await request.formData());

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
