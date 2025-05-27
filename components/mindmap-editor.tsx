//components/mindmap-editor.tsx
'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { ZoomInIcon, ZoomOutIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { CollapseIcon, CenterIcon, ExpandIcon } from './icons'
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

type MindMapNode = {
  id: string;
  text: string;
  x?: number;
  y?: number;
  children?: MindMapNode[];
  collapsed?: boolean;
  color?: string;
  fontSize?: number;
  shape?: 'rectangle' | 'ellipse' | 'diamond';
  parent?: string;
  level: number;
};

type MindMapEditorProps = {
  content: string;
  saveContent: (content: string, isCurrentVersion: boolean) => void;
  status: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
};

const DEFAULT_MINDMAP: MindMapNode = {
  id: 'root',
  text: 'Main Topic',
  x: 400,
  y: 300,
  children: [],
  color: '#3b82f6',
  fontSize: 16,
  shape: 'ellipse',
  level: 0,
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const PureMindMapEditor = ({
  content,
  saveContent,
  status,
  isCurrentVersion,
}: MindMapEditorProps) => {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);

  const mindmapData = useMemo(() => {
    if (!content) return DEFAULT_MINDMAP;
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      return DEFAULT_MINDMAP;
    }
  }, [content]);

  const [localData, setLocalData] = useState<MindMapNode>(mindmapData);

  useEffect(() => {
    setLocalData(mindmapData);
  }, [mindmapData]);

  const saveData = useCallback(() => {
    const dataToSave = JSON.stringify(localData, null, 2);
    saveContent(dataToSave, true);
  }, [localData, saveContent]);

  useEffect(() => {
    saveData();
  }, [localData, saveData]);

  const flattenNodes = useCallback((node: MindMapNode, level = 0): MindMapNode[] => {
    const nodes = [{ ...node, level }];
    if (node.children && !node.collapsed) {
      node.children.forEach(child => {
        nodes.push(...flattenNodes({ ...child, level: level + 1 }));
      });
    }
    return nodes;
  }, []);

  const getAllConnections = useCallback((node: MindMapNode): Array<{from: MindMapNode, to: MindMapNode}> => {
    const connections: Array<{from: MindMapNode, to: MindMapNode}> = [];
    if (node.children && !node.collapsed) {
      node.children.forEach(child => {
        connections.push({ from: node, to: child });
        connections.push(...getAllConnections(child));
      });
    }
    return connections;
  }, []);

  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    const updateNode = (node: MindMapNode): MindMapNode => {
      if (node.id === nodeId) {
        return { ...node, x, y };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        };
      }
      return node;
    };
    setLocalData(prev => updateNode(prev));
  }, []);

  const addNode = useCallback((parentId: string) => {
    const newNode: MindMapNode = {
      id: `node_${Date.now()}`,
      text: 'New Node',
      children: [],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      fontSize: 14,
      shape: 'rectangle',
      level: 0,
    };

    const addToParent = (node: MindMapNode): MindMapNode => {
      if (node.id === parentId) {
        const children = node.children || [];
        const angle = (children.length * 60) * (Math.PI / 180);
        const distance = 150;
        newNode.x = (node.x || 0) + Math.cos(angle) * distance;
        newNode.y = (node.y || 0) + Math.sin(angle) * distance;
        newNode.level = node.level + 1;
        
        return {
          ...node,
          children: [...children, newNode],
          collapsed: false
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addToParent)
        };
      }
      return node;
    };

    setLocalData(prev => addToParent(prev));
    setSelectedNode(newNode.id);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === 'root') return;

    const removeNode = (node: MindMapNode): MindMapNode => {
      if (node.children) {
        return {
          ...node,
          children: node.children.filter(child => child.id !== nodeId).map(removeNode)
        };
      }
      return node;
    };

    setLocalData(prev => removeNode(prev));
    setSelectedNode(null);
  }, []);

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    const toggleNode = (node: MindMapNode): MindMapNode => {
      if (node.id === nodeId) {
        return { ...node, collapsed: !node.collapsed };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(toggleNode)
        };
      }
      return node;
    };
    setLocalData(prev => toggleNode(prev));
  }, []);

  const updateNodeText = useCallback((nodeId: string, text: string) => {
    const updateNode = (node: MindMapNode): MindMapNode => {
      if (node.id === nodeId) {
        return { ...node, text };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        };
      }
      return node;
    };
    setLocalData(prev => updateNode(prev));
  }, []);

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const expandAll = useCallback(() => {
    const expandNode = (node: MindMapNode): MindMapNode => ({
      ...node,
      collapsed: false,
      children: node.children?.map(expandNode)
    });
    setLocalData(prev => expandNode(prev));
  }, []);

  const collapseAll = useCallback(() => {
    const collapseNode = (node: MindMapNode): MindMapNode => ({
      ...node,
      collapsed: node.id !== 'root',
      children: node.children?.map(collapseNode)
    });
    setLocalData(prev => collapseNode(prev));
  }, []);

  // Export functionality
  useEffect(() => {
    const handleExport = (event: CustomEvent) => {
      const { format } = event.detail;
      const svg = svgRef.current;
      if (!svg) return;

      if (format === 'png') {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 1200;
        canvas.height = 800;
        
        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'mindmap.png';
              a.click();
              URL.revokeObjectURL(url);
            }
          });
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      } else if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindmap.svg';
        a.click();
        URL.revokeObjectURL(url);
      }
    };

    window.addEventListener('export-mindmap', handleExport as EventListener);
    return () => window.removeEventListener('export-mindmap', handleExport as EventListener);
  }, []);

  const nodes = flattenNodes(localData);
  const connections = getAllConnections(localData);

  return (
    <div className="relative size-full">
      <div
        ref={containerRef}
        className="relative size-full overflow-hidden"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <svg
          ref={svgRef}
          className="size-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
          }}
          viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${600 / zoom}`}
        >
          {/* Connections */}
          <g className="connections">
            {connections.map(({ from, to }, index) => (
              <line
                key={`connection-${index}`}
                x1={from.x || 0}
                y1={from.y || 0}
                x2={to.x || 0}
                y2={to.y || 0}
                stroke={theme === 'dark' ? '#4a5568' : '#a0aec0'}
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isEditing = editingNode === node.id;
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x || 0}, ${node.y || 0})`}
                  style={{ cursor: 'pointer' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedNode(node.id);
                    setSelectedNode(node.id);
                  }}
                  onDoubleClick={() => {
                    setEditingNode(node.id);
                    setEditText(node.text);
                  }}
                >
                  {/* Node Shape */}
                  {node.shape === 'ellipse' ? (
                    <ellipse
                      rx="60"
                      ry="30"
                      fill={node.color || '#3b82f6'}
                      stroke={isSelected ? '#fbbf24' : 'transparent'}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                  ) : node.shape === 'diamond' ? (
                    <polygon
                      points="-50,0 0,-25 50,0 0,25"
                      fill={node.color || '#3b82f6'}
                      stroke={isSelected ? '#fbbf24' : 'transparent'}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                  ) : (
                    <rect
                      x="-60"
                      y="-20"
                      width="120"
                      height="40"
                      rx="8"
                      fill={node.color || '#3b82f6'}
                      stroke={isSelected ? '#fbbf24' : 'transparent'}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                  )}

                  {/* Node Text */}
                  {isEditing ? (
                    <foreignObject x="-55" y="-10" width="110" height="20">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => {
                          updateNodeText(node.id, editText);
                          setEditingNode(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateNodeText(node.id, editText);
                            setEditingNode(null);
                          }
                          if (e.key === 'Escape') {
                            setEditingNode(null);
                          }
                        }}
                        className="w-full h-full bg-transparent text-white text-center text-sm outline-none"
                        autoFocus
                      />
                    </foreignObject>
                  ) : (
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill="white"
                      fontSize={node.fontSize || 14}
                      fontWeight="600"
                    >
                      {node.text}
                    </text>
                  )}

                  {/* Collapse/Expand Button */}
                  {node.children && node.children.length > 0 && (
                    <circle
                      cx="45"
                      cy="0"
                      r="8"
                      fill={theme === 'dark' ? '#374151' : '#e5e7eb'}
                      stroke={node.color || '#3b82f6'}
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNodeCollapse(node.id);
                      }}
                    />
                  )}
                  {node.children && node.children.length > 0 && (
                    <text
                      x="45"
                      y="0"
                      textAnchor="middle"
                      dy="0.35em"
                      fontSize="10"
                      fill={theme === 'dark' ? '#ffffff' : '#000000'}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNodeCollapse(node.id);
                      }}
                    >
                      {node.collapsed ? '+' : '−'}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 right-4 flex flex-col gap-2"
            >
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={zoomIn}
              >
                <ZoomInIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={zoomOut}
              >
                <ZoomOutIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={resetView}
              >
                <CenterIcon size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={expandAll}
              >
                <ExpandIcon />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={collapseAll}
              >
                <CollapseIcon />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Node Controls */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg p-2 border flex gap-2">
          <button
            onClick={() => addNode(selectedNode)}
            className="p-2 hover:bg-muted rounded transition-colors text-green-600"
            title="Add Child Node"
          >
            <PlusIcon className="size-4" />
          </button>
          {selectedNode !== 'root' && (
            <button
              onClick={() => deleteNode(selectedNode)}
              className="p-2 hover:bg-muted rounded transition-colors text-red-600"
              title="Delete Node"
            >
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* Status indicator */}
      {status === 'streaming' && (
        <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          Updating...
        </div>
      )}
    </div>
  );
};

function areEqual(prevProps: MindMapEditorProps, nextProps: MindMapEditorProps) {
  return (
    prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
    prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
    !(prevProps.status === 'streaming' && nextProps.status === 'streaming') &&
    prevProps.content === nextProps.content &&
    prevProps.saveContent === nextProps.saveContent
  );
}

export const MindMapEditor = memo(PureMindMapEditor, areEqual);