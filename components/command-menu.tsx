import { Dialog, DialogContent } from './ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { useCallback, useEffect, useState } from 'react';

interface CommandMenuProps {
  onClose: () => void;
  onFormat: () => void;
  onSearch: () => void;
}

const commands = [
  {
    name: 'Format Code',
    shortcut: '⌘S',
    action: 'format',
  },
  {
    name: 'Search',
    shortcut: '⌘F',
    action: 'search',
  },
  {
    name: 'Toggle Line Numbers',
    shortcut: '⌘L',
    action: 'toggleLineNumbers',
  },
  {
    name: 'Toggle Word Wrap',
    shortcut: '⌘W',
    action: 'toggleWordWrap',
  },
  {
    name: 'Go to Line',
    shortcut: '⌘G',
    action: 'goToLine',
  },
  {
    name: 'Toggle Minimap',
    shortcut: '⌘M',
    action: 'toggleMinimap',
  },
];

export function CommandMenu({ onClose, onFormat, onSearch }: CommandMenuProps) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback(
    (action: string) => {
      switch (action) {
        case 'format':
          onFormat();
          break;
        case 'search':
          onSearch();
          break;
        // Add other actions as needed
      }
      setOpen(false);
      onClose();
    },
    [onFormat, onSearch, onClose],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <Command>
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Editor Commands</div>
            <CommandGroup>
              {commands.map((command) => (
                <CommandItem
                  key={command.name}
                  onSelect={() => handleSelect(command.action)}
                >
                  <span>{command.name}</span>
                  <span className="ml-auto text-muted-foreground">
                    {command.shortcut}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
} 