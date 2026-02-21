import { Influencer, MonthlyPerformance, Document, User, Content } from './index';

export type WebhookAction = 'create' | 'update' | 'delete';

export interface PerformedBy {
  id: string;
  name: string;
  email: string;
}

export interface WebhookPayload<T> {
  action: WebhookAction;
  timestamp: string;
  performedBy: PerformedBy;
  data: T;
}

// User webhook payload data
export interface UserWebhookData {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'team' | 'influencer';
  influencerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Influencer webhook uses the full Influencer type
export type InfluencerWebhookData = Influencer;

// Ranking webhook payload data
export interface RankingWebhookData {
  id: string;
  influencerId: string;
  monthYear: string;
  contentQualityScore: number;
  salesScore: number;
  engagementScore: number;
  partnerPostureScore: number;
  bonusScore: number;
  totalScore: number;
  leads?: number;
  sales?: number;
  qualitativeNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Document webhook uses the full Document type
export type DocumentWebhookData = Document;

// Content webhook uses the full Content type
export type ContentWebhookData = Content;

// Sales/Leads webhook payload data
export interface SalesLeadsWebhookData {
  id: string;
  type: 'lead' | 'sale';
  influencerId: string;
  monthYear: string;
  quantity: number;
  notes?: string;
}
