import { 
  WebhookAction, 
  PerformedBy, 
  WebhookPayload,
  UserWebhookData,
  InfluencerWebhookData,
  RankingWebhookData,
  DocumentWebhookData,
  ContentWebhookData,
  SalesLeadsWebhookData
} from '@/types/webhook';

// Simple user type for webhook purposes
interface WebhookUser {
  id?: string;
  name?: string;
  email?: string;
}

// Webhook URLs for n8n endpoints
const WEBHOOK_URLS = {
  users: 'https://projetolm-n8n.8x0hqh.easypanel.host/webhook/32340741-ad1b-4902-a132-77836f5f6790',
  influencers: 'https://projetolm-n8n.8x0hqh.easypanel.host/webhook/44df79ea-4bc8-4577-b1b7-c89dfbe13137',
  ranking: 'https://projetolm-n8n.8x0hqh.easypanel.host/webhook/1c63cfab-1367-401b-8375-9ffe96117d80',
  documents: 'https://projetolm-n8n.8x0hqh.easypanel.host/webhook/1c314601-f634-42e5-9b92-88f1b160118f',
  contents: 'https://projetolm-n8n.8x0hqh.easypanel.host/webhook/content-webhook-placeholder',
  salesLeads: 'https://projetolm-n8n.8x0hqh.easypanel.host/webhook/4ad33a59-41d1-4cd2-a18c-49b948d9702b',
};

// Helper to create PerformedBy from User
function createPerformedBy(user: WebhookUser | null | undefined): PerformedBy {
  if (!user) {
    return {
      id: 'unknown',
      name: 'Sistema',
      email: 'sistema@liberdademedica.com',
    };
  }
  return {
    id: user.id || 'unknown',
    name: user.name || 'Sistema',
    email: user.email || 'sistema@liberdademedica.com',
  };
}

// Base webhook sending function
async function sendWebhook<T>(url: string, payload: WebhookPayload<T>): Promise<void> {
  try {
    console.log('Sending webhook to:', url);
    console.log('Payload:', payload);
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });
    
    console.log('Webhook sent successfully');
  } catch (error) {
    console.error('Error sending webhook:', error);
    // Don't throw - webhooks should not block UI
  }
}

// User webhook
export async function sendUserWebhook(
  action: WebhookAction,
  userData: UserWebhookData,
  performedByUser: WebhookUser | null | undefined
): Promise<void> {
  const payload: WebhookPayload<UserWebhookData> = {
    action,
    timestamp: new Date().toISOString(),
    performedBy: createPerformedBy(performedByUser),
    data: userData,
  };
  
  await sendWebhook(WEBHOOK_URLS.users, payload);
}

// Influencer webhook
export async function sendInfluencerWebhook(
  action: WebhookAction,
  influencerData: InfluencerWebhookData,
  performedByUser: WebhookUser | null | undefined
): Promise<void> {
  const payload: WebhookPayload<InfluencerWebhookData> = {
    action,
    timestamp: new Date().toISOString(),
    performedBy: createPerformedBy(performedByUser),
    data: influencerData,
  };
  
  await sendWebhook(WEBHOOK_URLS.influencers, payload);
}

// Ranking webhook
export async function sendRankingWebhook(
  action: WebhookAction,
  performanceData: RankingWebhookData,
  performedByUser: WebhookUser | null | undefined
): Promise<void> {
  const payload: WebhookPayload<RankingWebhookData> = {
    action,
    timestamp: new Date().toISOString(),
    performedBy: createPerformedBy(performedByUser),
    data: performanceData,
  };
  
  await sendWebhook(WEBHOOK_URLS.ranking, payload);
}

// Document webhook
export async function sendDocumentWebhook(
  action: WebhookAction,
  documentData: DocumentWebhookData,
  performedByUser: WebhookUser | null | undefined
): Promise<void> {
  const payload: WebhookPayload<DocumentWebhookData> = {
    action,
    timestamp: new Date().toISOString(),
    performedBy: createPerformedBy(performedByUser),
    data: documentData,
  };
  
  await sendWebhook(WEBHOOK_URLS.documents, payload);
}

// Content webhook
export async function sendContentWebhook(
  action: WebhookAction,
  contentData: ContentWebhookData,
  performedByUser: WebhookUser | null | undefined
): Promise<void> {
  const payload: WebhookPayload<ContentWebhookData> = {
    action,
    timestamp: new Date().toISOString(),
    performedBy: createPerformedBy(performedByUser),
    data: contentData,
  };
  
  await sendWebhook(WEBHOOK_URLS.contents, payload);
}

// Sales/Leads webhook
export async function sendSalesLeadsWebhook(
  action: WebhookAction,
  salesLeadsData: SalesLeadsWebhookData,
  performedByUser: WebhookUser | null | undefined
): Promise<void> {
  const payload: WebhookPayload<SalesLeadsWebhookData> = {
    action,
    timestamp: new Date().toISOString(),
    performedBy: createPerformedBy(performedByUser),
    data: salesLeadsData,
  };
  
  await sendWebhook(WEBHOOK_URLS.salesLeads, payload);
}
