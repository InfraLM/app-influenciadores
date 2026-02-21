export type UserRole = 'admin' | 'team' | 'influencer';

export type InfluencerStatus = 'active' | 'ended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  influencerId?: string;
}

export interface Influencer {
  id: string;
  // Required fields
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  pixKey: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  couponPreference: string;
  
  // Conditional fields
  instagram?: string;
  university?: string;
  period?: string;
  isDoctor: boolean;
  yearsAsMedic?: number;
  
  // LM Team only fields
  generatedCoupon?: string;
  referralLink?: string;
  contractUrl?: string;
  partnershipStartDate?: string;
  partnershipEndDate?: string;
  postingDates?: string[];
  
  // Status
  status: InfluencerStatus;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = 'feed' | 'story';

export interface Content {
  id: string;
  influencerId: string;
  monthYear: string; // Format: YYYY-MM
  type: ContentType;
  postDate: string;
  product: string;
  reach: number;
  interactions: number;
  notes?: string;
  contentLink?: string; // Required for feed
  proofUrl: string;
  isExtra: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyPerformance {
  id: string;
  influencerId: string;
  monthYear: string;
  leads: number;
  sales: number;
  qualitativeNotes?: string;
  
  // Ranking scores
  contentQualityScore: number; // 0-3
  salesScore: number; // 0-4
  engagementScore: number; // 0-2
  partnerPostureScore: number; // 0-1
  bonusScore: number; // 0-3
  totalScore: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: 'briefing_institutional' | 'rules';
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RankingEntry {
  position: number;
  influencerId: string;
  influencerName: string;
  instagram?: string;
  totalScore: number;
  isTopThree: boolean;
}

export interface DashboardStats {
  totalActiveInfluencers: number;
  contentRegisteredThisMonth: number;
  totalLeadsThisMonth: number;
  totalSalesThisMonth: number;
  topThree: RankingEntry[];
}
