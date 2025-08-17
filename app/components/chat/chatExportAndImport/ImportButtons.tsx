import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { ImportFolderButton } from '~/components/chat/ImportFolderButton';
import { Button } from '~/components/ui/Button';
import { classNames } from '~/utils/classNames';

type ChatData = {
  messages?: Message[]; // Standard Bolt format
  description?: string; // Optional description
};

export function ImportButtons(importChat: ((description: string, messages: Message[]) => Promise<void>) | undefined) {
  return (
    <div className="flex flex-col items-center justify-center w-auto">
      <input
        type="file"
        id="chat-import"
        className="hidden"
        accept=".json"
        onChange={async (e) => {
          const file = e.target.files?.[0];

          if (file && importChat) {
            try {
              const reader = new FileReader();

              reader.onload = async (e) => {
                try {
                  const content = e.target?.result as string;
                  const data = JSON.parse(content) as ChatData;

                  // Standard format
                  if (Array.isArray(data.messages)) {
                    await importChat(data.description || 'Imported Chat', data.messages);
                    toast.success('Chat imported successfully');

                    return;
                  }

                  toast.error('Invalid chat file format');
                } catch (error: unknown) {
                  if (error instanceof Error) {
                    toast.error('Failed to parse chat file: ' + error.message);
                  } else {
                    toast.error('Failed to parse chat file');
                  }
                }
              };
              reader.onerror = () => toast.error('Failed to read chat file');
              reader.readAsText(file);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Failed to import chat');
            }
            e.target.value = ''; // Reset file input
          } else {
            toast.error('Something went wrong');
          }
        }}
      />
      <div className="flex flex-col items-center gap-6 max-w-2xl text-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">
            Import your work
          </h3>
          <p className="text-sm text-bolt-elements-textSecondary">
            Continue from where you left off
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button
            onClick={() => {
              const input = document.getElementById('chat-import');
              input?.click();
            }}
            variant="default"
            size="lg"
            className={classNames(
              'gap-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700',
              'text-white font-medium',
              'h-12 px-6 py-3 min-w-[140px] justify-center',
              'transition-all duration-300 ease-in-out hover:scale-105',
              'shadow-bolt-elements-shadow-soft hover:shadow-bolt-elements-shadow-medium',
              'rounded-xl',
            )}
          >
            <span className="i-ph:upload-simple w-5 h-5" />
            Import Chat
          </Button>
          <ImportFolderButton
            importChat={importChat}
            className={classNames(
              'gap-3 bg-gradient-to-r from-bolt-elements-bg-depth-2 to-bolt-elements-bg-depth-3',
              'text-bolt-elements-textPrimary font-medium',
              'hover:from-accent-50 dark:hover:from-accent-900/20 hover:to-accent-100 dark:hover:to-accent-800/20',
              'border border-bolt-elements-borderColor/50 hover:border-accent-200/50 dark:hover:border-accent-700/50',
              'h-12 px-6 py-3 min-w-[140px] justify-center',
              'transition-all duration-300 ease-in-out hover:scale-105',
              'shadow-bolt-elements-shadow-soft hover:shadow-bolt-elements-shadow-medium',
              'rounded-xl',
            )}
          />
        </div>
      </div>
    </div>
  );
}
