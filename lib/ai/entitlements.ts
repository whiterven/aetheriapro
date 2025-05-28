import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'deepseek-r1-distill-llama-70b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'gemini-2.5-flash-preview-04-17',
      'claude-3-5-sonnet-20241022',
      'gpt-4.1',
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
  pro: {
    maxMessagesPerDay: 50,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'deepseek-r1-distill-llama-70b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'gemini-2.5-pro-preview-05-06',
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.5-pro-exp-03-25',
      'claude-4-opus-20250514',
      'claude-4-sonnet-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini',
    ],
  },

  expert: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'deepseek-r1-distill-llama-70b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'gemini-2.5-pro-preview-05-06',
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.5-pro-exp-03-25',
      'claude-4-opus-20250514',
      'claude-4-sonnet-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini',
    ],
  },
};
