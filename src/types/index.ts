export interface WaitlistFormData {
  name: string;
  phoneNumber: string;
  laundryFrequency: 'once-week' | 'twice-week' | 'once-month' | 'multiple-times-week' | 'irregular';
  location: string;
  selectedPlan?: string;
}

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

export interface AirtableResponse {
  success: boolean;
  message: string;
  recordId?: string;
}