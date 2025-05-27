//artifacts/mindmap/server.ts
import { myProvider } from '@/lib/ai/providers';
import { mindmapPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';

const MindMapNodeSchema: z.ZodType = z.object({
  id: z.string(),
  text: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  children: z.array(z.lazy(() => MindMapNodeSchema)).optional(),
  collapsed: z.boolean().optional(),
  color: z.string().optional(),
  fontSize: z.number().optional(),
  shape: z.enum(['rectangle', 'ellipse', 'diamond']).optional(),
  parent: z.string().optional(),
  level: z.number(),
});

const MindMapSchema = z.object({
  mindmap: MindMapNodeSchema.describe('Complete mind map structure with hierarchical nodes'),
});

export const mindmapDocumentHandler = createDocumentHandler<'mindmap'>({
  kind: 'mindmap',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: mindmapPrompt,
      prompt: title,
      schema: MindMapSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { mindmap } = object;

        if (mindmap) {
          const mindmapJson = JSON.stringify(mindmap, null, 2);
          
          dataStream.writeData({
            type: 'mindmap-delta',
            content: mindmapJson,
          });

          draftContent = mindmapJson;
        }
      }
    }

    // Ensure we have final content
    dataStream.writeData({
      type: 'mindmap-delta',
      content: draftContent,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'mindmap'),
      prompt: description,
      schema: MindMapSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { mindmap } = object;

        if (mindmap) {
          const mindmapJson = JSON.stringify(mindmap, null, 2);
          
          dataStream.writeData({
            type: 'mindmap-delta',
            content: mindmapJson,
          });

          draftContent = mindmapJson;
        }
      }
    }

    return draftContent;
  },
});