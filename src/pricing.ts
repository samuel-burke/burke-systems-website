// Monthly plans shown in the Pricing section. Edit prices and features here.
export type Plan = {
  name: string;
  price: number;
  summary: string;
  /** Concrete examples of what the plan is a good fit for. */
  examples: { heading: string; items: string[] };
  features: string[];
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Starter",
    price: 50,
    summary: "For one simple automation.",
    examples: {
      heading: "Good for things like:",
      items: [
        "A report that builds itself",
        "A form that feeds a spreadsheet",
        "Reminder emails that send on their own",
      ],
    },
    features: [
      "Custom build",
      "Hosting and secure HTTPS",
      "No per-user fees",
      "Launch walkthrough and a short how-to guide",
      "24/7 monitoring",
      "Updates and security patches",
      "Daily backups",
      "Bugs fixed free",
      "Small tweaks",
      "Monthly health report",
      "Email support, reply within 2 business days",
    ],
  },
  {
    name: "Standard",
    price: 100,
    summary: "For a tool your team uses every day.",
    examples: {
      heading: "Good for things like:",
      items: [
        "An order or job tracker",
        "A client intake system",
        "Two systems that finally talk to each other",
      ],
    },
    features: [
      "Everything in Starter",
      "Changes as your business changes: new fields, reports, alerts, users and workflow steps",
      "Phone or video support",
      "Reply by the next business day",
      "Quarterly review of what could work better",
    ],
    featured: true,
  },
  {
    name: "Growth",
    price: 200,
    summary: "For a bigger system that keeps growing.",
    examples: {
      heading: "Good for things like:",
      items: [
        "An internal app with several screens and users",
        "A set of automations",
        "Connections to QuickBooks, Google Sheets and other apps",
      ],
    },
    features: [
      "Everything in Standard",
      "New features every month",
      "Team training whenever you add people",
      "Same-day replies on business days",
      "First in line for every request",
      "Monthly planning call",
    ],
  },
];

export const planTerms = [
  "No upfront cost",
  "Nothing to pay until it's built and you're happy",
  "Cancel anytime",
  "Your data is always yours to export",
];

export const plansFootnote =
  "Want to own it outright? Buy it out whenever you like. Bigger projects get their own fixed quote.";
