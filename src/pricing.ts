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
    summary: "For software that's built and needs looking after.",
    features: [
      "Uptime monitoring with alerts",
      "Security and software updates",
      "Daily backups",
      "Bugs in our work fixed free",
      "Monthly health report by email",
      "1 hour of changes a month",
      "Reply within 2 business days",
    ],
  },
  {
    name: "Small changes",
    price: 75,
    summary: "For teams that want regular tweaks as they go.",
    features: [
      "Everything in Keep it running",
      "2 hours of changes a month",
      "Reply by the next business day",
      "Unused hours roll over one month",
    ],
    featured: true,
  },
  {
    name: "Room to grow",
    price: 100,
    summary: "For software that keeps growing with your business.",
    features: [
      "Everything in Small changes",
      "3 hours of changes or new features a month",
      "Same-day reply on business days",
      "Unused hours roll over one month",
      "Optional monthly check-in call",
    ],
  },
];

export const planTerms = [
  "Pay for the build only when you're happy",
  "Fixed price agreed up front",
  "Cancel your plan anytime",
  "The code is yours once it's paid for",
];
