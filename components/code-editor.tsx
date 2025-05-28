'use client';

import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, Transaction } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import { foldGutter, bracketMatching } from '@codemirror/language';
import { search } from '@codemirror/search';
import { autocompletion } from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { linter, lintGutter } from '@codemirror/lint';
import { formatWithPrettier } from './code-formatting';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Suggestion } from '@/lib/db/schema';
import { Button } from './ui/button';
import { SearchIcon, FormatIcon, SettingsIcon } from './icons';
import { CommandMenu } from './command-menu';

type Language = 'python' | 'javascript' | 'typescript' | 'html' | 'css';

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<Suggestion>;
  language?: Language;
};

const languageExtensions = {
  python: python(),
  javascript: javascript({ typescript: true }),
  typescript: javascript({ typescript: true }),
  html: html(),
  css: css(),
};

function PureCodeEditor({ content, onSaveContent, status, language = 'python' }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const startState = EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          lineNumbers(),
          foldGutter(),
          search(),
          bracketMatching(),
          autocompletion(),
          lintGutter(),
          keymap.of([
            ...defaultKeymap,
            indentWithTab,
            { key: 'Mod-f', run: () => { setShowSearch(true); return true; } },
            { key: 'Mod-k', run: () => { setShowCommandMenu(true); return true; } },
            { key: 'Mod-s', run: () => { formatCode(); return true; } },
          ]),
          languageExtensions[language],
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const transaction = update.transactions.find(
                (tr) => !tr.annotation(Transaction.remote),
              );

              if (transaction) {
                const newContent = update.state.doc.toString();
                onSaveContent(newContent, true);
              }
            }
          }),
        ],
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [language]);

  const formatCode = async () => {
    if (editorRef.current) {
      const formatted = await formatWithPrettier(editorRef.current.state.doc.toString(), language);
      const transaction = editorRef.current.state.update({
        changes: {
          from: 0,
          to: editorRef.current.state.doc.length,
          insert: formatted,
        },
      });
      editorRef.current.dispatch(transaction);
    }
  };

  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === 'streaming' || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        });

        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status]);

  return (
    <div className="relative not-prose w-full pb-[calc(80dvh)]">
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(true)}
          className="h-8 w-8"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={formatCode}
          className="h-8 w-8"
        >
          <FormatIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCommandMenu(true)}
          className="h-8 w-8"
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </div>
      <div ref={containerRef} className="text-sm" />
      {showCommandMenu && (
        <CommandMenu
          onClose={() => setShowCommandMenu(false)}
          onFormat={formatCode}
          onSearch={() => setShowSearch(true)}
        />
      )}
    </div>
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex) return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === 'streaming' && nextProps.status === 'streaming') return false;
  if (prevProps.content !== nextProps.content) return false;
  if (prevProps.language !== nextProps.language) return false;

  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);
