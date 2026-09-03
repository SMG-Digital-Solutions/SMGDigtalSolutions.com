/**
 * Submission helper for ChatWidget — mirrors leadsApi.ts/subscribeApi.ts
 * exactly: relative URL in production (same-origin via the Netlify proxy
 * rewrite), PUBLIC_ADMIN_ORIGIN override for local dev, throws on failure
 * so the widget owns its own error UI.
 */

const ADMIN_ORIGIN = import.meta.env.PUBLIC_ADMIN_ORIGIN ?? '';
const CHAT_MESSAGE_ENDPOINT = `${ADMIN_ORIGIN}/admin/api/chat/message`;

export interface SendChatMessageInput {
  conversationId?: string;
  message: string;
  visitorEmail?: string;
  requestEscalation?: boolean;
}

export interface SendChatMessageResult {
  conversationId: string;
  answer: string;
  needsEscalation: boolean;
  escalated: boolean;
  needsEmailForEscalation: boolean;
}

export async function sendChatMessage(input: SendChatMessageInput): Promise<SendChatMessageResult> {
  const response = await fetch(CHAT_MESSAGE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Chat message failed with status ${response.status}`);
  }
  return response.json();
}
