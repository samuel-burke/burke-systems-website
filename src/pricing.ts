// Monthly care plans shown in the Pricing section. Edit prices and features here.
export type Plan = {
  name: string;
  price: number;
  summary: string;
  features: string[];
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Keep it running",
    price: 50,
    summary:
      "For software that's done and just needs looking after. No changes included.",
    features: [
      "Uptime monitoring and alerts",
      "Security and software updates",
      "Backups checked",
    ],
  },
  {
    name: "Small changes",
    price: 75,
    summary: "For teams that want small tweaks as they go.",
    features: [
      "Everything in Keep it running",
      "About 1 hour of small changes a month, like a new report, field or email rule",
    ],
    featured: true,
  },
  {
    name: "Room to grow",
    price: 100,
    summary: "For software that keeps growing with your business.",
    features: [
      "Everything in Small changes",
      "About 3 hours a month for new features",
    ],
  },
];

export const planTerms = [
  "Month to month, cancel anytime",
  "First month free",
  "Bugs in our work fixed free",
  "The code is yours",
  "Extra work billed hourly",
];
