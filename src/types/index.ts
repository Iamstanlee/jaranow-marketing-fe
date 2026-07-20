export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  washCount: number;
  maxClothes: number;
  isPopular?: boolean;
}

export interface TestimonialData {
  id: string;
  name: string;
  location: string;
  message: string;
  rating: number;
  avatar?: string;
}
