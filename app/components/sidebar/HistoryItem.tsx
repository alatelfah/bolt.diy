import { useParams } from '@remix-run/react';
import { classNames } from '~/utils/classNames';
import { type ChatHistoryItem } from '~/lib/persistence';
import WithTooltip from '~/components/ui/Tooltip';
import { useEditChatDescription } from '~/lib/hooks';
import { forwardRef, type ForwardedRef, useCallback } from 'react';
import { Checkbox } from '~/components/ui/Checkbox';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onDuplicate?: (id: string) => void;
  exportChat: (id?: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

export function HistoryItem({
  item,
  onDelete,
  onDuplicate,
  exportChat,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}: HistoryItemProps) {
  const { id: urlId } = useParams();
  const isActiveChat = urlId === item.urlId;

  const { editing, handleChange, handleBlur, handleSubmit, handleKeyDown, currentDescription, toggleEditMode } =
    useEditChatDescription({
      initialDescription: item.description,
      customChatId: item.id,
      syncWithGlobalStore: isActiveChat,
    });

  const handleItemClick = useCallback(
    (e: React.MouseEvent) => {
      if (selectionMode) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Item clicked in selection mode:', item.id);
        onToggleSelection?.(item.id);
      }
    },
    [selectionMode, item.id, onToggleSelection],
  );

  const handleCheckboxChange = useCallback(() => {
    console.log('Checkbox changed for item:', item.id);
    onToggleSelection?.(item.id);
  }, [item.id, onToggleSelection]);

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('Delete button clicked for item:', item.id);

      if (onDelete) {
        onDelete(event as unknown as React.UIEvent);
      }
    },
    [onDelete, item.id],
  );

  return (
    <div
      className={classNames(
        'group rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-800/30 overflow-hidden flex justify-between items-center px-4 py-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-bolt-elements-shadow-soft',
        { 'text-gray-900 dark:text-white bg-gradient-to-r from-accent-50/80 dark:from-accent-900/20 to-white/80 dark:to-gray-800/30 border border-accent-200/50 dark:border-accent-700/30': isActiveChat },
        { 'cursor-pointer': selectionMode },
      )}
      onClick={selectionMode ? handleItemClick : undefined}
    >
      {selectionMode && (
        <div className="flex items-center mr-3" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            id={`select-${item.id}`}
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-4 w-4 text-accent-600"
          />
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all duration-200"
            autoFocus
            value={currentDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 hover:scale-105"
          >
            Save
          </button>
        </form>
      ) : (
        <a
          href={`/chat/${item.urlId}`}
          className={classNames(
            'flex-1 flex items-center gap-3 min-w-0',
            { 'cursor-pointer': !selectionMode },
          )}
        >
          {/* Enhanced Chat Icon */}
          <div className={classNames(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300',
            isActiveChat 
              ? 'bg-accent-500 text-white shadow-bolt-elements-shadow-soft' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-accent-100 dark:group-hover:bg-accent-900/20 group-hover:text-accent-600 dark:group-hover:text-accent-400'
          )}>
            <span className="i-ph:chat-circle-text h-4 w-4" />
          </div>
          
          {/* Enhanced Text Content */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate group-hover:text-accent-700 dark:group-hover:text-accent-300 transition-colors duration-200">
              {item.description}
            </div>
            {isActiveChat && (
              <div className="text-xs text-accent-600 dark:text-accent-400 font-medium mt-1">
                Active now
              </div>
            )}
          </div>
        </a>
      )}

      {/* Enhanced Action Buttons */}
      {!editing && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <WithTooltip content="Edit description">
            <button
              onClick={toggleEditMode}
              className="p-2 text-gray-500 hover:text-accent-600 dark:text-gray-400 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <span className="i-ph:pencil-simple h-4 w-4" />
            </button>
          </WithTooltip>
          
          <WithTooltip content="Duplicate chat">
            <button
              onClick={() => onDuplicate?.(item.id)}
              className="p-2 text-gray-500 hover:text-accent-600 dark:text-gray-400 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <span className="i-ph:copy h-4 w-4" />
            </button>
          </WithTooltip>
          
          <WithTooltip content="Export chat">
            <button
              onClick={() => exportChat(item.id)}
              className="p-2 text-gray-500 hover:text-accent-600 dark:text-gray-400 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <span className="i-ph:download h-4 w-4" />
            </button>
          </WithTooltip>
          
          <WithTooltip content="Delete chat">
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <span className="i-ph:trash h-4 w-4" />
            </button>
          </WithTooltip>
        </div>
      )}
    </div>
  );
}
