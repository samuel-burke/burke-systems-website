// Monthly care plans shown in the Pricing section. Edit prices and features here.
export type Plan = {
  name: string;
  price: number;
  summary: string;
  features: string[];
  /** Concrete examples of the work the plan covers. */
  examples: { heading: string; items: string[] };
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Keep it running",
    price: 50,
    summary: "We keep what we built working.",
    features: [
      "24/7 monitoring, so we hear about problems before you do",
      "Security patches and software updates applied for you",
      "Daily backups, checked monthly",
      "Bugs in our work fixed free",
      "Fixes when an outside service you rely on changes",
      "A monthly health report",
      "Reply within 2 business days",
    ],
    examples: {
      heading: "Small tweaks included, like:",
      items: [
        "Editing an email template",
        "Changing who gets a notification",
        "Adjusting a schedule",
      ],
    },
  },
  {
    name: "Small changes",
    price: 75,
    summary: "For tools your team uses every day.",
    features: [
      "Everything in Keep it running",
      "Reply by the next business day",
      "Quiet month? It carries over to the next one",
    ],
    examples: {
      heading: "Changes as your business changes, like:",
      items: [
        "A new field on a form",
        "A new column in a report",
        "A new email or alert rule",
        "A new user or role",
        "A changed step in your workflow",
      ],
    },
    featured: true,
  },
  {
    name: "Room to grow",
    price: 100,
    summary: "For businesses adding automation over time.",
    features: [
      "Everything in Small changes",
      "Same-day reply on business days",
      "Your requests go first in line",
      "Optional monthly call to plan what's next",
    ],
    examples: {
      heading: "New work each month, like:",
      items: [
        "A new report",
        "A new automation",
        "A connection to another app, like QuickBooks or Google Sheets",
        "A new page or screen",
      ],
    },
  },
];

export const planTerms = ["Month to month", "Cancel your plan anytime"];

export const plansFootnote =
  "Bigger projects are quoted separately, at a fixed price, before any work starts.";
