//artifacts/mindmap/client.tsx
import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  DownloadIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
  // ZoomInIcon,
  // ZoomOutIcon,
  CenterIcon,
  ExpandIcon,
  // CollapseIcon,
  FileTextIcon,
} from '@/components/icons';
import { MindMapEditor } from '@/components/mindmap-editor';
import { toast } from 'sonner';

type Metadata = any;

export const mindmapArtifact = new Artifact<'mindmap', Metadata>({
  kind: 'mindmap',
  description: 'Interactive mind map with drag-and-drop nodes, zoom controls, and export capabilities',
  initialize: async () => {},
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'mindmap-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <MindMapEditor
        content={content}
        saveContent={onSaveContent}
        status={status}
        isCurrentVersion={isCurrentVersion}
        currentVersionIndex={currentVersionIndex}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CopyIcon />,
      description: 'Copy as JSON',
      onClick: ({ content }) => {
        try {
          const mindmapData = JSON.parse(content);
          navigator.clipboard.writeText(JSON.stringify(mindmapData, null, 2));
          toast.success('Mind map data copied to clipboard!');
        } catch (error) {
          toast.error('Failed to copy mind map data');
        }
      },
    },
    {
      icon: <DownloadIcon />,
      description: 'Export as PNG',
      onClick: ({ content }) => {
        // This will be handled by the MindMapEditor component
        const event = new CustomEvent('export-mindmap', { 
          detail: { format: 'png', content } 
        });
        window.dispatchEvent(event);
      },
    },
    {
      icon: <FileTextIcon />,
      description: 'Export as SVG',
      onClick: ({ content }) => {
        const event = new CustomEvent('export-mindmap', { 
          detail: { format: 'svg', content } 
        });
        window.dispatchEvent(event);
      },
    },
  ],
  toolbar: [
    {
      description: 'Enhance and expand mind map',
      icon: <SparklesIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you please enhance and expand this mind map with more detailed branches and connections?',
        });
      },
    },
    {
      description: 'Reorganize structure',
      icon: <CenterIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you please reorganize this mind map structure for better clarity and flow?',
        });
      },
    },
    {
      description: 'Add visual themes',
      icon: <ExpandIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you please add color themes and visual enhancements to make this mind map more engaging?',
        });
      },
    },
  ],
});