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
    price: 25,
    summary: "For software that's done and just needs looking after.",
    features: [
      "Monitoring and alerts if something breaks",
      "Security and software updates",
      "Bug fixes",
    ],
  },
  {
    name: "Small changes",
    price: 50,
    summary: "For teams that want small tweaks as they go.",
    features: [
      "Everything in Keep it running",
      "Small tweaks each month, like new fields, reports or wording",
    ],
    featured: true,
  },
  {
    name: "Room to grow",
    price: 100,
    summary: "For software that keeps growing with your business.",
    features: [
      "Everything in Small changes",
      "Time each month for new features",
    ],
  },
];

export const planTerms = [
  "Month to month",
  "First month free",
  "Cancel anytime",
  "The code is yours",
  "Extra work billed hourly",
];
