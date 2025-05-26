import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  generateText,
  generateObject,
  Output,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
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
        'meta-llama/llama-4-scout-17b-16e-instruct': chatModel, // Use test stub for test env
        'deepseek-r1-distill-llama-70b': chatModel, // Use test stub for test env
        'gemini-2.0-flash': chatModel, // Use test stub for test env
        'gpt-4-turbo': chatModel, // Use test stub for test env
        'gpt-4.1': chatModel, // Use test stub for test env
        'o4-mini': chatModel, // Use test stub for test env
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
        'meta-llama/llama-4-scout-17b-16e-instruct': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        'deepseek-r1-distill-llama-70b': wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.0-flash': wrapLanguageModel({
          model: google('gemini-2.0-flash'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gpt-4-turbo': wrapLanguageModel({
          model: openai('gpt-4-turbo'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gpt-4.1': wrapLanguageModel({
          model: openai.responses('gpt-4.1'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'o4-mini': wrapLanguageModel({
          model: openai.responses('o4-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.5-pro-preview-05-06': wrapLanguageModel({
          model: google('gemini-2.5-pro-preview-05-06'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.5-flash-preview-04-17': wrapLanguageModel({
          model: google('gemini-2.5-flash-preview-04-17'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.5-pro-exp-03-25': wrapLanguageModel({
          model: google('gemini-2.5-pro-exp-03-25'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.0-flash-preview-image-generation': wrapLanguageModel({
          model: google('gemini-2.0-flash-preview-image-generation'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'claude-3-haiku-20240307': wrapLanguageModel({
          model: anthropic('claude-3-haiku-20240307'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'claude-4-opus-20250514': wrapLanguageModel({
          model: anthropic('claude-4-opus-20250514'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'claude-4-sonnet-20250514': wrapLanguageModel({
          model: anthropic('claude-4-sonnet-20250514'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'claude-3-7-sonnet-20250219': wrapLanguageModel({
          model: anthropic('claude-3-7-sonnet-20250219'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'claude-3-5-sonnet-20241022': wrapLanguageModel({
          model: anthropic('claude-3-5-sonnet-20241022'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });
