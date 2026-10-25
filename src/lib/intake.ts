// Shared by the intake form and the Pages Function that stores it.
export const INTAKE_LIMITS = {
  name: 100,
  email: 200,
  business: 150,
  message: 4000,
} as const;

export type Intake = {
  name: string;
  email: string;
  business: string;
  message: string;
};

export type IntakeResult =
  { ok: true; data: Intake } | { ok: false; error: "spam" | "invalid" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseIntake(form: FormData): IntakeResult {
  // Bots fill every field; people never see this one.
  if (String(form.get("website") ?? "").trim())
    return { ok: false, error: "spam" };

  const field = (key: keyof Intake) =>
    String(form.get(key) ?? "")
      .trim()
      .slice(0, INTAKE_LIMITS[key]);
  const data = {
    name: field("name"),
    email: field("email"),
    business: field("business"),
    message: field("message"),
  };

  if (!data.name || !data.message || !EMAIL_PATTERN.test(data.email))
    return { ok: false, error: "invalid" };
  return { ok: true, data };
}
