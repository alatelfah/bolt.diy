import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { useState } from 'react';
import { streamingState } from '~/lib/stores/streaming';
import { ExportChatButton } from '~/components/chat/chatExportAndImport/ExportChatButton';
import { useChatHistory } from '~/lib/persistence';
import { DeployButton } from '~/components/deploy/DeployButton';

interface HeaderActionButtonsProps {
  chatStarted: boolean;
}

export function HeaderActionButtons({ chatStarted }: HeaderActionButtonsProps) {
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const isStreaming = useStore(streamingState);
  const { exportChat } = useChatHistory();

  const shouldShowButtons = !isStreaming && activePreview;

  return (
    <div className="flex items-center gap-3">
      {chatStarted && shouldShowButtons && (
        <div className="animate-fade-in-up">
          <ExportChatButton exportChat={exportChat} />
        </div>
      )}
      {shouldShowButtons && (
        <div className="animate-fade-in-up stagger-1">
          <DeployButton />
        </div>
      )}
      
      {/* Enhanced Visual Separator */}
      {shouldShowButtons && (
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-bolt-elements-borderColor to-transparent opacity-50" />
      )}
      
      {/* Status Indicator */}
      {isStreaming && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-sm text-accent font-medium">Processing...</span>
        </div>
      )}
    </div>
  );
}
