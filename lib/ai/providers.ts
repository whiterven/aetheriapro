import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'llama-3.1-8b-instant': chatModel, // Use test stub for test env
        'deepseek-r1-distill-llama-70b': chatModel, // Use test stub for test env
        'gemini-2.0-flash': chatModel, // Use test stub for test env
        'gemini-1.5-flash': chatModel, // Use test stub for test env
        'gemini-2.5-pro-preview-05-06': chatModel, // Use test stub for test env
        'gemini-2.5-flash-preview-04-17': chatModel, // Use test stub for test env
        'gemini-2.5-pro-exp-03-25': chatModel, // Use test stub for test env
        'claude-3-haiku-20240307': chatModel, // Use test stub for test env
        'claude-4-opus-20250514': chatModel, // Use test stub for test env
        'claude-4-sonnet-20250514': chatModel, // Use test stub for test env
        'claude-3-7-sonnet-20250219': chatModel, // Use test stub for test env
        'claude-3-5-sonnet-20241022': chatModel, // Use test stub for test env
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': xai('grok-2-vision-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'),
        'deepseek-r1-distill-llama-70b': groq('deepseek-r1-distill-llama-70b'),
        'gemini-2.0-flash': google('gemini-2.0-flash'),
        'gemini-1.5-flash': google('gemini-1.5-flash'),
        'gemini-2.5-pro-preview-05-06': google('gemini-2.5-pro-preview-05-06'),
        'gemini-2.5-flash-preview-04-17': google('gemini-2.5-flash-preview-04-17'),
        'gemini-2.5-pro-exp-03-25': google('gemini-2.5-pro-exp-03-25'),
        'gemini-2.0-flash-preview-image-generation': google('gemini-2.0-flash-preview-image-generation'), // Configured as language model
        'claude-3-haiku-20240307': anthropic('claude-3-haiku-20240307'),
        'claude-4-opus-20250514': anthropic('claude-4-opus-20250514'),
        'claude-4-sonnet-20250514': anthropic('claude-4-sonnet-20250514'),
        'claude-3-7-sonnet-20250219': anthropic('claude-3-7-sonnet-20250219'),
        'claude-3-5-sonnet-20241022': anthropic('claude-3-5-sonnet-20241022'),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });
