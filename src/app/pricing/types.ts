export interface FeatureItem {
  name: string;
  value: string;
}

export interface FeatureSectionProps {
  title: string;
  features: FeatureItem[];
  color: "blue" | "green" | "yellow" | "purple";
}

export interface SubscriptionProperties {
  plan: "Plus" | "Pro";
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  canceled_at?: number;
}

export interface Plan {
  name: string;
  price: string;
  currency: string;
  period: string;
  description: string;
  gradient: string;
  borderGradient: string;
  buttonStyle: string;
  popular: boolean;
  features: {
    account: FeatureItem[];
    content: FeatureItem[];
    integrations: FeatureItem[];
    premium: {
      name: string;
      included: boolean;
    }[];
  };
}
