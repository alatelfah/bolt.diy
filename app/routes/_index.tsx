import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [{ title: 'Hero Builder' }, { name: 'description', content: 'Talk with Hero Builder, an AI assistant from StackBlitz' }];
};

export const loader = () => json({});

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1 relative overflow-hidden">
      {/* Enhanced Background with Multiple Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-bolt-elements-bg-depth-1 via-bolt-elements-bg-depth-2 to-bolt-elements-bg-depth-3" />
      <BackgroundRays />
      
      {/* Floating Elements for Visual Interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-accent-400/20 to-accent-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content with Enhanced Layout */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Welcome Section - Only shown when chat hasn't started */}
          <ClientOnly fallback={<BaseChat />}>
            {() => {
              // This will be handled by the Chat component
              return <Chat />;
            }}
          </ClientOnly>
        </div>
      </div>

      {/* Enhanced Footer Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bolt-elements-bg-depth-1 to-transparent pointer-events-none" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--bolt-elements-textPrimary) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
    </div>
  );
}
