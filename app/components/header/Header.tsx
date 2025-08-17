import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames(
        'flex items-center px-6 border-b h-[var(--header-height)] backdrop-blur-sm bg-bolt-elements-bg-depth-1/80 transition-all duration-300',
        {
          'border-transparent shadow-none': !chat.started,
          'border-bolt-elements-borderColor shadow-bolt-elements-shadow-soft': chat.started,
        }
      )}
    >
      {/* Enhanced Logo Section */}
      <div className="flex items-center gap-3 z-logo text-bolt-elements-textPrimary cursor-pointer group">
        <div className="relative">
          <div className="i-ph:sidebar-simple-duotone text-xl text-accent transition-all duration-300 group-hover:scale-110 group-hover:text-accent-600" />
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <a 
          href="/" 
          className="relative text-2xl font-bold text-accent flex items-center transition-all duration-300 hover:scale-105"
        >
          <img src="/logo-light-styled.png" alt="logo" className="w-[90px] inline-block dark:hidden drop-shadow-sm" />
          <img src="/logo-dark-styled.png" alt="logo" className="w-[90px] inline-block hidden dark:block drop-shadow-sm" />
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-accent/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </a>
      </div>

      {/* Enhanced Chat Description and Actions */}
      {chat.started && (
        <>
          <span className="flex-1 px-6 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>
              {() => (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolt-elements-bg-depth-2/50 backdrop-blur-sm border border-bolt-elements-borderColor/50">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <ChatDescription />
                </div>
              )}
            </ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="flex items-center gap-2">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </>
      )}

      {/* Enhanced Visual Elements */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bolt-elements-borderColor to-transparent opacity-50" />
    </header>
  );
}
