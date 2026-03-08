export type SubscriptionPlan = {
    name: string;
    description: string;
    maxResumes: number;
    maxApplications: number;
    features: {
      aiOptimization: boolean;
      customTemplates: boolean;
      prioritySupport: boolean;
      unlimitedStorage: boolean;
    };
  };
  
  export const SUBSCRIPTION_PLANS = {
    FREE: {
      name: "Free",
      description: "For individuals getting started",
      maxResumes: 2,
      maxApplications: 5,
      features: {
        aiOptimization: false,
        customTemplates: false,
        prioritySupport: false,
        unlimitedStorage: false,
      },
    },
    PRO: {
      name: "Pro",
      description: "For serious job seekers",
      maxResumes: Infinity, // Unlimited
      maxApplications: Infinity, // Unlimited
      features: {
        aiOptimization: true,
        customTemplates: true,
        prioritySupport: true,
        unlimitedStorage: true,
      },
    },
  } as const;
  
  export const getPlan = (isPro: boolean): SubscriptionPlan => {
    return isPro ? SUBSCRIPTION_PLANS.PRO : SUBSCRIPTION_PLANS.FREE;
  };